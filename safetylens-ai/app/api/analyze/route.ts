import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { analyzePhoto } from '@/lib/anthropic/analyze'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'

// Allow up to 60 seconds for AI analysis (important for Vercel deployment)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { image_base64, audit_id, media_type } = await request.json()

    if (!image_base64 || !audit_id) {
      return NextResponse.json(
        { error: 'Missing required fields: image_base64, audit_id' },
        { status: 400 }
      )
    }

    // Check plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_status, walks_used_this_month, walks_reset_at, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Inline monthly reset: if past the reset date, zero the counter
    let walksUsed = profile.walks_used_this_month
    if (profile.walks_reset_at && new Date(profile.walks_reset_at) <= new Date()) {
      const nextReset = new Date()
      nextReset.setMonth(nextReset.getMonth() + 1, 1)
      nextReset.setHours(0, 0, 0, 0)
      await supabase
        .from('profiles')
        .update({ walks_used_this_month: 0, walks_reset_at: nextReset.toISOString() })
        .eq('id', user.id)
      walksUsed = 0
    }

    const plan = profile.plan as PlanType
    const limits = PLANS[plan]?.limits

    // Check if trial expired
    if (
      profile.plan_status === 'trialing' &&
      profile.trial_ends_at &&
      new Date(profile.trial_ends_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'Trial expired. Please upgrade to continue.' },
        { status: 403 }
      )
    }

    // Check walks limit
    if (limits && limits.walks_per_month !== -1) {
      if (walksUsed >= limits.walks_per_month) {
        return NextResponse.json(
          { error: 'Monthly walk limit reached. Please upgrade your plan.' },
          { status: 403 }
        )
      }
    }

    // Enforce photos_per_walk limit
    if (limits && limits.photos_per_walk !== -1) {
      const { count } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })
        .eq('audit_id', audit_id)

      if ((count || 0) >= limits.photos_per_walk) {
        return NextResponse.json(
          {
            error: `Photo limit reached for this audit (${limits.photos_per_walk} photos). Please upgrade your plan for more.`,
            code: 'PHOTOS_LIMIT_REACHED',
          },
          { status: 403 }
        )
      }
    }

    // Call AI analysis
    const observation = await analyzePhoto(image_base64, media_type || 'image/jpeg')

    // Determine initial compliance and narrative
    const compliance = observation.best_guess
    const narrative =
      compliance === 'compliant'
        ? observation.compliant_narrative
        : observation.non_compliant_narrative
    const corrective =
      compliance === 'compliant'
        ? observation.compliant_corrective_action
        : observation.non_compliant_corrective_action
    const severity =
      compliance === 'compliant'
        ? observation.severity_if_compliant
        : observation.severity_if_non_compliant

    // Get current observation count for sort order
    const { count } = await supabase
      .from('observations')
      .select('*', { count: 'exact', head: true })
      .eq('audit_id', audit_id)

    // Save observation to database
    const { data: savedObs, error: obsError } = await supabase
      .from('observations')
      .insert({
        audit_id,
        user_id: user.id,
        sort_order: (count || 0) + 1,
        compliance,
        category: observation.category,
        osha_standard: observation.osha_standard,
        osha_description: observation.osha_description,
        narrative,
        severity,
        corrective_action: corrective,
        inspection_items: observation.inspection_items,
        compliant_narrative: observation.compliant_narrative,
        compliant_corrective_action: observation.compliant_corrective_action,
        non_compliant_narrative: observation.non_compliant_narrative,
        non_compliant_corrective_action: observation.non_compliant_corrective_action,
        severity_if_compliant: observation.severity_if_compliant,
        severity_if_non_compliant: observation.severity_if_non_compliant,
        source: 'analyze',
      })
      .select()
      .single()

    if (obsError) {
      console.error('Error saving observation:', obsError)
      return NextResponse.json(
        { error: 'Failed to save observation' },
        { status: 500 }
      )
    }

    // Upload photo to Supabase Storage (best-effort — don't fail the request if storage fails)
    try {
      const ext = (media_type || 'image/jpeg').split('/')[1] || 'jpeg'
      const storagePath = `${user.id}/${audit_id}/${savedObs.id}.${ext}`
      const buffer = Buffer.from(image_base64, 'base64')

      const { error: uploadError } = await supabase.storage
        .from('audit-photos')
        .upload(storagePath, buffer, {
          contentType: media_type || 'image/jpeg',
          upsert: false,
        })

      if (!uploadError) {
        // Generate signed URL (valid for 1 year)
        const { data: signedData } = await supabase.storage
          .from('audit-photos')
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

        if (signedData?.signedUrl) {
          await supabase
            .from('observations')
            .update({ photo_url: signedData.signedUrl })
            .eq('id', savedObs.id)

          // Include the photo_url in the response
          savedObs.photo_url = signedData.signedUrl
        }
      } else {
        console.error('Photo upload failed (non-fatal):', uploadError.message)
      }
    } catch (uploadErr) {
      console.error('Photo storage error (non-fatal):', uploadErr)
    }

    // Update audit counts
    const { data: allObs } = await supabase
      .from('observations')
      .select('compliance, severity')
      .eq('audit_id', audit_id)

    if (allObs) {
      await supabase
        .from('audits')
        .update({
          total_observations: allObs.length,
          compliant_count: allObs.filter((o) => o.compliance === 'compliant').length,
          non_compliant_count: allObs.filter((o) => o.compliance === 'non_compliant').length,
          critical_count: allObs.filter((o) => o.severity === 'Critical').length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', audit_id)
    }

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action: 'photo_analyzed',
      audit_id,
    })

    return NextResponse.json({ observation: savedObs })
  } catch (error) {
    console.error('Analysis error:', error)

    // Return more specific error messages
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('timeout') || message.includes('Timeout')) {
      return NextResponse.json(
        { error: 'Analysis timed out. Please try again.', code: 'TIMEOUT', retryable: true },
        { status: 504 }
      )
    }

    if (message.includes('rate') || message.includes('429')) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED', retryable: true },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze photo. Please try again.', retryable: true },
      { status: 500 }
    )
  }
}

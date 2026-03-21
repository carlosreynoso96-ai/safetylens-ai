import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzePhoto } from '@/lib/anthropic/analyze'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import { rateLimit } from '@/lib/utils/rate-limit'
import { cacheDel } from '@/lib/redis/cache'
import sharp from 'sharp'

// Allow up to 60 seconds for AI analysis (important for Vercel deployment)
export const maxDuration = 60

/**
 * Download a raw photo from Supabase Storage, resize with Sharp, return base64.
 * Sharp processes images in streaming tiles — never loads the full bitmap.
 */
async function compressFromStorage(storagePath: string): Promise<{ base64: string; mediaType: string }> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('audit-photos').download(storagePath)
  if (error || !data) throw new Error(`Storage download failed: ${error?.message}`)

  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const compressed = await sharp(buffer)
    .rotate() // auto-rotate based on EXIF
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer()

  return {
    base64: compressed.toString('base64'),
    mediaType: 'image/jpeg',
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit check
    const rl = await rateLimit(user.id, 'analyze')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before analyzing more photos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    let body: { image_base64?: string; storage_path?: string; audit_id?: string; media_type?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse request body.', retryable: false },
        { status: 400 }
      )
    }

    const { image_base64, storage_path, audit_id, media_type } = body

    if (!audit_id || (!image_base64 && !storage_path)) {
      return NextResponse.json(
        { error: 'Missing required fields: audit_id and either image_base64 or storage_path' },
        { status: 400 }
      )
    }

    // Resolve the image — either from storage (new flow) or inline base64 (legacy)
    let finalBase64: string
    let finalMediaType: string

    if (storage_path) {
      const result = await compressFromStorage(storage_path)
      finalBase64 = result.base64
      finalMediaType = result.mediaType
    } else {
      finalBase64 = image_base64!
      finalMediaType = media_type || 'image/jpeg'
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
    const observation = await analyzePhoto(finalBase64, finalMediaType)

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

    // Move raw photo to final location and generate signed URL (best-effort)
    try {
      const finalPath = `${user.id}/${audit_id}/${savedObs.id}.jpeg`

      if (storage_path) {
        // Copy compressed version to final path
        const compressedBuffer = Buffer.from(finalBase64, 'base64')
        await supabase.storage
          .from('audit-photos')
          .upload(finalPath, compressedBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        // Delete the raw upload
        const admin = createAdminClient()
        await admin.storage.from('audit-photos').remove([storage_path])
      } else {
        // Legacy base64 flow — upload directly
        const buffer = Buffer.from(finalBase64, 'base64')
        await supabase.storage
          .from('audit-photos')
          .upload(finalPath, buffer, {
            contentType: finalMediaType,
            upsert: false,
          })
      }

      // Generate signed URL (valid for 1 year)
      const { data: signedData } = await supabase.storage
        .from('audit-photos')
        .createSignedUrl(finalPath, 60 * 60 * 24 * 365)

      if (signedData?.signedUrl) {
        await supabase
          .from('observations')
          .update({ photo_url: signedData.signedUrl })
          .eq('id', savedObs.id)
        savedObs.photo_url = signedData.signedUrl
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

    // Invalidate cached usage stats and audit list
    await Promise.all([
      cacheDel(`usage:${user.id}`),
      cacheDel(`audits:${user.id}:1:20`),
    ])

    return NextResponse.json({ observation: savedObs })
  } catch (error) {
    console.error('Analysis error:', error)

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

    if (message.includes('Storage download failed')) {
      return NextResponse.json(
        { error: 'Failed to read uploaded photo. Please try again.', retryable: true },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze photo. Please try again.', retryable: true },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { analyzePhoto } from '@/lib/anthropic/analyze'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'

export async function POST(request: NextRequest) {
  console.log('[DEBUG ENV] ANTHROPIC_API_KEY:', JSON.stringify(process.env.ANTHROPIC_API_KEY))
  console.log('[DEBUG ENV] NEXT_PUBLIC_SUPABASE_URL:', JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL))
  console.log('[DEBUG ENV] All env keys with ANTHROPIC:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC')))
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
      .select('plan, plan_status, walks_used_this_month, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
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
      if (profile.walks_used_this_month >= limits.walks_per_month) {
        return NextResponse.json(
          { error: 'Monthly walk limit reached. Please upgrade your plan.' },
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
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCoachResponse } from '@/lib/anthropic/coach'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import { CoachMessage } from '@/types/coach'
import { rateLimit, API_LIMITS } from '@/lib/utils/rate-limit'

// Allow up to 60 seconds for AI responses (important for Vercel deployment)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit check
    const rl = rateLimit(`coach:${user.id}`, API_LIMITS.coach)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before sending more messages.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { messages, session_id } = await request.json() as {
      messages: CoachMessage[]
      session_id: string
    }

    if (!messages || !session_id) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, session_id' },
        { status: 400 }
      )
    }

    // Check plan allows Coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_status, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const plan = profile.plan as PlanType
    const limits = PLANS[plan]?.limits

    if (!limits?.coach_enabled) {
      return NextResponse.json(
        { error: 'Coach is not available on your current plan. Please upgrade.' },
        { status: 403 }
      )
    }

    // Enforce coach sessions per month limit
    if (limits.coach_sessions_per_month !== -1) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('coach_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      if ((count || 0) >= limits.coach_sessions_per_month) {
        return NextResponse.json(
          { error: `Monthly coach session limit reached (${limits.coach_sessions_per_month}). Please upgrade your plan.` },
          { status: 403 }
        )
      }
    }

    // Get AI response
    const coachResponse = await getCoachResponse(messages)

    // Save conversation to coach_sessions
    const allMessages: CoachMessage[] = [
      ...messages,
      {
        role: 'assistant' as const,
        content: coachResponse.reply,
        timestamp: new Date().toISOString(),
      },
    ]

    await supabase
      .from('coach_sessions')
      .update({
        messages: allMessages as unknown as Record<string, unknown>,
      })
      .eq('id', session_id)

    // If observation was extracted, save it
    if (coachResponse.observation) {
      // Get audit_id from session
      const { data: session } = await supabase
        .from('coach_sessions')
        .select('audit_id')
        .eq('id', session_id)
        .single()

      if (session) {
        const obs = coachResponse.observation

        // Get current count for sort order
        const { count } = await supabase
          .from('observations')
          .select('*', { count: 'exact', head: true })
          .eq('audit_id', session.audit_id)

        await supabase.from('observations').insert({
          audit_id: session.audit_id,
          user_id: user.id,
          sort_order: (count || 0) + 1,
          compliance: obs.compliance,
          category: obs.category,
          osha_standard: obs.osha_standard,
          narrative: obs.description,
          severity: obs.severity,
          source: 'coach',
          non_compliant_narrative: obs.compliance === 'non_compliant' ? obs.description : null,
          compliant_narrative: obs.compliance === 'compliant' ? obs.description : null,
          severity_if_non_compliant: obs.severity,
          severity_if_compliant: 'Low',
        })

        // Update audit counts
        const { data: allObs } = await supabase
          .from('observations')
          .select('compliance, severity')
          .eq('audit_id', session.audit_id)

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
            .eq('id', session.audit_id)
        }
      }
    }

    return NextResponse.json(coachResponse)
  } catch (error) {
    console.error('Coach error:', error)
    return NextResponse.json(
      { error: 'Failed to get coach response' },
      { status: 500 }
    )
  }
}

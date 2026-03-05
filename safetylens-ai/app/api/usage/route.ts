import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile with usage data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, plan_status, walks_used_this_month, trial_ends_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const plan = profile.plan as PlanType
    const limits = PLANS[plan]?.limits

    // Count photos analyzed this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: photosAnalyzed } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'photo_analyzed')
      .gte('created_at', startOfMonth.toISOString())

    // Count coach sessions this month
    const { count: coachSessionsUsed } = await supabase
      .from('coach_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    return NextResponse.json({
      walks_used: profile.walks_used_this_month || 0,
      walks_limit: limits?.walks_per_month ?? 0,
      photos_analyzed: photosAnalyzed || 0,
      coach_sessions_used: coachSessionsUsed || 0,
      coach_sessions_limit: limits?.coach_sessions_per_month ?? 0,
      plan: profile.plan,
      trial_ends_at: profile.trial_ends_at,
    })
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}

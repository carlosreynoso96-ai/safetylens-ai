import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import { cacheGet, cacheSet, CACHE_TTL } from '@/lib/redis/cache'

interface UsageData {
  walks_used: number
  walks_limit: number
  photos_analyzed: number
  coach_sessions_used: number
  coach_sessions_limit: number
  plan: string
  trial_ends_at: string | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Redis cache first
    const cacheKey = `usage:${user.id}`
    const cached = await cacheGet<UsageData>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' },
      })
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

    // Run both count queries in parallel
    const [photosResult, coachResult] = await Promise.all([
      supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action', 'photo_analyzed')
        .gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('coach_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('started_at', startOfMonth.toISOString()),
    ])

    const data: UsageData = {
      walks_used: profile.walks_used_this_month || 0,
      walks_limit: limits?.walks_per_month ?? 0,
      photos_analyzed: photosResult.count || 0,
      coach_sessions_used: coachResult.count || 0,
      coach_sessions_limit: limits?.coach_sessions_per_month ?? 0,
      plan: profile.plan,
      trial_ends_at: profile.trial_ends_at,
    }

    // Cache the result
    await cacheSet(cacheKey, data, CACHE_TTL.USAGE)

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}

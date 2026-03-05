'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserUsage, PlanType } from '@/types/plan'
import { PLANS } from '@/lib/constants/plans'

export function useUsage() {
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUsage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_status, trial_ends_at, walks_used_this_month')
      .eq('id', user.id)
      .single()

    if (!profile) {
      setLoading(false)
      return
    }

    const plan = profile.plan as PlanType
    const limits = PLANS[plan]?.limits || PLANS.free_trial.limits

    // Count photos analyzed this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: photosCount } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'photo_analyzed')
      .gte('created_at', startOfMonth.toISOString())

    const { count: coachCount } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'coach_walk')
      .gte('created_at', startOfMonth.toISOString())

    setUsage({
      walks_used: profile.walks_used_this_month,
      walks_limit: limits.walks_per_month,
      photos_analyzed: photosCount || 0,
      coach_sessions_used: coachCount || 0,
      coach_sessions_limit: limits.coach_sessions_per_month,
      plan,
      trial_ends_at: profile.trial_ends_at,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchUsage()
  }, [])

  return { usage, loading, refetch: fetchUsage }
}

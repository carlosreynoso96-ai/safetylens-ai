'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlanType, PlanLimits } from '@/types/plan'
import { PLANS } from '@/lib/constants/plans'

interface PlanState {
  plan: PlanType
  planStatus: string
  limits: PlanLimits
  trialEndsAt: string | null
  loading: boolean
}

export function usePlan() {
  const [state, setState] = useState<PlanState>({
    plan: 'free_trial',
    planStatus: 'trialing',
    limits: PLANS.free_trial.limits,
    trialEndsAt: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_ends_at')
        .eq('id', user.id)
        .single()

      if (profile) {
        const plan = profile.plan as PlanType
        setState({
          plan,
          planStatus: profile.plan_status,
          limits: PLANS[plan]?.limits || PLANS.free_trial.limits,
          trialEndsAt: profile.trial_ends_at,
          loading: false,
        })
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    fetchPlan()
  }, [])

  const isTrialExpired = state.trialEndsAt
    ? new Date(state.trialEndsAt) < new Date()
    : false

  const canUseCoach = state.limits.coach_enabled && state.planStatus !== 'canceled'
  const isActive = state.planStatus === 'active' || state.planStatus === 'trialing'

  return {
    ...state,
    isTrialExpired,
    canUseCoach,
    isActive,
  }
}

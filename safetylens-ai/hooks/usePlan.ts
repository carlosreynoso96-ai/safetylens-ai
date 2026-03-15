'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
  const { profile, loading: authLoading } = useAuth()
  const [state, setState] = useState<PlanState>({
    plan: 'free_trial',
    planStatus: 'trialing',
    limits: PLANS.free_trial.limits,
    trialEndsAt: null,
    loading: true,
  })

  useEffect(() => {
    if (authLoading) return

    if (profile) {
      const plan = (profile.plan || 'free_trial') as PlanType
      setState({
        plan,
        planStatus: profile.plan_status || 'trialing',
        limits: PLANS[plan]?.limits || PLANS.free_trial.limits,
        trialEndsAt: profile.trial_ends_at || null,
        loading: false,
      })
    } else {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [profile, authLoading])

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

'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import { CreditCard, Check, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  const { user } = useAuth()
  const supabaseRef = useRef(createClient())
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free_trial')
  const [planStatus, setPlanStatus] = useState('trialing')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    async function fetchBilling() {
      if (!user) return
      const supabase = supabaseRef.current

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_status, trial_ends_at')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentPlan(profile.plan as PlanType)
        setPlanStatus(profile.plan_status)
        setTrialEndsAt(profile.trial_ends_at)
      }
      setLoading(false)
    }
    fetchBilling()
  }, [user])

  async function handleUpgrade(plan: PlanType) {
    setUpgrading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
    setUpgrading(null)
  }

  async function handleManageBilling() {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.portal_url) {
        window.location.href = data.portal_url
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
    setOpeningPortal(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  const planOrder: PlanType[] = ['starter', 'professional', 'coach']

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Current Plan</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">
            {PLANS[currentPlan].name}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              planStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : planStatus === 'trialing'
                ? 'bg-blue-100 text-blue-700'
                : planStatus === 'past_due'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {planStatus}
          </span>
        </div>
        {planStatus === 'trialing' && trialEndsAt && (
          <p className="text-sm text-gray-500 mt-1">
            Trial ends{' '}
            {new Date(trialEndsAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
        {currentPlan !== 'free_trial' && (
          <button
            onClick={handleManageBilling}
            disabled={openingPortal}
            className="mt-3 flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            {openingPortal ? 'Opening...' : 'Manage Subscription'}
          </button>
        )}
      </div>

      {/* Plan Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey]
          const isCurrent = currentPlan === planKey
          const isPopular = planKey === 'professional'

          return (
            <div
              key={planKey}
              className={`bg-white rounded-xl border-2 p-6 relative ${
                isPopular
                  ? 'border-orange-500 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>

              <ul className="space-y-2 mb-6">
                <PlanFeature text={plan.limits.walks_per_month === -1 ? 'Unlimited walks' : `${plan.limits.walks_per_month} walks/month`} />
                <PlanFeature text={`${plan.limits.photos_per_walk} photos/walk`} />
                <PlanFeature text={plan.limits.export_csv ? 'CSV & PDF export' : 'CSV export'} />
                {plan.limits.coach_enabled && (
                  <PlanFeature
                    text={
                      plan.limits.coach_sessions_per_month === -1
                        ? 'Unlimited Coach sessions'
                        : `${plan.limits.coach_sessions_per_month} Coach sessions`
                    }
                  />
                )}
                {plan.limits.custom_templates && (
                  <PlanFeature text="Custom templates" />
                )}
              </ul>

              <button
                onClick={() => handleUpgrade(planKey)}
                disabled={isCurrent || upgrading === planKey}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : isPopular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50`}
              >
                {isCurrent
                  ? 'Current Plan'
                  : upgrading === planKey
                  ? 'Redirecting...'
                  : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Enterprise */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900">Enterprise</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Custom pricing for teams. Unlimited everything, dedicated support.
        </p>
        <a
          href="mailto:sales@getvorsa.ai"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Contact Sales
        </a>
      </div>
    </div>
  )
}

function PlanFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-gray-600">
      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
      {text}
    </li>
  )
}

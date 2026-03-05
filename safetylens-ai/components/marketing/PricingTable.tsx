import Link from 'next/link'
import { Check, X, ArrowRight, Building2 } from 'lucide-react'
import { PLANS } from '@/lib/constants/plans'

type DisplayPlan = {
  key: string
  name: string
  price: number | null
  period: string
  description: string
  popular: boolean
  features: { label: string; included: boolean }[]
}

const displayPlans: DisplayPlan[] = [
  {
    key: 'starter',
    name: PLANS.starter.name,
    price: PLANS.starter.price,
    period: '/month',
    description: 'For individual superintendents getting started with AI safety.',
    popular: false,
    features: [
      { label: '20 safety walks per month', included: true },
      { label: '100 photos per walk', included: true },
      { label: 'AI photo analysis', included: true },
      { label: 'OSHA standard citations', included: true },
      { label: 'CSV & PDF export', included: true },
      { label: 'Audit history', included: true },
      { label: 'AI Safety Coach', included: false },
      { label: 'Custom templates', included: false },
    ],
  },
  {
    key: 'professional',
    name: PLANS.professional.name,
    price: PLANS.professional.price,
    period: '/month',
    description: 'Unlimited walks with advanced features for growing teams.',
    popular: true,
    features: [
      { label: 'Unlimited safety walks', included: true },
      { label: '200 photos per walk', included: true },
      { label: 'AI photo analysis', included: true },
      { label: 'OSHA standard citations', included: true },
      { label: 'CSV & PDF export', included: true },
      { label: 'Audit history', included: true },
      { label: 'Custom templates', included: true },
      { label: 'AI Safety Coach', included: false },
    ],
  },
  {
    key: 'coach',
    name: PLANS.coach.name,
    price: PLANS.coach.price,
    period: '/month',
    description: 'Everything in Professional plus real-time AI voice coaching.',
    popular: false,
    features: [
      { label: 'Unlimited safety walks', included: true },
      { label: '200 photos per walk', included: true },
      { label: 'AI photo analysis', included: true },
      { label: 'OSHA standard citations', included: true },
      { label: 'CSV & PDF export', included: true },
      { label: 'Audit history', included: true },
      { label: 'Custom templates', included: true },
      { label: 'Unlimited AI Coach sessions', included: true },
    ],
  },
]

export default function PricingTable() {
  return (
    <section id="pricing" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Start with a 14-day free trial. No credit card required. Upgrade or
            cancel anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {displayPlans.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-orange-500 ring-1 ring-orange-500'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-gray-100" />

              {/* Feature list */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <X className="h-3 w-3" strokeWidth={3} />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? 'font-medium text-gray-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link
                href="/signup"
                className={`mt-8 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:text-orange-600 hover:shadow-md'
                }`}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise card */}
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
                <p className="mt-1 text-base text-gray-600">
                  Multi-site deployment with unlimited team members, 500 photos per
                  walk, custom integrations, dedicated support, and SSO. Tailored to
                  your organization.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 rounded-xl border-2 border-gray-900 bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

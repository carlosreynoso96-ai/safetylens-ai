import { PlanDefinition, PlanType } from '@/types/plan'

export const PLANS: Record<PlanType, PlanDefinition> = {
  free_trial: {
    name: 'Free Trial',
    price: 0,
    duration: '14 days',
    stripe_price_id: null,
    limits: {
      walks_per_month: 5,
      photos_per_walk: 50,
      coach_enabled: true,
      coach_sessions_per_month: 2,
      export_csv: true,
      export_pdf: true,
      custom_templates: false,
      audit_history: true,
      team_members: 1,
    },
  },
  starter: {
    name: 'Starter',
    price: 29,
    stripe_price_id: process.env.STRIPE_PRICE_STARTER || 'price_STARTER_ID',
    limits: {
      walks_per_month: 20,
      photos_per_walk: 100,
      coach_enabled: false,
      coach_sessions_per_month: 0,
      export_csv: true,
      export_pdf: true,
      custom_templates: false,
      audit_history: true,
      team_members: 1,
    },
  },
  professional: {
    name: 'Professional',
    price: 49,
    stripe_price_id: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_PRO_ID',
    limits: {
      walks_per_month: -1,
      photos_per_walk: 200,
      coach_enabled: false,
      coach_sessions_per_month: 0,
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: 1,
    },
  },
  coach: {
    name: 'Coach',
    price: 89,
    stripe_price_id: process.env.STRIPE_PRICE_COACH || 'price_COACH_ID',
    limits: {
      walks_per_month: -1,
      photos_per_walk: 200,
      coach_enabled: true,
      coach_sessions_per_month: -1,
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: 1,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    stripe_price_id: null,
    limits: {
      walks_per_month: -1,
      photos_per_walk: 500,
      coach_enabled: true,
      coach_sessions_per_month: -1,
      export_csv: true,
      export_pdf: true,
      custom_templates: true,
      audit_history: true,
      team_members: -1,
    },
  },
}

export function getPlanLimits(plan: PlanType) {
  return PLANS[plan].limits
}

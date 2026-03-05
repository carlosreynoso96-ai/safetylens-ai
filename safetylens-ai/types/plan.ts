export type PlanType = 'free_trial' | 'starter' | 'professional' | 'coach' | 'enterprise'
export type PlanStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface PlanLimits {
  walks_per_month: number
  photos_per_walk: number
  coach_enabled: boolean
  coach_sessions_per_month: number
  export_csv: boolean
  export_pdf: boolean
  custom_templates: boolean
  audit_history: boolean
  team_members: number
}

export interface PlanDefinition {
  name: string
  price: number | null
  stripe_price_id: string | null
  limits: PlanLimits
  duration?: string
}

export interface UserUsage {
  walks_used: number
  walks_limit: number
  photos_analyzed: number
  coach_sessions_used: number
  coach_sessions_limit: number
  plan: PlanType
  trial_ends_at: string | null
}

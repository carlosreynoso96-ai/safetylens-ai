import { track } from '@vercel/analytics'

/** Fired on successful signup (after email confirmation is sent). */
export function trackSignup() {
  track('signup')
}

/** Fired when a user completes their first photo analysis. */
export function trackFirstAnalysis() {
  track('first_analysis')
}

/** Fired when a user starts a coach session. */
export function trackCoachSessionStart() {
  track('coach_session_start')
}

/**
 * Fired when a user upgrades to a paid plan.
 * Note: This should be called client-side right before redirecting to Stripe
 * checkout (e.g., in the billing/pricing component that calls POST /api/stripe/checkout).
 */
export function trackUpgrade(plan: string) {
  track('upgrade', { plan })
}

/** Fired when a user exports a report. */
export function trackExport(format: 'csv' | 'pdf') {
  track('export', { format })
}

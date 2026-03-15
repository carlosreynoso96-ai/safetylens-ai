-- ============================================
-- 004_webhook_events_and_indexes.sql
-- Stripe webhook idempotency + additional indexes
-- ============================================

-- Table to track processed Stripe webhook events for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-cleanup: events older than 7 days (Stripe retries within 72 hours max)
CREATE INDEX idx_webhook_events_processed ON public.stripe_webhook_events(processed_at);

-- Additional indexes for scale
CREATE INDEX IF NOT EXISTS idx_coach_sessions_user_month
  ON public.coach_sessions(user_id, started_at);

CREATE INDEX IF NOT EXISTS idx_observations_user
  ON public.observations(user_id);

CREATE INDEX IF NOT EXISTS idx_usage_action_user
  ON public.usage_logs(action, user_id, created_at);

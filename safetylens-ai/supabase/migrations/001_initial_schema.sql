-- ============================================
-- 001_initial_schema.sql
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free_trial',
  plan_status TEXT NOT NULL DEFAULT 'trialing',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  walks_used_this_month INT NOT NULL DEFAULT 0,
  walks_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audits (a single safety walk session)
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  audit_type TEXT NOT NULL DEFAULT 'analyze',
  inspector_name TEXT,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  total_observations INT NOT NULL DEFAULT 0,
  compliant_count INT NOT NULL DEFAULT 0,
  non_compliant_count INT NOT NULL DEFAULT 0,
  critical_count INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Observations (individual findings within an audit)
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  compliance TEXT NOT NULL DEFAULT 'non_compliant',
  category TEXT NOT NULL,
  osha_standard TEXT,
  osha_description TEXT,
  narrative TEXT,
  severity TEXT NOT NULL DEFAULT 'Medium',
  corrective_action TEXT,
  inspection_items TEXT[],
  compliant_narrative TEXT,
  compliant_corrective_action TEXT,
  non_compliant_narrative TEXT,
  non_compliant_corrective_action TEXT,
  severity_if_compliant TEXT DEFAULT 'Low',
  severity_if_non_compliant TEXT DEFAULT 'Medium',
  photo_url TEXT,
  photo_thumbnail_url TEXT,
  original_filename TEXT,
  source TEXT NOT NULL DEFAULT 'analyze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach Sessions
CREATE TABLE public.coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  area TEXT,
  trades_active TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Usage tracking
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  audit_id UUID REFERENCES public.audits(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audits_user ON public.audits(user_id, created_at DESC);
CREATE INDEX idx_audits_project ON public.audits(project_id);
CREATE INDEX idx_observations_audit ON public.observations(audit_id, sort_order);
CREATE INDEX idx_usage_user_month ON public.usage_logs(user_id, created_at);
CREATE INDEX idx_profiles_stripe ON public.profiles(stripe_customer_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

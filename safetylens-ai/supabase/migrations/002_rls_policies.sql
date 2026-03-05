-- ============================================
-- 002_rls_policies.sql
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users can CRUD their own
CREATE POLICY "Users can CRUD own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Audits: users can CRUD their own
CREATE POLICY "Users can CRUD own audits" ON public.audits FOR ALL USING (auth.uid() = user_id);

-- Observations: users can CRUD their own
CREATE POLICY "Users can CRUD own observations" ON public.observations FOR ALL USING (auth.uid() = user_id);

-- Coach sessions: users can CRUD their own
CREATE POLICY "Users can CRUD own coach sessions" ON public.coach_sessions FOR ALL USING (auth.uid() = user_id);

-- Usage logs: users can read their own, insert their own
CREATE POLICY "Users can read own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

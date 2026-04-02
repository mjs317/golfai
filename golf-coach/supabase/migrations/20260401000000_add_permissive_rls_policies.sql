-- ============================================================
-- FIX: Add permissive RLS policies for single-user app
-- ============================================================
-- Background: RLS was enabled on March 25 with no policies defined.
-- In Supabase, RLS + no policies = anon key returns 0 rows.
-- The app uses SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS), but
-- falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY if the service role key
-- is not set in the deployment environment — which blocks all queries.
--
-- This is a single-user personal app with no per-user data isolation
-- requirements. These policies allow full access via any role while
-- keeping RLS enabled for security (blocks direct PostgREST access
-- without a valid Supabase key).
--
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE POLICY IF NOT EXISTS "allow_all_rounds"
  ON public.rounds
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_range_sessions"
  ON public.range_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

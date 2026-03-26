-- ============================================================
-- SECURITY: Row Level Security on all public PostgREST tables
-- ============================================================
-- Run in Supabase Dashboard > SQL Editor, or: supabase db push
--
-- With RLS on and no policies, anon/authenticated get no rows via API.
-- This app uses SUPABASE_SERVICE_ROLE_KEY server-side, which bypasses RLS.
-- ============================================================

ALTER TABLE IF EXISTS public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.range_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on any other public tables (e.g. created in the dashboard).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS tbl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tbl);
  END LOOP;
END $$;

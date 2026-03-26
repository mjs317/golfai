-- Enable RLS on all public tables (fixes rls_disabled_in_public advisor)

ALTER TABLE IF EXISTS public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.range_sessions ENABLE ROW LEVEL SECURITY;

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

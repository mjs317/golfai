-- ============================================================
-- SECURITY FIX: Enable Row Level Security on all public tables
-- ============================================================
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
--
-- With RLS enabled and NO policies defined, all direct access
-- via the anon/authenticated roles is blocked. The app is
-- unaffected because it uses the service role key server-side,
-- which bypasses RLS entirely.
-- ============================================================

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE range_sessions ENABLE ROW LEVEL SECURITY;

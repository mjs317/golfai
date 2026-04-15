-- Run this in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS range_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_title text NOT NULL,
  total_time text NOT NULL,
  focus_summary text,
  sections jsonb NOT NULL DEFAULT '[]',
  session_notes text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS: blocks all direct PostgREST access (anon/authenticated roles).
-- Server-side code uses the service role key which bypasses RLS automatically.
ALTER TABLE range_sessions ENABLE ROW LEVEL SECURITY;

-- Migration: add session_type column to distinguish practice sessions from pre-round warm-ups.
-- Existing rows default to 'practice'. Run this in the Supabase SQL editor if the column doesn't exist yet.
ALTER TABLE public.range_sessions
  ADD COLUMN IF NOT EXISTS session_type text NOT NULL DEFAULT 'practice'
  CHECK (session_type IN ('practice', 'warmup'));

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

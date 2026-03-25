CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  course_name TEXT NOT NULL,
  holes_played INTEGER NOT NULL CHECK (holes_played IN (9, 18)),
  gross_score INTEGER NOT NULL,
  net_score INTEGER,
  par INTEGER NOT NULL,
  handicap_index DECIMAL(4,1),
  fairways_hit INTEGER DEFAULT 0,
  fairways_attempted INTEGER DEFAULT 0,
  gir INTEGER DEFAULT 0,
  gir_attempted INTEGER DEFAULT 0,
  total_putts INTEGER DEFAULT 0,
  chip_shots INTEGER DEFAULT 0,
  sand_shots INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  pars_or_better INTEGER DEFAULT 0,
  bogeys_or_worse INTEGER DEFAULT 0,
  holes JSONB DEFAULT '[]',
  ai_recap TEXT,
  ai_strengths JSONB DEFAULT '[]',
  ai_weaknesses JSONB DEFAULT '[]',
  ai_drills JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rounds_date_idx ON rounds(date DESC);

-- Enable RLS: blocks all direct PostgREST access (anon/authenticated roles).
-- Server-side code uses the service role key which bypasses RLS automatically.
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

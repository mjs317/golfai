export interface HoleData {
  hole: number;
  par: number;
  handicap: number;
  score: number;
  fairway_hit: boolean | null;
  gir: boolean;
  putts: number;
  chip_shots: number;
  sand_shots: number;
  penalties: number;
}

export interface RoundStats {
  fairways_hit: number;
  fairways_attempted: number;
  fairway_percentage: number;
  gir: number;
  gir_attempted: number;
  gir_percentage: number;
  total_putts: number;
  putts_per_hole: number;
  chip_shots: number;
  sand_shots: number;
  penalties: number;
  pars_or_better: number;
  bogeys_or_worse: number;
}

export interface Round {
  id: string;
  date: string;
  course_name: string;
  holes_played: 9 | 18;
  gross_score: number;
  net_score: number;
  par: number;
  handicap_index: number;
  stats: RoundStats;
  holes: HoleData[];
  ai_recap: string;
  ai_strengths: string[];
  ai_weaknesses: string[];
  ai_drills: Drill[];
  notes: string;
  created_at: string;
}

export interface Drill {
  title: string;
  description: string;
  duration: string;
  focus_area: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface CoachingAnalysis {
  recap: string;
  strengths: string[];
  weaknesses: string[];
  priority_focus: string;
  drills: Drill[];
  score_to_par: number;
  trend_note?: string;
}

export interface ParsedRoundData {
  course_name: string;
  date: string;
  holes_played: 9 | 18;
  gross_score: number;
  net_score: number;
  par: number;
  holes: HoleData[];
  stats: RoundStats;
  notes?: string;
}

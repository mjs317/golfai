import { NextRequest, NextResponse } from "next/server";
import { generateRangePlan } from "@/lib/claude";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { sessionMinutes } = await request.json();
    const minutes = Number(sessionMinutes) || 60;

    const [roundsResult, sessionsResult] = await Promise.all([
      supabase
        .from("rounds")
        .select("date, gross_score, par, fairways_hit, fairways_attempted, gir, gir_attempted, total_putts, chip_shots, holes_played, penalties, ai_drills")
        .order("date", { ascending: false })
        .limit(10),
      supabase
        .from("range_sessions")
        .select("session_title, total_time, focus_summary, sections, session_notes, completed_at")
        .order("completed_at", { ascending: false })
        .limit(3),
    ]);

    if (roundsResult.error) throw roundsResult.error;

    const plan = await generateRangePlan(
      minutes,
      roundsResult.data || [],
      sessionsResult.data || []
    );
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Range plan error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to generate plan" }, { status: 500 });
  }
}

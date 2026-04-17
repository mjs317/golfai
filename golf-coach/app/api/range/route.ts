import { NextRequest, NextResponse } from "next/server";
import { generateRangePlan } from "@/lib/claude";
import { supabase } from "@/lib/supabase";
import { isDemoMode } from "@/lib/demo";

export async function POST(request: NextRequest) {
  if (isDemoMode) return NextResponse.json({ error: "Demo mode — read only" }, { status: 403 });
  try {
    const { sessionMinutes, sessionType, facilityOptions } = await request.json();
    const minutes = Number(sessionMinutes) || 60;
    const type: 'practice' | 'warmup' = sessionType === 'warmup' ? 'warmup' : 'practice';
    const facility = {
      chippingGreen: facilityOptions?.chippingGreen ?? true,
      puttingGreen: facilityOptions?.puttingGreen ?? true,
    };

    const [roundsResult, sessionsResult] = await Promise.all([
      supabase
        .from("rounds")
        .select("date, gross_score, par, fairways_hit, fairways_attempted, gir, gir_attempted, total_putts, chip_shots, holes_played, penalties, ai_drills")
        .order("date", { ascending: false })
        .limit(10),
      supabase
        .from("range_sessions")
        .select("session_title, total_time, focus_summary, sections, session_notes, completed_at, session_type")
        .order("completed_at", { ascending: false })
        .limit(3),
    ]);

    if (roundsResult.error) throw roundsResult.error;

    const plan = await generateRangePlan(
      minutes,
      type,
      facility,
      roundsResult.data || [],
      sessionsResult.data || []
    );
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Range plan error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to generate plan" }, { status: 500 });
  }
}

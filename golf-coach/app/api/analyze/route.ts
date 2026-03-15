import { NextRequest, NextResponse } from "next/server";
import { generateCoachingAnalysis, parseScreenshots } from "@/lib/claude";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("screenshots") as File[];
    const manualNotes = formData.get("notes") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No screenshots provided" }, { status: 400 });
    }

    const imageBase64Array: string[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      imageBase64Array.push(base64);
    }

    const parsedRound = await parseScreenshots(imageBase64Array);
    if (manualNotes) parsedRound.notes = manualNotes;

    const { data: recentRounds } = await supabase
      .from("rounds")
      .select("date, gross_score, par, fairways_hit, fairways_attempted, gir, gir_attempted, total_putts, chip_shots")
      .order("date", { ascending: false })
      .limit(10);

    const formattedRecent = (recentRounds || []).map(r => ({
      date: r.date,
      gross_score: r.gross_score,
      par: r.par,
      fairway_pct: r.fairways_attempted > 0 ? Math.round((r.fairways_hit / r.fairways_attempted) * 100) : 0,
      gir_pct: r.gir_attempted > 0 ? Math.round((r.gir / r.gir_attempted) * 100) : 0,
      total_putts: r.total_putts,
      chip_shots: r.chip_shots,
    }));

    const coaching = await generateCoachingAnalysis(parsedRound, formattedRecent);

    const { data: savedRound, error } = await supabase
      .from("rounds")
      .insert({
        date: parsedRound.date,
        course_name: parsedRound.course_name,
        holes_played: parsedRound.holes_played,
        gross_score: parsedRound.gross_score,
        net_score: parsedRound.net_score,
        par: parsedRound.par,
        handicap_index: 14,
        fairways_hit: parsedRound.stats.fairways_hit,
        fairways_attempted: parsedRound.stats.fairways_attempted,
        gir: parsedRound.stats.gir,
        gir_attempted: parsedRound.stats.gir_attempted,
        total_putts: parsedRound.stats.total_putts,
        chip_shots: parsedRound.stats.chip_shots,
        sand_shots: parsedRound.stats.sand_shots,
        penalties: parsedRound.stats.penalties,
        pars_or_better: parsedRound.stats.pars_or_better,
        bogeys_or_worse: parsedRound.stats.bogeys_or_worse,
        holes: parsedRound.holes,
        ai_recap: coaching.recap,
        ai_strengths: coaching.strengths,
        ai_weaknesses: coaching.weaknesses,
        ai_drills: coaching.drills,
        notes: parsedRound.notes || "",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to save round: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, round: savedRound, parsedData: parsedRound, coaching });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "An unexpected error occurred" }, { status: 500 });
  }
}

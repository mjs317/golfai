import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isDemoModeServer } from "@/lib/demo";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("range_sessions")
      .select("id, session_title, total_time, focus_summary, sections, session_notes, completed_at, session_type")
      .order("completed_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json({ sessions: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (isDemoModeServer()) return NextResponse.json({ error: "Demo mode — read only" }, { status: 403 });
  try {
    const body = await request.json();
    const { session_title, total_time, focus_summary, sections, session_notes, session_type } = body;
    const type = session_type === 'warmup' ? 'warmup' : 'practice';

    const { data, error } = await supabase
      .from("range_sessions")
      .insert({ session_title, total_time, focus_summary, sections, session_notes, session_type: type })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ session: data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to save session" }, { status: 500 });
  }
}

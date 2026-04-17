import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isDemoMode } from "@/lib/demo";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (isDemoMode) return NextResponse.json({ error: "Demo mode — read only" }, { status: 403 });
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("range_sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete session" },
      { status: 500 }
    );
  }
}

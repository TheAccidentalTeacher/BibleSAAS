import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CrossReferenceTrailRow } from "@/types/database";

// GET /api/trails — user's own trails (most recent 20)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: rawTrails } = await supabase
    .from("cross_reference_trails")
    .select("id, name, trail_type, origin_book, origin_chapter, origin_verse, step_count, created_at, completed_at, is_public, share_token")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const trails = (rawTrails ?? []) as unknown as Partial<CrossReferenceTrailRow>[];

  return NextResponse.json({ trails });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { HymnIndexRow } from "@/types/database";

// GET /api/library/hymns?theme=grace&limit=20&offset=0
// GET /api/library/hymns?id=uuid  (single hymn full detail)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const theme = searchParams.get("theme");
  const limit = Math.min(Number(searchParams.get("limit") ?? "30"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");

  if (id) {
    const { data: rawHymn, error } = await supabase
      .from("hymn_index")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !rawHymn) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const hymn = rawHymn as unknown as HymnIndexRow;

    // Track history
    await supabase.from("user_library_history").upsert({
      user_id: user.id,
      entry_type: "hymn",
      entry_id: hymn.id,
      entry_slug: hymn.title.toLowerCase().replace(/\s+/g, "-").slice(0, 80),
      entry_label: hymn.title,
      last_visited_at: new Date().toISOString(),
      visit_count: 1,
    }, { onConflict: "user_id,entry_type,entry_id", ignoreDuplicates: false });

    return NextResponse.json({ hymn });
  }

  let query = supabase
    .from("hymn_index")
    .select("id, title, first_line, author, year_written, tune_name, meter, thematic_tags, explicit_refs")
    .order("title")
    .range(offset, offset + limit - 1);

  if (theme) {
    query = query.contains("thematic_tags", [theme]);
  }

  const { data: hymns, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ hymns: hymns ?? [], total: count });
}

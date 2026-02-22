import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BibleDictionaryEntryRow } from "@/types/database";

// GET /api/library/dictionary?slug=ark-of-the-covenant
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") ?? "").trim();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { data: rawEntries, error } = await supabase
    .from("bible_dictionary_entries")
    .select("*")
    .eq("slug", slug)
    .order("is_primary_source", { ascending: false });
  const entries = rawEntries as unknown as BibleDictionaryEntryRow[] | null;

  if (error || !entries?.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const primary = entries.find((e) => e.is_primary_source) ?? entries[0];

  // Track in user_library_history
  await supabase.from("user_library_history").upsert({
    user_id: user.id,
    entry_type: "dictionary",
    entry_id: primary.id,
    entry_slug: slug,
    entry_label: primary.term,
    last_visited_at: new Date().toISOString(),
    visit_count: 1,
  }, { onConflict: "user_id,entry_type,entry_id", ignoreDuplicates: false });

  return NextResponse.json({ entries, primary });
}

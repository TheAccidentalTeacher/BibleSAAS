/**
 * GET /api/map/data
 *
 * Returns:
 *  - All geographic locations (with passage counts)
 *  - The current user's discovered location IDs
 *  - The passages the user has actually read at each location
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all geographic locations
  const { data: locations, error: locErr } = await supabase
    .from("geographic_locations")
    .select("id, name, alternate_names, modern_name, lat, lng, location_type, description, significance")
    .order("name");

  if (locErr) return NextResponse.json({ error: locErr.message }, { status: 500 });

  // Fetch passage counts per location (aggregate via passage_locations)
  const { data: passages } = await supabase
    .from("passage_locations")
    .select("location_id, book, chapter, context_note");

  // Build passage count map
  const passageCountByLocation = new Map<string, number>();
  for (const p of (passages ?? [])) {
    const id = (p as { location_id: string }).location_id;
    passageCountByLocation.set(id, (passageCountByLocation.get(id) ?? 0) + 1);
  }

  // Fetch user's discovered location IDs
  const { data: discoveries } = await supabase
    .from("user_map_discoveries")
    .select("location_id, discovered_at")
    .eq("user_id", user.id);

  const discoveredIds = new Set<string>(
    (discoveries ?? []).map(
      (d: { location_id: string }) => d.location_id
    )
  );

  // Fetch which passages the user has actually read
  const { data: readProgress } = await supabase
    .from("reading_progress")
    .select("book_code, chapter_number")
    .eq("user_id", user.id);

  const readSet = new Set<string>();
  for (const r of (readProgress ?? []) as Array<{ book_code: string; chapter_number: number }>) {
    readSet.add(`${r.book_code}:${r.chapter_number}`);
  }

  // Annotate passages with whether the user has read them
  const passagesWithRead = (passages ?? []).map((p) => ({
    location_id: (p as { location_id: string; book: string; chapter: number; context_note?: string }).location_id,
    book: (p as { location_id: string; book: string; chapter: number; context_note?: string }).book,
    chapter: (p as { location_id: string; book: string; chapter: number; context_note?: string }).chapter,
    context_note: (p as { location_id: string; book: string; chapter: number; context_note?: string }).context_note ?? null,
    read: readSet.has(`${(p as { location_id: string; book: string; chapter: number }).book}:${(p as { location_id: string; book: string; chapter: number }).chapter}`),
  }));

  // Merge passage counts into locations
  const annotatedLocations = (locations ?? []).map((loc) => {
    const row = loc as Record<string, unknown>;
    return {
      ...row,
      total_passages: passageCountByLocation.get(row.id as string) ?? 0,
      discovered: discoveredIds.has(row.id as string),
    };
  });

  return NextResponse.json({
    locations: annotatedLocations,
    discoveredIds: Array.from(discoveredIds),
    passages: passagesWithRead,
  });
}

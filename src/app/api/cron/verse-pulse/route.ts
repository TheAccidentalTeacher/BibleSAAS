/**
 * GET /api/cron/verse-pulse
 *
 * Weekly job: aggregates verse_interactions from the last 7 days into
 * verse_pulse_cache. Computes a relative weight (0.0–1.0) so we never
 * expose raw interaction counts.
 *
 * Scheduled: every Sunday at midnight (vercel.json).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const now = new Date();

  // Week start = last Sunday  
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split("T")[0]!;

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Aggregate verse interactions from last 7 days
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawInteractions, error } = await (adminClient as any)
    .from("verse_interactions")
    .select("book, chapter, verse, interaction_type")
    .gte("created_at", sevenDaysAgo);
  const interactions: { book: string; chapter: number; verse: number | null }[] = rawInteractions ?? [];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rawInteractions || interactions.length === 0) {
    return NextResponse.json({ message: "No interactions to process", processed: 0 });
  }

  // Count by verse ref
  const counts = new Map<string, { book: string; chapter: number; verse: number | null; count: number }>();

  for (const row of interactions) {
    const book = row.book as string;
    const chapter = row.chapter as number;
    const verse = (row.verse as number | null) ?? null;
    const ref = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

    const existing = counts.get(ref);
    if (existing) {
      existing.count++;
    } else {
      counts.set(ref, { book, chapter, verse, count: 1 });
    }
  }

  if (counts.size === 0) {
    return NextResponse.json({ message: "No verse refs found", processed: 0 });
  }

  // Normalise to 0.0–1.0
  const maxCount = Math.max(...Array.from(counts.values()).map((v) => v.count));

  const rows = Array.from(counts.entries()).map(([ref, data]) => ({
    week_start: weekStartStr,
    verse_ref: ref,
    book: data.book,
    chapter: data.chapter,
    verse: data.verse,
    raw_count: data.count,
    weight: parseFloat((data.count / maxCount).toFixed(3)),
  }));

  // Upsert into verse_pulse_cache
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await (adminClient as any)
    .from("verse_pulse_cache")
    .upsert(rows, { onConflict: "week_start,verse_ref" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ processed: rows.length, weekStart: weekStartStr });
}

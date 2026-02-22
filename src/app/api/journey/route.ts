import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StreakRow } from "@/types/database";

/**
 * GET /api/journey
 * Returns all data needed to power the 5 Journey views.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // All reading progress (max 1,189 rows per user)
  const { data: progressRows } = await supabase
    .from("reading_progress")
    .select("book_code, chapter_number")
    .eq("user_id", user.id);

  // Group by book_code → sets of chapter numbers
  const byBook: Record<string, number[]> = {};
  for (const row of progressRows ?? []) {
    const r = row as { book_code: string; chapter_number: number };
    if (!byBook[r.book_code]) byBook[r.book_code] = [];
    byBook[r.book_code].push(r.chapter_number);
  }

  // Streak + XP
  const { data: streakRaw } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, total_xp, current_level, total_days")
    .eq("user_id", user.id)
    .maybeSingle();
  const streakData = (streakRaw ?? {}) as Partial<Pick<StreakRow, "current_streak" | "longest_streak" | "total_xp" | "current_level" | "total_days">>;

  // Counts
  const [memoryRes, masteredRes, journalRes, highlightRes, bookmarkRes, trailRes] =
    await Promise.all([
      supabase.from("memory_verses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("memory_verses").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("mastered", true),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("highlights").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("cross_reference_trails").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const totalChaptersRead = Object.values(byBook).reduce((s, v) => s + v.length, 0);

  return NextResponse.json({
    byBook,
    totalChaptersRead,
    streakData: {
      currentStreak: streakData.current_streak ?? 0,
      longestStreak: streakData.longest_streak ?? 0,
      totalXp: streakData.total_xp ?? 0,
      currentLevel: streakData.current_level ?? 1,
      totalDays: streakData.total_days ?? 0,
    },
    counts: {
      memory: memoryRes.count ?? 0,
      mastered: masteredRes.count ?? 0,
      journal: journalRes.count ?? 0,
      highlight: highlightRes.count ?? 0,
      bookmark: bookmarkRes.count ?? 0,
      trails: trailRes.count ?? 0,
    },
  });
}

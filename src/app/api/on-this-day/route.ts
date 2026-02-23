/**
 * GET /api/on-this-day
 *
 * Returns journal entries from the same calendar day in prior years.
 * Used by the dashboard "On This Day" card.
 *
 * Response: { entries: OnThisDayEntry[] }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";

export interface OnThisDayEntry {
  id: string;
  book: string;
  bookName: string;
  chapter: number;
  note: string;
  studied_at: string;
  years_ago: number;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Today's month/day (UTC)
  const now = new Date();
  const todayMD = `${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
  const currentYear = now.getUTCFullYear();

  // Query journal entries from same month-day in any prior year
  // We use to_char to extract MM-DD and filter > 1 year ago
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_on_this_day_entries", {
    p_user_id: user.id,
    p_month_day: todayMD,
  });

  if (error) {
    // Fallback: manual filter if RPC doesn't exist yet
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
    const { data: fallbackData, error: fallbackErr } = await supabase
      .from("journal_entries")
      .select("id, book, chapter, note, created_at")
      .eq("user_id", user.id)
      .lte("created_at", oneYearAgo)
      .not("book", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (fallbackErr) {
      return NextResponse.json({ entries: [] });
    }

    // Filter to same month-day
    const entries: OnThisDayEntry[] = ((fallbackData ?? []) as Array<{
      id: string;
      book: string | null;
      chapter: number | null;
      note: string | null;
      created_at: string;
    }>)
      .filter((e) => {
        const d = new Date(e.created_at);
        const entryMD = `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        return entryMD === todayMD && e.book && e.chapter;
      })
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        book: e.book!,
        bookName: getBook(e.book!)?.name ?? e.book!,
        chapter: e.chapter!,
        note: (e.note ?? "").slice(0, 120),
        studied_at: e.created_at,
        years_ago: currentYear - new Date(e.created_at).getUTCFullYear(),
      }));

    return NextResponse.json({ entries });
  }

  // Format RPC result
  const entries: OnThisDayEntry[] = ((data ?? []) as Array<{
    id: string;
    book: string;
    chapter: number;
    note: string | null;
    created_at: string;
  }>).slice(0, 5).map((e) => ({
    id: e.id,
    book: e.book,
    bookName: getBook(e.book)?.name ?? e.book,
    chapter: e.chapter,
    note: (e.note ?? "").slice(0, 120),
    studied_at: e.created_at,
    years_ago: currentYear - new Date(e.created_at).getUTCFullYear(),
  }));

  return NextResponse.json({ entries });
}

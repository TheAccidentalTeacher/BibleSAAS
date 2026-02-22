/**
 * POST /api/pray/save
 *
 * Saves a completed "Pray This Passage" session to prayer_journal.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SavePrayBody {
  book: string;
  chapter: number;
  verseRef: string;        // e.g. "Romans 8:1-3"
  linkedVerseText: string; // the verse text block
  prayerText: string;      // the user's prayer
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as SavePrayBody;
  const { book, chapter, verseRef, linkedVerseText, prayerText } = body;

  if (!prayerText?.trim()) {
    return NextResponse.json({ error: "Prayer text required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("prayer_journal")
    .insert({
      user_id: user.id,
      title: verseRef,
      body: prayerText.trim(),
      book,
      chapter: chapter as unknown as never,
      linked_verse_ref: verseRef as unknown as never,
      linked_verse_text: linkedVerseText as unknown as never,
      category: "pray_this_passage" as unknown as never,
      status: "active",
    } as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

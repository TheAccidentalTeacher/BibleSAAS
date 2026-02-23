/**
 * /read/[book]/[chapter] — Bible reading screen
 *
 * Server component: validates params, checks auth, fetches chapter data,
 * reads user's translation preference, then renders the client ReadingView.
 */

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBook, nextChapter, prevChapter } from "@/lib/bible";
import {
  getChapter,
  getUnavailableReason,
  TRANSLATIONS,
} from "@/lib/bible/index";
import ReadingView from "./reading-view";
import type { SpurgeonEntry } from "./spurgeon-card";
import type { HymnEntry } from "./hymn-card";
import type { StreakRow } from "@/types/database";

interface PageProps {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ translation?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { book, chapter } = await params;
  const bookData = getBook(book.toUpperCase());
  if (!bookData) return { title: "Bible" };
  return {
    title: `${bookData.name} ${chapter} — Bible Study App`,
    description: `Read ${bookData.name} chapter ${chapter}`,
  };
}

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { book: rawBook, chapter: rawChapter } = await params;
  const { translation: qsTranslation } = await searchParams;

  // ----- Validate book/chapter params -----
  const bookCode = rawBook.toUpperCase();
  const chapterNum = parseInt(rawChapter, 10);
  const bookData = getBook(bookCode);

  if (!bookData || isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookData.chapters) {
    notFound();
  }

  // ----- Auth check -----
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // ----- Resolve translation -----
  // Priority: URL query param > user display settings > default (WEB)
  let translation = "WEB";

  // ----- Fetch display settings once -----
  const { data: rawDisplaySettings } = await supabase
    .from("user_display_settings")
    .select("translation, catechism_layer_enabled, show_cross_refs, meta")
    .eq("user_id", user.id)
    .maybeSingle();
  const displaySettings = rawDisplaySettings as unknown as {
    translation?: string;
    catechism_layer_enabled?: boolean;
    show_cross_refs?: boolean;
    meta?: Record<string, unknown>;
  } | null;

  if (qsTranslation) {
    const valid = TRANSLATIONS.find(
      (t) => t.code === qsTranslation.toUpperCase()
    );
    if (valid) translation = valid.code;
  } else {
    if (displaySettings?.translation) {
      translation = displaySettings.translation;
    }
  }

  // ----- Fetch chapter -----
  const chapterData = await getChapter(bookCode, chapterNum, translation);

  // ----- Navigation targets -----
  const next = nextChapter(bookCode, chapterNum);
  const prev = prevChapter(bookCode, chapterNum);

  // ----- User tier -----
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  const userTier = (profile?.subscription_tier as string) ?? "free";

  // ----- Streak (for header badge) -----
  const { data: streakRaw } = await supabase
    .from("streaks")
    .select("current_streak, total_xp, current_level")
    .eq("user_id", user.id)
    .maybeSingle();
  const streakRow = streakRaw as unknown as Pick<StreakRow, "current_streak" | "total_xp" | "current_level"> | null;
  const currentStreak = streakRow?.current_streak ?? 0;

  // ----- Spurgeon entries -----
  // Default to enabled unless user has explicitly disabled via meta.spurgeon_enabled = false
  const spurgeonEnabled = displaySettings?.meta?.spurgeon_enabled !== false;
  let spurgeonEntries: SpurgeonEntry[] = [];
  if (spurgeonEnabled) {
    const { data: spurgeonData } = await supabase
      .from("spurgeon_index")
      .select("id, date_key, title, body, source")
      .eq("book", bookCode)
      .eq("chapter", chapterNum)
      .eq("source", "morning_evening");
    if (spurgeonData) {
      spurgeonEntries = spurgeonData as unknown as SpurgeonEntry[];
    }
  }

  // ----- Hymn connections -----
  let hymns: HymnEntry[] = [];
  {
    const { data: hymnData } = await supabase
      .from("hymn_index")
      .select("id, title, first_line, tune_name, lyrics, explicit_refs")
      .overlaps("explicit_refs" as never, [`${bookData.name} ${chapterNum}`] as never);
    if (hymnData) {
      hymns = (hymnData as unknown as HymnEntry[]);
    }
  }

  return (
    <ReadingView
      bookCode={bookCode}
      bookName={bookData.name}
      chapter={chapterNum}
      chapterData={chapterData}
      unavailableReason={chapterData ? null : getUnavailableReason(translation)}
      translation={translation}
      userTier={userTier}
      spurgeonEnabled={spurgeonEnabled}
      spurgeonEntries={spurgeonEntries}
      currentStreak={currentStreak}
      prevChapter={prev ? { book: prev.book, chapter: prev.chapter } : null}
      nextChapter={next ? { book: next.book, chapter: next.chapter } : null}
      hymns={hymns}
    />
  );
}

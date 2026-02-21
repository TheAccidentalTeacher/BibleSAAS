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

  if (qsTranslation) {
    const valid = TRANSLATIONS.find(
      (t) => t.code === qsTranslation.toUpperCase()
    );
    if (valid) translation = valid.code;
  } else {
    const { data: displaySettings } = await supabase
      .from("user_display_settings")
      .select("default_translation")
      .eq("user_id", user.id)
      .maybeSingle();

    if (displaySettings?.default_translation) {
      translation = displaySettings.default_translation as string;
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

  return (
    <ReadingView
      bookCode={bookCode}
      bookName={bookData.name}
      chapter={chapterNum}
      chapterData={chapterData}
      unavailableReason={chapterData ? null : getUnavailableReason(translation)}
      translation={translation}
      userTier={userTier}
      prevChapter={prev ? { book: prev.book, chapter: prev.chapter } : null}
      nextChapter={next ? { book: next.book, chapter: next.chapter } : null}
    />
  );
}

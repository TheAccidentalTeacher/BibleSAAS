"use client";

/**
 * ReadingView — Main Bible reading screen, client component.
 *
 * Responsibilities:
 *  - Mode toggle (Just Read / Study)
 *  - Translation picker
 *  - Chapter navigation
 *  - Verse rendering with drop-cap chapter number
 *  - ESV attribution footer
 *  - Charles content fetch (2-second delay, cached via DB)
 *  - CharlesCard display + dismiss/re-open
 *  - OIASheet trigger + questions
 *  - Spurgeon cards (morning at top, evening at bottom)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  BookOpen,
  FlaskConical,
  MessageSquare,
} from "lucide-react";
import TranslationPicker from "./translation-picker";
import CharlesCard from "./charles-card";
import OIASheet from "./oia-sheet";
import SpurgeonCard, { type SpurgeonEntry } from "./spurgeon-card";
import type { ReadingChapter } from "@/lib/bible/types";
import type { ChapterContent, OIAQuestion } from "@/lib/charles/content";

// Fallback OIA questions for free / no-content scenarios
const FALLBACK_QUESTIONS: OIAQuestion[] = [
  { oia_type: "observe", text: "What specific details does the author include? What's actually being described?", answer_prompt: "Look closely at the words and structure." },
  { oia_type: "observe", text: "Who are the people in this passage, and what are they doing?", answer_prompt: "Names, actions, relationships." },
  { oia_type: "observe", text: "What words or phrases repeat? What gets the most emphasis?", answer_prompt: "Count what appears more than once." },
  { oia_type: "interpret", text: "What does this passage reveal about the character of God, or what God is doing in history?", answer_prompt: "What do you understand about God from this text?" },
  { oia_type: "apply", text: "Where does this passage challenge something you believe or how you live?", answer_prompt: "Be specific — what needs to change?" },
];

interface ReadingViewProps {
  bookCode: string;
  bookName: string;
  chapter: number;
  chapterData: ReadingChapter | null;
  unavailableReason: string | null;
  translation: string;
  userTier: string;
  spurgeonEnabled: boolean;
  spurgeonEntries: SpurgeonEntry[];
  prevChapter: { book: string; chapter: number } | null;
  nextChapter: { book: string; chapter: number } | null;
}

export default function ReadingView({
  bookCode,
  bookName,
  chapter,
  chapterData,
  unavailableReason,
  translation,
  userTier,
  spurgeonEnabled,
  spurgeonEntries,
  prevChapter,
  nextChapter,
}: ReadingViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"read" | "study">("read");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [charlesVisible, setCharlesVisible] = useState(false);
  const [charlesDismissed, setCharlesDismissed] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContent = useCallback(async () => {
    skeletonTimer.current = setTimeout(() => setShowSkeleton(true), 500);
    setContentLoading(true);
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: bookCode, chapter }),
      });
      const json = (await res.json()) as { content: ChapterContent | null };
      setContent(json.content ?? null);
    } catch {
      setContent(null);
    } finally {
      if (skeletonTimer.current) clearTimeout(skeletonTimer.current);
      setShowSkeleton(false);
      setContentLoading(false);
      setCharlesVisible(true);
    }
  }, [bookCode, chapter]);

  useEffect(() => {
    appearTimer.current = setTimeout(() => {
      if (userTier === "free") {
        setCharlesVisible(true);
        return;
      }
      fetchContent();
    }, 2000);
    return () => {
      if (appearTimer.current) clearTimeout(appearTimer.current);
      if (skeletonTimer.current) clearTimeout(skeletonTimer.current);
    };
  }, [bookCode, chapter, userTier, fetchContent]);

  const questions: OIAQuestion[] =
    content?.questions?.length ? content.questions : FALLBACK_QUESTIONS;

  const morningEntry = spurgeonEnabled
    ? (spurgeonEntries.find((e) => e.date_key?.endsWith("_am")) ?? null)
    : null;

  const eveningEntry = spurgeonEnabled
    ? (spurgeonEntries.find((e) => e.date_key?.endsWith("_pm")) ?? null)
    : null;

  function navigateTo(book: string, ch: number, trans: string) {
    router.push(`/read/${book}/${ch}?translation=${trans}`);
  }

  function handleTranslationSelect(slug: string) {
    setPickerOpen(false);
    router.push(`/read/${bookCode}/${chapter}?translation=${slug}`);
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* ── Top Bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-[52px] border-b"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Prev chapter */}
        <button
          onClick={() =>
            prevChapter && navigateTo(prevChapter.book, prevChapter.chapter, translation)
          }
          disabled={!prevChapter}
          aria-label="Previous chapter"
          className="flex items-center justify-center w-8 h-8 rounded transition-opacity disabled:opacity-30"
          style={{ color: "var(--color-text-2)" }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Title */}
        <div className="flex-1 text-center">
          <p
            className="font-medium tracking-wide uppercase truncate"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "var(--color-text-2)",
            }}
          >
            {bookName} {chapter}
          </p>
        </div>

        {/* Next chapter */}
        <button
          onClick={() =>
            nextChapter && navigateTo(nextChapter.book, nextChapter.chapter, translation)
          }
          disabled={!nextChapter}
          aria-label="Next chapter"
          className="flex items-center justify-center w-8 h-8 rounded transition-opacity disabled:opacity-30"
          style={{ color: "var(--color-text-2)" }}
        >
          <ArrowRight size={18} />
        </button>

        {/* Bookmark */}
        <button
          aria-label="Bookmark"
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: "var(--color-text-2)" }}
        >
          <Bookmark size={18} />
        </button>

        {/* Share */}
        <button
          aria-label="Share"
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: "var(--color-text-2)" }}
        >
          <Share2 size={18} />
        </button>
      </header>

      {/* ── Secondary controls: mode toggle + translation pill ── */}
      <div
        className="flex items-center justify-between px-5 py-2 border-b"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Mode toggle */}
        <div
          className="flex items-center rounded-full overflow-hidden border"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setMode("read")}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background:
                mode === "read"
                  ? "var(--color-accent)"
                  : "var(--color-surface-2)",
              color:
                mode === "read"
                  ? "var(--color-bg)"
                  : "var(--color-text-2)",
            }}
          >
            <BookOpen size={13} />
            Just Read
          </button>
          <button
            onClick={() => setMode("study")}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background:
                mode === "study"
                  ? "var(--color-accent)"
                  : "var(--color-surface-2)",
              color:
                mode === "study"
                  ? "var(--color-bg)"
                  : "var(--color-text-2)",
            }}
          >
            <FlaskConical size={13} />
            Study
          </button>
        </div>

        {/* Translation pill */}
        <button
          onClick={() => setPickerOpen(true)}
          className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
          style={{
            background: "var(--color-surface-2)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-1)",
          }}
        >
          {translation}
        </button>
      </div>

      {/* ── Main text area ── */}
      <main className="flex-1 px-5 pb-28 pt-6 max-w-[680px] mx-auto w-full">
        {/* Spurgeon morning card — above chapter */}
        {morningEntry && (
          <SpurgeonCard entry={morningEntry} position="top" />
        )}

        {/* Unavailable state */}
        {!chapterData && (
          <div
            className="mt-12 text-center rounded-xl p-8 border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-2)",
            }}
          >
            <p className="text-sm leading-relaxed">{unavailableReason}</p>
            <p className="mt-3 text-xs" style={{ color: "var(--color-text-3)" }}>
              Free translations (WEB, KJV, ASV, YLT) will be available after
              the database seed scripts are run.
            </p>
          </div>
        )}

        {/* Chapter text */}
        {chapterData && (
          <div className="relative">
            {/* Drop-cap chapter number */}
            <span
              aria-hidden
              className="select-none pointer-events-none absolute top-0 left-0 leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "64px",
                color: "var(--color-text-3)",
                opacity: 0.35,
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {chapter}
            </span>

            {/* Verses */}
            <div style={{ paddingLeft: "40px" }}>
              {chapterData.verses.map((verse) => (
                <span
                  key={verse.verse}
                  className="reading-verse"
                  style={{
                    display: "block",
                    marginTop: verse.paragraph_start ? "1.5em" : "0",
                  }}
                >
                  <span className="reading-verse-num">{verse.verse}</span>
                  {verse.text}{" "}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ESV attribution — required by license */}
        {chapterData?.attribution && (
          <p
            className="mt-10 text-[10px] leading-relaxed border-t pt-4"
            style={{
              color: "var(--color-text-3)",
              borderColor: "var(--color-border)",
            }}
          >
            {chapterData.attribution}
          </p>
        )}

        {/* Spurgeon evening card — below chapter */}
        {eveningEntry && (
          <SpurgeonCard entry={eveningEntry} position="bottom" />
        )}

        {/* Charles card — appears 2s after mount */}
        {charlesVisible && !charlesDismissed && (
          <div className="mt-6">
            <CharlesCard
              userTier={userTier}
              content={content}
              loading={contentLoading && showSkeleton}
              onStudyClick={() => setStudyOpen(true)}
              onDismiss={() => setCharlesDismissed(true)}
            />
          </div>
        )}
      </main>

      {/* ─── Charles re-summon button ─── */}
      {charlesDismissed && (
        <button
          onClick={() => {
            setCharlesDismissed(false);
            setCharlesVisible(true);
          }}
          className="fixed bottom-6 right-5 z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-lg"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg)",
          }}
          aria-label="Open Charles commentary"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {pickerOpen && (
        <TranslationPicker
          currentTranslation={translation}
          userTier={userTier}
          onSelect={handleTranslationSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {/* ── OIA Study sheet ── */}
      {studyOpen && (
        <OIASheet
          bookCode={bookCode}
          bookName={bookName}
          chapter={chapter}
          translation={translation}
          questions={questions}
          onClose={() => setStudyOpen(false)}
        />
      )}
    </div>
  );
}

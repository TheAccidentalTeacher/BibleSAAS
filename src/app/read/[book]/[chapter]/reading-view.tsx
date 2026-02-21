"use client";

/**
 * ReadingView — Main Bible reading screen, client component.
 *
 * Handles:
 *  - Just Read / Study mode toggle
 *  - Translation switcher (via TranslationPicker bottom sheet)
 *  - Chapter navigation
 *  - Verse rendering with drop-cap chapter number
 *  - ESV attribution footer
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Share2,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import TranslationPicker from "./translation-picker";
import type { ReadingChapter } from "@/lib/bible/types";

interface ReadingViewProps {
  bookCode: string;
  bookName: string;
  chapter: number;
  chapterData: ReadingChapter | null;
  unavailableReason: string | null;
  translation: string;
  userTier: string;
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
  prevChapter,
  nextChapter,
}: ReadingViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"read" | "study">("read");
  const [pickerOpen, setPickerOpen] = useState(false);

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
      <main className="flex-1 px-5 pb-16 pt-6 max-w-[680px] mx-auto w-full">
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
      </main>

      {/* ── Translation picker sheet ── */}
      {pickerOpen && (
        <TranslationPicker
          currentTranslation={translation}
          userTier={userTier}
          onSelect={handleTranslationSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

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
  Flame,
  Headphones,
} from "lucide-react";
import { useAudioState, useAudioActions } from "@/context/audio-context";
import TranslationPicker from "./translation-picker";
import CharlesCard from "./charles-card";
import OIASheet from "./oia-sheet";
import SpurgeonCard, { type SpurgeonEntry } from "./spurgeon-card";
import VerseActionMenu, {
  type HighlightColor,
  type HighlightState,
  type BookmarkState,
  HIGHLIGHT_BG,
} from "./verse-action-menu";
import MemorizeSheet from "./memorize-sheet";
import ShareSheet from "./share-sheet";
import VerseThreadPanel from "./verse-thread-panel";
import WordNotePopover from "./word-note-popover";
import AchievementToast from "@/components/gamification/achievement-toast";
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
  currentStreak: number;
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
  currentStreak,
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

  // ── Gamification state ────────────────────────────────────────────────────
  const [streak, setStreak] = useState(currentStreak);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const chapterMarkedRef = useRef(false);
  const readSentinelRef = useRef<HTMLDivElement | null>(null);

  const skeletonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-mark chapter as read when sentinel enters viewport ───────────────
  useEffect(() => {
    chapterMarkedRef.current = false;
    const sentinel = readSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !chapterMarkedRef.current) {
          chapterMarkedRef.current = true;
          void (async () => {
            const res = await fetch("/api/reading-progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ book: bookCode, chapter }),
            });
            if (res.ok) {
              const data = await res.json() as { streak?: number; achievements?: string[] };
              if (data.streak !== undefined) setStreak(data.streak);
              if (data.achievements?.length) setEarnedAchievements(data.achievements);
            }
          })();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [bookCode, chapter]);

  // ── Audio player state ──────────────────────────────────────────
  const audioState = useAudioState();
  const audioActions = useAudioActions();
  const isThisChapterAudio = audioState.book === bookCode && audioState.chapter === chapter;

  async function handleListen() {
    if (isThisChapterAudio) {
      // Toggle play/pause
      audioState.isPlaying ? audioActions.pause() : audioActions.play();
      return;
    }
    if (!chapterData) return;
    // Check for saved progress
    let resumeSeconds = 0;
    try {
      const r = await fetch(`/api/audio/progress?book=${bookCode}&chapter=${chapter}`);
      if (r.ok) {
        const p = await r.json() as { position_seconds: number; completed: boolean };
        if (!p.completed) resumeSeconds = p.position_seconds;
      }
    } catch (_) { /* ignore */ }

    audioActions.loadChapter({
      book: bookCode,
      bookName,
      chapter,
      verses: chapterData.verses.map((v) => ({ verse: v.verse, text: v.text })),
      mode: "tts",   // TTS mode (no ESV Audio key)
      audioUrl: null,
      resumeSeconds,
    });
    // Small delay for state to settle, then play
    setTimeout(() => audioActions.play(), 50);
  }

  // Auto-scroll to current read-along verse
  useEffect(() => {
    if (!isThisChapterAudio || !audioState.readAlong || !audioState.currentVerse) return;
    const el = document.getElementById(`verse-${audioState.currentVerse}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [audioState.currentVerse, isThisChapterAudio, audioState.readAlong]);

  // ── Highlights & Bookmarks ──────────────────────────────────────────────
  const [highlights, setHighlights] = useState<HighlightState[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkState[]>([]);
  const [activeMenu, setActiveMenu] = useState<{
    verse: number;
    anchorY: number;
  } | null>(null);

  // ── Memory verse markers ──────────────────────────────────────────────────
  // Set of verse numbers that are already in the memory queue for this chapter
  const [memorizedVerses, setMemorizedVerses] = useState<Set<number>>(new Set());
  // Set of verse numbers that are due for review today
  const [memoryDueVerses, setMemoryDueVerses] = useState<Set<number>>(new Set());
  const [memorySheetVerse, setMemorySheetVerse] = useState<number | null>(null);

  // ── Share sheet ─────────────────────────────────────────────────────────────
  const [shareTarget, setShareTarget] = useState<{
    verse: number;
    text: string;
    note: string | null;
  } | null>(null);

  // ── Verse threads ────────────────────────────────────────────────────────────
  const [threadVerse, setThreadVerse] = useState<number | null>(null);
  const [threadVerses, setThreadVerses] = useState<Set<number>>(new Set());
  const [familyAccentColor, setFamilyAccentColor] = useState("#7C6B5A");

  // ── Word note popover ────────────────────────────────────────────────────────
  interface WordNote {
    original: string;
    transliteration: string | null;
    strongs_number: string;
    language: string;
    short_def: string | null;
    synthesis: string | null;
    total_occurrences: number | null;
  }
  const [wordNote, setWordNote] = useState<{ note: WordNote; anchorY: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWordLongPress = useCallback(async (verse: number, wordPos: number, anchorY: number) => {
    const res = await fetch(`/api/word-note?book=${bookCode}&chapter=${chapter}&verse=${verse}&word_pos=${wordPos}`);
    if (res.ok) {
      const data = await res.json() as { found: boolean; word?: WordNote };
      if (data.found && data.word) {
        setWordNote({ note: data.word, anchorY });
      }
    }
  }, [bookCode, chapter]);

  // Load highlights + bookmarks when chapter changes
  useEffect(() => {
    let cancelled = false;
    async function loadAnnotations() {
      const [hlRes, bmRes] = await Promise.all([
        fetch(`/api/highlights?book=${bookCode}&chapter=${chapter}`),
        fetch(`/api/bookmarks?book=${bookCode}&chapter=${chapter}`),
      ]);
      if (cancelled) return;
      if (hlRes.ok) {
        const j = await hlRes.json() as { highlights: Array<{ id: string; verse_start: number; verse_end: number | null; color: string; note: string | null }> };
        setHighlights(
          j.highlights.map((h) => ({
            id: h.id,
            verse_start: h.verse_start,
            verse_end: h.verse_end,
            color: h.color as HighlightColor,
            note: h.note,
          }))
        );
      }
      if (bmRes.ok) {
        const j = await bmRes.json() as { bookmarks: Array<{ id: string; verse: number | null }> };
        setBookmarks(
          j.bookmarks
            .filter((b) => b.verse !== null)
            .map((b) => ({ id: b.id, verse: b.verse! }))
        );
      }
    }
    setHighlights([]);
    setBookmarks([]);
    loadAnnotations();
    return () => { cancelled = true; };
  }, [bookCode, chapter]);

  // Load memory markers for this chapter
  useEffect(() => {
    let cancelled = false;
    async function loadMemoryMarkers() {
      const res = await fetch(`/api/memory?book=${bookCode}&chapter=${chapter}`);
      if (cancelled) return;
      if (res.ok) {
        const j = await res.json() as { markers: Array<{ verse: number; mastered: boolean; due: boolean }> };
        const memorized = new Set<number>();
        const due = new Set<number>();
        for (const m of j.markers) {
          memorized.add(m.verse);
          if (m.due) due.add(m.verse);
        }
        setMemorizedVerses(memorized);
        setMemoryDueVerses(due);
      }
    }
    setMemorizedVerses(new Set());
    setMemoryDueVerses(new Set());
    void loadMemoryMarkers();
    return () => { cancelled = true; };
  }, [bookCode, chapter]);

  // Load verse thread markers for this chapter
  useEffect(() => {
    let cancelled = false;
    async function loadThreadMarkers() {
      const res = await fetch(`/api/verse-thread?book=${bookCode}&chapter=${chapter}`);
      if (cancelled) return;
      if (res.ok) {
        const j = await res.json() as { has_threads: number[] };
        setThreadVerses(new Set(j.has_threads ?? []));
      }
    }
    setThreadVerses(new Set());
    void loadThreadMarkers();
    return () => { cancelled = true; };
  }, [bookCode, chapter]);

  // Load family unit accent color (once on mount)
  useEffect(() => {
    fetch("/api/family")
      .then((r) => r.ok ? r.json() : null)
      .then((j: { unit?: { accent_color?: string } } | null) => {
        if (j?.unit?.accent_color) setFamilyAccentColor(j.unit.accent_color);
      })
      .catch(() => {/* ignore */});
  }, []);

  const handleHighlight = useCallback(async (verse: number, color: HighlightColor) => {
    const res = await fetch("/api/highlights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book: bookCode, chapter, verse_start: verse, color }),
    });
    if (res.ok) {
      const j = await res.json() as { highlight: { id: string; verse_start: number; verse_end: number | null; color: string; note: string | null } };
      const h = j.highlight;
      setHighlights((prev) => {
        const without = prev.filter((x) => x.verse_start !== verse);
        return [...without, { id: h.id, verse_start: h.verse_start, verse_end: h.verse_end, color: h.color as HighlightColor, note: h.note }];
      });
    }
  }, [bookCode, chapter]);

  const handleRemoveHighlight = useCallback(async (id: string) => {
    await fetch("/api/highlights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleAddNote = useCallback(async (id: string, note: string) => {
    const res = await fetch("/api/highlights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, note }),
    });
    if (res.ok) {
      setHighlights((prev) => prev.map((h) => h.id === id ? { ...h, note } : h));
    }
  }, []);

  const handleBookmark = useCallback(async (verse: number) => {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book: bookCode, chapter, verse }),
    });
    if (res.ok) {
      const j = await res.json() as { bookmark: { id: string; verse: number | null } };
      if (j.bookmark.verse !== null) {
        setBookmarks((prev) => [...prev.filter((b) => b.verse !== verse), { id: j.bookmark.id, verse: j.bookmark.verse! }]);
      }
    }
  }, [bookCode, chapter]);

  const handleRemoveBookmark = useCallback(async (verse: number) => {
    const bm = bookmarks.find((b) => b.verse === verse);
    if (!bm) return;
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bm.id }),
    });
    setBookmarks((prev) => prev.filter((b) => b.verse !== verse));
  }, [bookmarks]);

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
          onClick={() => {
            if (chapterData?.verses?.length) {
              const v = chapterData.verses[0];
              const hl = highlights.find((h) => v.verse >= h.verse_start && (h.verse_end === null || v.verse <= h.verse_end));
              setShareTarget({ verse: v.verse, text: v.text, note: hl?.note ?? null });
            }
          }}
          aria-label="Share"
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: "var(--color-text-2)" }}
        >
          <Share2 size={18} />
        </button>

        {/* Listen */}
        {chapterData && (
          <button
            onClick={handleListen}
            aria-label={isThisChapterAudio && audioState.isPlaying ? "Pause audio" : "Listen to chapter"}
            className="flex items-center justify-center w-8 h-8 rounded"
            style={{ color: isThisChapterAudio ? "var(--color-accent)" : "var(--color-text-2)" }}
          >
            <Headphones size={18} />
          </button>
        )}

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="flex items-center gap-0.5 text-[12px] font-semibold"
            style={{ color: "var(--color-accent)" }}
            title={`${streak}-day streak`}
          >
            <Flame size={14} />
            {streak}
          </div>
        )}
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
              {chapterData.verses.map((v) => {
                const hl = highlights.find(
                  (h) =>
                    v.verse >= h.verse_start &&
                    (h.verse_end === null || v.verse <= h.verse_end)
                ) ?? null;
                const bm = bookmarks.find((b) => b.verse === v.verse) ?? null;
                const isReadAlongVerse =
                  isThisChapterAudio &&
                  audioState.readAlong &&
                  audioState.currentVerse === v.verse;
                return (
                  <span
                    key={v.verse}
                    className="reading-verse"
                    id={`verse-${v.verse}`}
                    style={{
                      display: "block",
                      marginTop: v.paragraph_start ? "1.5em" : "0",
                      background: isReadAlongVerse
                        ? "rgba(245,158,11,0.20)"
                        : hl ? HIGHLIGHT_BG[hl.color] : undefined,
                      borderRadius: (isReadAlongVerse || hl) ? "4px" : undefined,
                      outline: isReadAlongVerse ? "1.5px solid rgba(245,158,11,0.5)" : undefined,
                      transition: "background 0.2s, outline 0.2s",
                    }}
                  >
                    {/* Verse number — tap to open action menu */}
                    <button
                      className="reading-verse-num"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setActiveMenu({ verse: v.verse, anchorY: rect.bottom + window.scrollY });
                      }}
                      aria-label={`Verse ${v.verse} actions`}
                      title="Highlight or bookmark this verse"
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      {v.verse}
                      {/* Bookmark dot */}
                      {bm && (
                        <span
                          aria-label="Bookmarked"
                          className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--color-accent)" }}
                        />
                      )}
                      {/* Note indicator */}
                      {hl?.note && (
                        <span
                          aria-label="Has note"
                          className="absolute -bottom-0.5 -right-1 w-1.5 h-1.5 rounded-full"
                          style={{ background: "#F0954A" }}
                        />
                      )}
                      {/* Memory star */}
                      {memorizedVerses.has(v.verse) && (
                        <span
                          aria-label={memoryDueVerses.has(v.verse) ? "Due for review" : "Memorized"}
                          className="absolute -top-1.5 -left-1 text-[9px] leading-none"
                          title={memoryDueVerses.has(v.verse) ? "Due for review today" : "In memory queue"}
                          style={{ color: memoryDueVerses.has(v.verse) ? "#f59e0b" : "#8b5cf6" }}
                        >
                          ★
                        </span>
                      )}
                      {/* Thread flame dot */}
                      {threadVerses.has(v.verse) && (
                        <span
                          aria-label="Has thread"
                          title="Family thread on this verse"
                          className="absolute -bottom-1 -left-0.5 text-[9px] leading-none"
                          style={{ color: familyAccentColor }}
                        >
                          🔥
                        </span>
                      )}
                    </button>
                    {/* Verse words — each word is tappable for word note */}
                    {v.text.split(/(\s+)/).map((token, idx) => {
                      if (/^\s+$/.test(token)) return token;
                      const wordPos = Math.ceil((idx + 1) / 2);
                      return (
                        <span
                          key={idx}
                          onTouchStart={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const ay = rect.bottom + window.scrollY;
                            longPressTimer.current = setTimeout(() => {
                              void handleWordLongPress(v.verse, wordPos, ay);
                            }, 500);
                          }}
                          onTouchEnd={() => {
                            if (longPressTimer.current) clearTimeout(longPressTimer.current);
                          }}
                          onTouchMove={() => {
                            if (longPressTimer.current) clearTimeout(longPressTimer.current);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            void handleWordLongPress(v.verse, wordPos, rect.bottom + window.scrollY);
                          }}
                          style={{ cursor: "default", userSelect: "none" }}
                        >
                          {token}
                        </span>
                      );
                    })}{" "}
                  </span>
                );
              })}
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

        {/* Read sentinel — triggers chapter-read event when scrolled into view */}
        <div ref={readSentinelRef} style={{ height: 1 }} aria-hidden />
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

      {/* ── Verse Action Menu ── */}
      {activeMenu && (
        <VerseActionMenu
          verse={activeMenu.verse}
          anchorY={activeMenu.anchorY}
          existingHighlight={
            highlights.find(
              (h) =>
                activeMenu.verse >= h.verse_start &&
                (h.verse_end === null || activeMenu.verse <= h.verse_end)
            ) ?? null
          }
          isBookmarked={bookmarks.some((b) => b.verse === activeMenu.verse)}
          isMemorized={memorizedVerses.has(activeMenu.verse)}
          hasThread={threadVerses.has(activeMenu.verse)}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          onAddNote={handleAddNote}
          onBookmark={handleBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onMemorize={(v) => setMemorySheetVerse(v)}
          onShare={(v) => {
            const vData = chapterData?.verses.find((x) => x.verse === v);
            const hl = vData ? highlights.find((h) => v >= h.verse_start && (h.verse_end === null || v <= h.verse_end)) : null;
            if (vData) setShareTarget({ verse: v, text: vData.text, note: hl?.note ?? null });
          }}
          onThread={(v) => setThreadVerse(v)}
          onClose={() => setActiveMenu(null)}
        />
      )}
      {/* ── Memorize Sheet ── */}
      {memorySheetVerse !== null && chapterData && (() => {
        const vData = chapterData.verses.find((v) => v.verse === memorySheetVerse);
        if (!vData) return null;
        return (
          <MemorizeSheet
            book={bookCode}
            bookName={bookName}
            chapter={chapter}
            verse={memorySheetVerse}
            verseText={vData.text}
            translation={translation}
            alreadyMemorized={memorizedVerses.has(memorySheetVerse)}
            onClose={() => setMemorySheetVerse(null)}
            onSuccess={(v) => {
              setMemorizedVerses((prev) => new Set([...prev, v]));
            }}
          />
        );
      })()}

      {/* ── Achievement Toast ── */}
      <AchievementToast
        earned={earnedAchievements}
        onDismiss={() => setEarnedAchievements([])}
      />

      {/* ── Word Note Popover ── */}
      {wordNote && (
        <WordNotePopover
          note={wordNote.note}
          anchorY={wordNote.anchorY}
          onClose={() => setWordNote(null)}
        />
      )}

      {/* ── Share Sheet ── */}
      {shareTarget && (
        <ShareSheet
          book={bookCode}
          bookName={bookName}
          chapter={chapter}
          verse={shareTarget.verse}
          verseText={shareTarget.text}
          translation={translation}
          note={shareTarget.note}
          onClose={() => setShareTarget(null)}
        />
      )}

      {/* ── Verse Thread Panel ── */}
      {threadVerse !== null && chapterData && (() => {
        const vData = chapterData.verses.find((v) => v.verse === threadVerse);
        if (!vData) return null;
        return (
          <VerseThreadPanel
            book={bookCode}
            bookName={bookName}
            chapter={chapter}
            verse={threadVerse}
            verseText={vData.text}
            accentColor={familyAccentColor}
            onClose={() => {
              setThreadVerse(null);
              // Reload thread markers to reflect new messages
              void fetch(`/api/verse-thread?book=${bookCode}&chapter=${chapter}`)
                .then((r) => r.ok ? r.json() : null)
                .then((j: { has_threads?: number[] } | null) => {
                  if (j?.has_threads) setThreadVerses(new Set(j.has_threads));
                });
            }}
          />
        );
      })()}
    </div>
  );
}

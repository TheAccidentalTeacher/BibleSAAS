"use client";

/**
 * ThreadTheNeedle — Find the shortest cross-reference path between two verses.
 *
 * Daily puzzle: two verses are picked deterministically from the date.
 * User taps TSK refs to navigate, building a path.
 * Completes when the target verse is a cross-reference of the current step.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitFork, ArrowRight, Check, Clock, RotateCcw, Trophy } from "lucide-react";

// ── Hardcoded daily puzzles (indexed by day-of-year mod length) ──────────────
// Each puzzle: [start-book, start-ch, start-v, target-book, target-ch, target-v, hint]
const PUZZLES: [string, number, number, string, number, number, string][] = [
  ["Genesis", 22, 8, "John", 1, 29, "Both speak of a lamb provided by God."],
  ["Deuteronomy", 18, 15, "John", 6, 14, "Prophet foretold; people wonder at the sign."],
  ["Psalm", 22, 1, "Matthew", 27, 46, "A cry of desolation."],
  ["Isaiah", 53, 5, "1 Peter", 2, 24, "Healing through wounds."],
  ["Micah", 5, 2, "Matthew", 2, 6, "A ruler's birthplace foretold."],
  ["Malachi", 4, 5, "Matthew", 11, 14, "Elijah expected."],
  ["Genesis", 3, 15, "Revelation", 12, 9, "The ancient serpent."],
  ["Leviticus", 16, 21, "Hebrews", 9, 7, "The scapegoat and the high priest."],
];

function getDailyPuzzleIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return dayOfYear % PUZZLES.length;
}

interface TskRef {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  ref: string;
}

interface PathStep {
  book: string;
  chapter: number;
  verse: number;
  ref: string;
}

export default function ThreadTheNeedleClient() {
  const router = useRouter();
  const puzzle = PUZZLES[getDailyPuzzleIndex()];
  const [startBook, startCh, startV, targetBook, targetCh, targetV, puzzleHint] = puzzle;

  const startRef = `${startBook} ${startCh}:${startV}`;
  const targetRef = `${targetBook} ${targetCh}:${targetV}`;

  const [path, setPath] = useState<PathStep[]>([
    { book: startBook, chapter: startCh, verse: startV, ref: startRef },
  ]);
  const [currentRefs, setCurrentRefs] = useState<TskRef[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentStep = path[path.length - 1];

  // Elapsed timer
  useEffect(() => {
    if (completed) return;
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [completed, startTime]);

  // Load TSK refs for the current step
  const loadRefs = useCallback(async (book: string, chapter: number, verse: number) => {    setLoadingRefs(true);
    try {
      const res = await fetch(`/api/tsk?book=${book}&chapter=${chapter}&verse=${verse}`);
      if (res.ok) {
        const data = await res.json() as { refs: TskRef[] };
        setCurrentRefs(data.refs);

        // Check if target is reachable from here
        const targetFound = data.refs.some(
          (r) => r.book === targetBook && r.chapter === targetCh && r.verse === targetV
        );
        if (targetFound) {
          // Don't auto-complete — let user tap the target ref
        }
      }
    } finally {
      setLoadingRefs(false);
    }
  }, [targetBook, targetCh, targetV]);

  useEffect(() => {
    void loadRefs(currentStep.book, currentStep.chapter, currentStep.verse);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep.book, currentStep.chapter, currentStep.verse]);

  function handlePickRef(ref: TskRef) {
    if (completed) return;

    const newStep: PathStep = {
      book: ref.book,
      chapter: ref.chapter,
      verse: ref.verse,
      ref: ref.ref,
    };
    const newPath = [...path, newStep];
    setPath(newPath);

    // Check if we reached the target
    if (ref.book === targetBook && ref.chapter === targetCh && ref.verse === targetV) {
      setCompleted(true);
    }
  }

  async function handleSubmitTrail() {
    if (submitted) return;
    setSubmitted(true);

    // Create a trail recording this path
    const createRes = await fetch("/api/trails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book: startBook,
        chapter: startCh,
        verse: startV,
        trail_type: "thread_needle",
      }),
    });
    if (!createRes.ok) return;
    const { trail_id } = await createRes.json() as { trail_id: string };

    // Add remaining steps
    for (const step of path.slice(1)) {
      await fetch(`/api/trails/${trail_id}/add-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: step.book, chapter: step.chapter, verse: step.verse }),
      });
    }

    router.push(`/trails/${trail_id}`);
  }

  function handleReset() {
    setPath([{ book: startBook, chapter: startCh, verse: startV, ref: startRef }]);
    setCompleted(false);
    setSubmitted(false);
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <main
      className="min-h-screen pb-28 px-5 pt-6"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <Link
        href="/trails"
        className="flex items-center gap-1.5 mb-6 text-sm w-fit"
        style={{ color: "var(--color-text-3)" }}
      >
        ← Trails
      </Link>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <GitFork size={18} style={{ color: "var(--color-accent)" }} />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Thread the Needle
        </h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-3)" }}>
        Navigate cross-references from start to target in as few steps as possible.
      </p>

      {/* Puzzle card */}
      <div
        className="rounded-2xl border p-5 mb-6"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--color-text-3)" }}>
              Start
            </p>
            <p
              className="text-base font-bold"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-accent)" }}
            >
              {startRef}
            </p>
          </div>
          <ArrowRight size={20} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--color-text-3)" }}>
              Target
            </p>
            <p
              className="text-base font-bold"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "#f59e0b" }}
            >
              {targetRef}
            </p>
          </div>
        </div>
        <p className="text-xs text-center italic" style={{ color: "var(--color-text-2)" }}>
          Hint: {puzzleHint}
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-5"
        style={{ background: "var(--color-surface-2)" }}
      >
        <div className="flex items-center gap-1.5">
          <GitFork size={13} style={{ color: "var(--color-text-3)" }} />
          <span className="text-sm font-semibold">{path.length - 1} steps</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} style={{ color: "var(--color-text-3)" }} />
          <span className="text-sm font-mono">{timeStr}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--color-text-3)" }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* ── Completed state ── */}
      {completed && (
        <div
          className="rounded-2xl border p-6 mb-6 text-center"
          style={{ borderColor: "#34d399", background: "rgba(52,211,153,0.08)" }}
        >
          <Trophy size={36} className="mx-auto mb-3" style={{ color: "#34d399" }} />
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Thread complete!
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-2)" }}>
            {path.length - 1} steps · {timeStr}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
              style={{
                borderColor: "var(--color-border)",
                background: "transparent",
                color: "var(--color-text-1)",
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              disabled={submitted}
              onClick={() => void handleSubmitTrail()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "#34d399",
                color: "#fff",
                opacity: submitted ? 0.6 : 1,
              }}
            >
              {submitted ? "Saving…" : "Save Trail"}
            </button>
          </div>
        </div>
      )}

      {/* ── Path so far ── */}
      <div className="mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-3)" }}>
          Your path
        </h2>
        <div className="flex flex-wrap gap-2">
          {path.map((step, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: i === path.length - 1 ? "var(--color-accent)" : "var(--color-surface-2)",
                color: i === path.length - 1 ? "var(--color-bg)" : "var(--color-text-1)",
              }}
            >
              {i > 0 && <ArrowRight size={10} />}
              {step.ref}
            </span>
          ))}
        </div>
      </div>

      {/* ── Available refs from current step ── */}
      {!completed && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-3)" }}>
            Cross-references from {currentStep.ref}
          </h2>

          {loadingRefs && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: "var(--color-surface-2)" }}
                />
              ))}
            </div>
          )}

          {!loadingRefs && currentRefs.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: "var(--color-text-3)" }}>
              No cross-references — try a different path.
            </p>
          )}

          {!loadingRefs && currentRefs.length > 0 && (
            <div className="space-y-1">
              {currentRefs.map((ref) => {
                const isTarget =
                  ref.book === targetBook &&
                  ref.chapter === targetCh &&
                  ref.verse === targetV;
                const alreadyVisited = path.some(
                  (p) => p.book === ref.book && p.chapter === ref.chapter && p.verse === ref.verse
                );

                return (
                  <button
                    key={ref.id}
                    type="button"
                    disabled={alreadyVisited}
                    onClick={() => handlePickRef(ref)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors disabled:opacity-40"
                    style={{
                      background: isTarget
                        ? "rgba(52,211,153,0.15)"
                        : "var(--color-surface)",
                      border: `1px solid ${isTarget ? "#34d399" : "var(--color-border)"}`,
                      color: isTarget ? "#34d399" : "var(--color-text-1)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono, monospace)" }}>
                      {ref.ref}
                    </span>
                    {isTarget ? (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Check size={12} /> Target!
                      </span>
                    ) : alreadyVisited ? (
                      <span className="text-[11px]" style={{ color: "var(--color-text-3)" }}>
                        visited
                      </span>
                    ) : (
                      <ArrowRight size={14} style={{ color: "var(--color-text-3)" }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

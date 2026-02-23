"use client";

/**
 * CatechismVerseSheet — Bottom slide-up panel showing catechism Q&As
 * that cite the tapped verse.
 */

import { X } from "lucide-react";
import type { CatechismVerseRef } from "@/app/api/catechism/verse-refs/route";

interface CatechismVerseSheetProps {
  bookName: string;
  chapter: number;
  verse: number;
  entries: CatechismVerseRef[];
  onClose: () => void;
}

const CATECHISM_LABELS: Record<string, string> = {
  wsc: "Westminster Shorter Catechism",
  hc: "Heidelberg Catechism",
  lbc1689: "1689 London Baptist Confession",
  WSC: "Westminster Shorter Catechism",
  HC: "Heidelberg Catechism",
  WLC: "Westminster Larger Catechism",
};

export default function CatechismVerseSheet({
  bookName,
  chapter,
  verse,
  entries,
  onClose,
}: CatechismVerseSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-t-3xl flex flex-col max-h-[80vh]"
        style={{ background: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--color-text-1)", fontFamily: "var(--font-display)" }}
            >
              Catechism — {bookName} {chapter}:{verse}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
              {entries.length} question{entries.length !== 1 ? "s" : ""} reference this verse
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-opacity hover:opacity-70">
            <X size={18} style={{ color: "var(--color-text-3)" }} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {entries.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "var(--color-text-3)" }}>
              No catechism entries found for this verse.
            </p>
          )}

          {entries.map((entry) => (
            <div
              key={entry.entryId}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--color-border)" }}
            >
              {/* Catechism + question number badge */}
              <div
                className="px-4 py-2 flex items-center gap-2"
                style={{ background: "rgba(196,160,64,0.10)" }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(196,160,64,0.2)", color: "#C4A040" }}
                >
                  {(CATECHISM_LABELS[entry.catechism] ?? entry.catechism).split(" ").map(w => w[0]).join("")}
                  {" "}Q.{entry.questionNumber}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                  {CATECHISM_LABELS[entry.catechism] ?? entry.catechism}
                </span>
              </div>

              <div className="px-4 py-3 space-y-2">
                {/* Question */}
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Q. {entry.questionNumber}
                  </p>
                  <p
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "var(--color-text-1)", fontFamily: "var(--font-garamond)" }}
                  >
                    {entry.questionText}
                  </p>
                </div>

                {/* Answer */}
                <div
                  className="rounded-xl p-3"
                  style={{ background: "var(--color-surface-2)" }}
                >
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1.5"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Answer
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-2)", fontFamily: "var(--font-garamond)" }}
                  >
                    {entry.answerText}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

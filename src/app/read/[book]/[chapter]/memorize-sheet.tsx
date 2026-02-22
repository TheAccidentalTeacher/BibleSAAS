"use client";

/**
 * MemorizeSheet — Bottom sheet for adding a verse to memory.
 *
 * Shows:
 * - Verse reference + full text
 * - Review mode selector (All / Flashcard / Fill in Blank / Word Order)
 * - "Add to Memory" confirm button
 * - Saving state feedback
 */

import { useState, useTransition } from "react";
import { X, Brain } from "lucide-react";

export type MemorizeReviewMode = "all" | "flashcard" | "fill_blank" | "word_order";

interface MemorizeSheetProps {
  book: string;       // e.g. "GEN"
  bookName: string;   // e.g. "Genesis"
  chapter: number;
  verse: number;
  verseText: string;
  translation: string;
  alreadyMemorized: boolean;
  onClose: () => void;
  onSuccess: (verseNum: number) => void;
}

const MODE_OPTIONS: { value: MemorizeReviewMode; label: string; desc: string }[] = [
  { value: "all", label: "Rotate All", desc: "Cycles through all 3 modes" },
  { value: "flashcard", label: "Flashcard", desc: "Reference on front, text on back" },
  { value: "fill_blank", label: "Fill in Blank", desc: "Type the missing words" },
  { value: "word_order", label: "Word Order", desc: "Arrange shuffled word chips" },
];

export default function MemorizeSheet({
  book,
  bookName,
  chapter,
  verse,
  verseText,
  translation,
  alreadyMemorized,
  onClose,
  onSuccess,
}: MemorizeSheetProps) {
  const [mode, setMode] = useState<MemorizeReviewMode>("all");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    startTransition(async () => {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book,
          chapter,
          verse,
          verse_text: verseText,
          translation,
          review_mode: mode,
        }),
      });
      if (res.ok) {
        setSaved(true);
        onSuccess(verse);
        setTimeout(onClose, 1200);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-t-2xl px-5 pt-5 pb-8 border-t"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={18} style={{ color: "var(--color-accent)" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--color-text-1)" }}>
              {alreadyMemorized ? "Update Memory Verse" : "Add to Memory"}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-text-3)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Verse reference + text */}
        <div
          className="rounded-xl p-4 mb-4 border-l-4"
          style={{
            background: "var(--color-surface-2)",
            borderLeftColor: "var(--color-accent)",
          }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
            {bookName} {chapter}:{verse} ({translation})
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-1)" }}>
            {verseText}
          </p>
        </div>

        {/* Review mode selector */}
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-2)" }}>
          Review mode
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className="text-left rounded-xl p-3 border transition-all"
              style={{
                background:
                  mode === opt.value
                    ? "rgba(var(--color-accent-rgb, 139, 92, 246), 0.12)"
                    : "var(--color-surface-2)",
                borderColor:
                  mode === opt.value
                    ? "var(--color-accent)"
                    : "var(--color-border)",
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{
                  color: mode === opt.value ? "var(--color-accent)" : "var(--color-text-1)",
                }}
              >
                {opt.label}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-3)" }}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Save button */}
        {saved ? (
          <div
            className="w-full py-3 rounded-full text-sm font-semibold text-center"
            style={{ background: "#22c55e", color: "#fff" }}
          >
            ✓ Added to memory queue
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-3 rounded-full text-sm font-semibold transition-opacity"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Saving…" : alreadyMemorized ? "Update" : "Add to Memory"}
          </button>
        )}
      </div>
    </div>
  );
}

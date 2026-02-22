"use client";

/**
 * WordNotePopover — small pop-over shown when user long-presses a word.
 * Shows: original word, transliteration, Charles synthesis sentence.
 * "Go Deeper" → navigates to /library/word-study/[strongs]
 */

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface WordNote {
  original: string;
  transliteration: string | null;
  strongs_number: string;
  language: string;
  short_def: string | null;
  synthesis: string | null;
  total_occurrences: number | null;
}

interface WordNotePopoverProps {
  note: WordNote;
  anchorY: number;
  onClose: () => void;
}

export default function WordNotePopover({ note, anchorY, onClose }: WordNotePopoverProps) {
  const router = useRouter();

  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const popoverH = 180;
  const top = anchorY + popoverH > viewportH - 20 ? anchorY - popoverH - 8 : anchorY + 24;

  const isHebrew = note.language === "hebrew";

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        className="fixed left-4 right-4 z-50 rounded-2xl shadow-2xl p-4 border"
        style={{
          top,
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p
              className="text-2xl font-bold leading-none"
              style={{
                fontFamily: isHebrew ? "serif" : "var(--font-display)",
                direction: isHebrew ? "rtl" : "ltr",
                color: "var(--color-text-1)",
              }}
            >
              {note.original}
            </p>
            {note.transliteration && (
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                {note.transliteration} · {note.strongs_number}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-text-3)" }}>
            <X size={15} />
          </button>
        </div>

        {note.synthesis && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-2)" }}>
            {note.synthesis}
          </p>
        )}

        {!note.synthesis && note.short_def && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-text-2)" }}>
            {note.short_def}
          </p>
        )}

        {note.total_occurrences != null && note.total_occurrences > 0 && (
          <p className="text-[10px] mb-3" style={{ color: "var(--color-text-3)" }}>
            Appears {note.total_occurrences.toLocaleString()} times in Scripture
          </p>
        )}

        <button
          onClick={() => {
            onClose();
            router.push(`/library/word-study/${note.strongs_number}`);
          }}
          className="w-full text-xs font-semibold py-2 px-4 rounded-full"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Go Deeper →
        </button>
      </div>
    </>
  );
}

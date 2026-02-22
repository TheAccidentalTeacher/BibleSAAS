"use client";

/**
 * ShareSheet — Bottom sheet for sharing a verse externally.
 * Options:
 *  - Copy verse text (formatted)
 *  - Copy verse + highlight note
 *  - Copy share link (creates shared_content row)
 */

import { useState } from "react";
import { X, Copy, Link, Check } from "lucide-react";

interface ShareSheetProps {
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  translation: string;
  note?: string | null;
  onClose: () => void;
}

export default function ShareSheet({
  book,
  bookName,
  chapter,
  verse,
  verseText,
  translation,
  note,
  onClose,
}: ShareSheetProps) {
  const [copied, setCopied] = useState<"text" | "note" | "link" | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);

  function copy(text: string, type: "text" | "note" | "link") {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleCopyLink() {
    setLoadingLink(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: "verse",
          payload: { book, bookName, chapter, verse, text: verseText, translation, note: note ?? null },
          expires_hours: 24 * 30, // 30 days
        }),
      });
      if (res.ok) {
        const { url } = await res.json() as { url: string };
        copy(url, "link");
      }
    } catch {/* ignore */}
    setLoadingLink(false);
  }

  const verseText_formatted = `${bookName} ${chapter}:${verse} (${translation}) — "${verseText}"`;
  const verseWithNote = note
    ? `${verseText_formatted}\n\nNote: ${note}`
    : verseText_formatted;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t pb-8 pt-4 px-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-1)" }}>
            Share {bookName} {chapter}:{verse}
          </p>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-text-2)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Copy verse text */}
          <button
            onClick={() => copy(verseText_formatted, "text")}
            className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <span style={{ color: "var(--color-text-1)" }}>Copy verse text</span>
            {copied === "text" ? (
              <Check size={16} style={{ color: "var(--color-accent)" }} />
            ) : (
              <Copy size={16} style={{ color: "var(--color-text-3)" }} />
            )}
          </button>

          {/* Copy verse + note */}
          {note && (
            <button
              onClick={() => copy(verseWithNote, "note")}
              className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
            >
              <span style={{ color: "var(--color-text-1)" }}>Copy with note</span>
              {copied === "note" ? (
                <Check size={16} style={{ color: "var(--color-accent)" }} />
              ) : (
                <Copy size={16} style={{ color: "var(--color-text-3)" }} />
              )}
            </button>
          )}

          {/* Copy share link */}
          <button
            onClick={() => void handleCopyLink()}
            disabled={loadingLink}
            className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <span style={{ color: "var(--color-text-1)" }}>
              {loadingLink ? "Creating link…" : "Copy share link"}
            </span>
            {copied === "link" ? (
              <Check size={16} style={{ color: "var(--color-accent)" }} />
            ) : (
              <Link size={16} style={{ color: "var(--color-text-3)" }} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

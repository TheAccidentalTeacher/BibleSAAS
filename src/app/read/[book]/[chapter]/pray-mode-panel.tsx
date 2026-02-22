"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";

export interface PrayBlock {
  startVerse: number;
  endVerse: number;
  verseText: string;
  prompt: string;
}

interface PrayModePanelProps {
  bookCode: string;
  bookName: string;
  chapter: number;
  verses: { verse: number; text: string }[];
  onClose: () => void;
}

export default function PrayModePanel({
  bookCode,
  bookName,
  chapter,
  verses,
  onClose,
}: PrayModePanelProps) {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<PrayBlock[]>([]);
  const [prayers, setPrayers] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/pray/passage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book: bookCode, chapter, verses }),
        });
        const data = await res.json() as { blocks?: PrayBlock[]; error?: string };
        if (!res.ok || data.error) {
          setError(data.error ?? "Failed to generate prayer prompts");
        } else {
          setBlocks(data.blocks ?? []);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, [bookCode, chapter, verses]);

  async function handleSave(blockIdx: number) {
    const block = blocks[blockIdx];
    if (!block) return;
    const prayerText = prayers[blockIdx] ?? "";
    if (!prayerText.trim()) return;

    setSaving((prev) => ({ ...prev, [blockIdx]: true }));
    try {
      const verseRef =
        block.startVerse === block.endVerse
          ? `${bookName} ${chapter}:${block.startVerse}`
          : `${bookName} ${chapter}:${block.startVerse}-${block.endVerse}`;

      await fetch("/api/pray/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: bookCode,
          chapter,
          verseRef,
          linkedVerseText: block.verseText,
          prayerText,
        }),
      });
      setSaved((prev) => ({ ...prev, [blockIdx]: true }));

      // Check if all blocks saved
      const allSaved = blocks.every((_, i) => saved[i] || i === blockIdx);
      if (allSaved) setSessionComplete(true);
    } finally {
      setSaving((prev) => ({ ...prev, [blockIdx]: false }));
    }
  }

  const allSaved = blocks.length > 0 && blocks.every((_, i) => saved[i]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--color-text-1)" }}
          >
            Pray This Passage
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-3)" }}
          >
            {bookName} {chapter}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ color: "var(--color-text-3)" }}
          className="hover:opacity-70"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "var(--color-accent)" }}
            />
            <p style={{ color: "var(--color-text-3)" }} className="text-sm">
              Preparing prayer prompts…
            </p>
          </div>
        )}

        {error && (
          <div
            className="rounded-xl p-4 border text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
          >
            {error}
          </div>
        )}

        {!loading && !error && sessionComplete && (
          <div className="text-center py-12">
            <CheckCircle
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--color-accent)" }}
            />
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "var(--color-text-1)" }}
            >
              Amen.
            </h3>
            <p style={{ color: "var(--color-text-3)" }} className="text-sm">
              Your prayers have been saved to your Prayer Journal.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          !sessionComplete &&
          blocks.map((block, idx) => (
            <div
              key={idx}
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                opacity: saved[idx] ? 0.6 : 1,
              }}
            >
              {/* Verse reference */}
              <div
                className="px-4 py-2.5 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-accent)" }}
                >
                  {bookName} {chapter}:
                  {block.startVerse === block.endVerse
                    ? block.startVerse
                    : `${block.startVerse}–${block.endVerse}`}
                </p>
              </div>

              {/* Prompt */}
              <div className="px-4 pt-3 pb-2">
                <p
                  className="text-sm leading-relaxed font-medium mb-3"
                  style={{ color: "var(--color-text-1)" }}
                >
                  {block.prompt}
                </p>

                {saved[idx] ? (
                  <div
                    className="flex items-center gap-2 text-xs py-2"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <CheckCircle size={13} />
                    Saved to Prayer Journal
                  </div>
                ) : (
                  <>
                    <textarea
                      value={prayers[idx] ?? ""}
                      onChange={(e) =>
                        setPrayers((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      placeholder="Continue this prayer in your own words…"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none mb-3"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-1)",
                      }}
                    />
                    <button
                      onClick={() => handleSave(idx)}
                      disabled={saving[idx] || !(prayers[idx] ?? "").trim()}
                      className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                      style={{
                        background: "var(--color-accent)",
                        color: "var(--color-bg)",
                      }}
                    >
                      {saving[idx] && <Loader2 size={11} className="animate-spin" />}
                      Save Prayer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      {!loading && !sessionComplete && blocks.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 px-5 py-4 border-t"
          style={{
            background: "var(--color-bg)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <p
              className="text-xs"
              style={{ color: "var(--color-text-3)" }}
            >
              {Object.values(saved).filter(Boolean).length} of {blocks.length} saved
            </p>
            {allSaved && (
              <button
                onClick={() => setSessionComplete(true)}
                className="text-xs font-semibold px-4 py-2 rounded-full"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                }}
              >
                Say Amen ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

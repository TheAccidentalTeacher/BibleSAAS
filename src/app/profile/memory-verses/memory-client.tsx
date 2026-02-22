"use client";

/**
 * MemoryClient — Interactive memory verse list with delete and review CTA.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Trash2, Crown, Clock } from "lucide-react";
import type { MemoryVerseRow } from "@/types/database";

type EnrichedVerse = MemoryVerseRow & { bookName: string };

interface Props {
  due: EnrichedVerse[];
  upcoming: EnrichedVerse[];
  mastered: EnrichedVerse[];
  today: string;
}

function humanInterval(days: number): string {
  if (days <= 1) return "tomorrow";
  if (days < 7) return `${days} days`;
  if (days < 14) return "1 week";
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

function VerseCard({
  verse,
  onDelete,
}: {
  verse: EnrichedVerse;
  onDelete: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function doDelete() {
    startTransition(async () => {
      await fetch(`/api/memory/${verse.id}`, { method: "DELETE" });
      onDelete(verse.id);
    });
  }

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
            {verse.bookName} {verse.chapter}:{verse.verse}{" "}
            <span style={{ color: "var(--color-text-3)" }}>({verse.translation})</span>
          </p>
          <p
            className="text-sm leading-relaxed line-clamp-3"
            style={{ color: "var(--color-text-1)" }}
          >
            {verse.verse_text}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {verse.mastered ? (
              <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#f59e0b" }}>
                <Crown size={11} /> Mastered
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-text-3)" }}>
                <Clock size={11} /> Next in {humanInterval(verse.interval_days)}
              </span>
            )}
            <span className="text-[11px]" style={{ color: "var(--color-text-3)" }}>
              {verse.practice_count} reviews
            </span>
          </div>
        </div>
        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={doDelete}
              disabled={isPending}
              className="text-[11px] px-2 py-1 rounded-lg"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              {isPending ? "…" : "Delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] px-2 py-1 rounded-lg border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--color-text-3)" }}
            aria-label="Remove from memory"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function MemoryClient({ due, upcoming, mastered }: Props) {
  const [dueList, setDueList] = useState(due);
  const [upcomingList, setUpcomingList] = useState(upcoming);
  const [masteredList, setMasteredList] = useState(mastered);

  function removeVerse(id: string) {
    setDueList((p) => p.filter((v) => v.id !== id));
    setUpcomingList((p) => p.filter((v) => v.id !== id));
    setMasteredList((p) => p.filter((v) => v.id !== id));
  }

  const totalCount = dueList.length + upcomingList.length + masteredList.length;

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Link href="/profile" aria-label="Back">
          <ArrowLeft size={20} style={{ color: "var(--color-text-2)" }} />
        </Link>
        <div className="flex items-center gap-2">
          <Brain size={18} style={{ color: "var(--color-accent)" }} />
          <span className="font-semibold text-sm">Memory Verses</span>
        </div>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}
        >
          {totalCount} verse{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-[640px] mx-auto">
        {/* Due Today */}
        {dueList.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-3)" }}
              >
                Due Today — {dueList.length}
              </h2>
              <Link
                href="/profile/memory-verses/review"
                className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                Review Now
              </Link>
            </div>
            <div className="space-y-2">
              {dueList.map((v) => (
                <VerseCard key={v.id} verse={v} onDelete={removeVerse} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div
            className="text-center rounded-2xl p-10 border"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <Brain size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--color-accent)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--color-text-1)" }}>
              No memory verses yet
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-3)" }}>
              Tap a verse number while reading and choose Memorize.
            </p>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 rounded-full font-semibold"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              Go Read
            </Link>
          </div>
        )}

        {/* Upcoming */}
        {upcomingList.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-3)" }}
            >
              Upcoming — {upcomingList.length}
            </h2>
            <div className="space-y-2">
              {upcomingList.map((v) => (
                <VerseCard key={v.id} verse={v} onDelete={removeVerse} />
              ))}
            </div>
          </section>
        )}

        {/* Mastered */}
        {masteredList.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1"
              style={{ color: "#f59e0b" }}
            >
              <Crown size={12} /> Mastered — {masteredList.length}
            </h2>
            <div className="space-y-2">
              {masteredList.map((v) => (
                <VerseCard key={v.id} verse={v} onDelete={removeVerse} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

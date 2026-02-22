"use client";

/**
 * TskRefSheet — Bottom sheet showing TSK (Treasury of Scripture Knowledge)
 * cross-references for a single verse.
 *
 * Features:
 * - Verse text header
 * - Density tier badge (rare → very_high)
 * - Ref list with clickable reference pills
 * - "Start Trail" (creates trail from current verse) or "Add to Trail" (extends)
 * - Active trail status pill
 */

import { useState, useEffect } from "react";
import { X, GitFork, Plus, ArrowRight } from "lucide-react";

interface TskRef {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  ref: string;
}

interface TskRefSheetProps {
  /** The verse whose TSK refs we're browsing (the "from" verse). */
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  /** If a trail is currently in progress, its ID — otherwise null. */
  activeTrailId: string | null;
  activeTrailStepCount: number;
  /** Called when user starts a new trail (origin = current verse + ref as step 2). */
  onTrailStarted: (trailId: string, stepCount: number) => void;
  /** Called when a step is appended to an existing trail. */
  onStepAdded: (newStepCount: number) => void;
  /** Called when user taps "View" on the active trail. */
  onViewTrail: () => void;
  onClose: () => void;
}

const TIER_DOT: Record<string, string> = {
  rare: "#9ca3af",
  low: "#6ee7b7",
  medium: "#34d399",
  high: "#f59e0b",
  very_high: "#ef4444",
};

const TIER_LABEL: Record<string, string> = {
  rare: "Rare",
  low: "Low",
  medium: "Medium",
  high: "High",
  very_high: "Very High",
};

export default function TskRefSheet({
  book,
  chapter,
  verse,
  verseText,
  activeTrailId,
  activeTrailStepCount,
  onTrailStarted,
  onStepAdded,
  onViewTrail,
  onClose,
}: TskRefSheetProps) {
  const [refs, setRefs] = useState<TskRef[]>([]);
  const [tier, setTier] = useState<string>("rare");
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null); // ref id being acted on

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, verse]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tsk?book=${book}&chapter=${chapter}&verse=${verse}`);
      if (res.ok) {
        const data = await res.json() as {
          refs: TskRef[];
          stat: { reference_count: number; density_tier: string };
        };
        setRefs(data.refs);
        setTier(data.stat.density_tier);
        setCount(data.stat.reference_count);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTrail(ref: TskRef) {
    setBusy(ref.id);
    try {
      // Create trail with current verse as origin (step 1)
      const createRes = await fetch("/api/trails/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, chapter, verse }),
      });
      if (!createRes.ok) return;
      const { trail_id } = await createRes.json() as { trail_id: string };

      // Add the selected ref as step 2
      await fetch(`/api/trails/${trail_id}/add-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: ref.book, chapter: ref.chapter, verse: ref.verse }),
      });

      // Persist active trail in localStorage so it survives chapter navigation
      localStorage.setItem(
        "activeTrail",
        JSON.stringify({ id: trail_id, stepCount: 2 })
      );
      onTrailStarted(trail_id, 2);
      onClose();
    } finally {
      setBusy(null);
    }
  }

  async function handleAddToTrail(ref: TskRef) {
    if (!activeTrailId) return;
    setBusy(ref.id);
    try {
      const res = await fetch(`/api/trails/${activeTrailId}/add-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: ref.book, chapter: ref.chapter, verse: ref.verse }),
      });
      if (!res.ok) return;
      const newCount = activeTrailStepCount + 1;
      localStorage.setItem(
        "activeTrail",
        JSON.stringify({ id: activeTrailId, stepCount: newCount })
      );
      onStepAdded(newCount);
      onClose();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ background: "var(--color-surface)", color: "var(--color-text-1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex items-start justify-between px-5 pt-5 pb-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <GitFork size={14} style={{ color: "var(--color-accent)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-accent)" }}
              >
                Cross-References
              </span>
              {!loading && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: TIER_DOT[tier] ?? "#9ca3af",
                    color: "#fff",
                  }}
                >
                  {count} refs · {TIER_LABEL[tier] ?? tier}
                </span>
              )}
            </div>
            <p
              className="text-sm leading-snug line-clamp-2"
              style={{ color: "var(--color-text-2)", fontStyle: "italic" }}
            >
              &ldquo;{verseText}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg flex-shrink-0"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-2)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Active trail banner ── */}
        {activeTrailId && (
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{
              background: "var(--color-surface-2)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--color-text-2)" }}>
              <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                Trail active
              </span>
              {" · "}
              {activeTrailStepCount} step
              {activeTrailStepCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onViewTrail}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "var(--color-accent)" }}
            >
              View <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* ── Ref list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: "var(--color-surface-2)" }}
                />
              ))}
            </div>
          )}

          {!loading && refs.length === 0 && (
            <p
              className="text-sm text-center py-10"
              style={{ color: "var(--color-text-3)" }}
            >
              No cross-references found for this verse.
            </p>
          )}

          {!loading &&
            refs.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center gap-3 py-3 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                {/* Reference label — tap to navigate */}
                <a
                  href={`/read/${ref.book}/${ref.chapter}`}
                  className="flex-1 text-sm font-semibold hover:underline"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--color-accent)",
                  }}
                  onClick={onClose}
                >
                  {ref.ref}
                </a>

                {/* Action button */}
                <button
                  type="button"
                  disabled={busy === ref.id}
                  onClick={() =>
                    void (activeTrailId
                      ? handleAddToTrail(ref)
                      : handleStartTrail(ref))
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-opacity"
                  style={{
                    background: activeTrailId
                      ? "var(--color-accent)"
                      : "var(--color-surface-2)",
                    color: activeTrailId
                      ? "var(--color-bg)"
                      : "var(--color-text-1)",
                    opacity: busy === ref.id ? 0.5 : 1,
                  }}
                >
                  {busy === ref.id ? (
                    "…"
                  ) : activeTrailId ? (
                    <>
                      <Plus size={12} /> Add
                    </>
                  ) : (
                    <>
                      <GitFork size={12} /> Start Trail
                    </>
                  )}
                </button>
              </div>
            ))}

          {/* Spacer so last item isn't flush with bottom of scroll area */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

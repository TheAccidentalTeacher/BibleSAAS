"use client";

/**
 * SermonOutlineSheet — Bottom slide-up panel for sermon outline generation.
 *
 * Usage (modes):
 *  - Sermon Skeleton: for preachers, includes exegetical footnotes and illustrative threads
 *  - Small Group: discussion questions, prayer direction
 *  - Family Devotions: kid-friendly summary, activity, prayer starter
 *
 * Behavior:
 *  - Opens in "sermon" mode by default
 *  - Generates on first open (or mode switch), caches result for 48 hours (server-side)
 *  - User can edit notes inline
 *  - Export as Markdown to clipboard
 */

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import type { SermonOutlineJSON, SermonOutlineMode } from "@/lib/charles/prompts";

interface SermonOutlineSheetProps {
  bookCode: string;
  bookName: string;
  chapter: number;
  chapterText: string;
  onClose: () => void;
}

const MODE_LABELS: Record<SermonOutlineMode, string> = {
  sermon: "Sermon",
  small_group: "Small Group",
  family_devotions: "Family",
};

const MODE_DESCRIPTIONS: Record<SermonOutlineMode, string> = {
  sermon: "Sermon skeleton with exegetical notes",
  small_group: "Discussion guide with questions",
  family_devotions: "Family devotions for all ages",
};

export default function SermonOutlineSheet({
  bookCode,
  bookName,
  chapter,
  chapterText,
  onClose,
}: SermonOutlineSheetProps) {
  const [mode, setMode] = useState<SermonOutlineMode>("sermon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlineId, setOutlineId] = useState<string | null>(null);
  const [outline, setOutline] = useState<SermonOutlineJSON | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [expandedMovements, setExpandedMovements] = useState<Set<number>>(new Set([0]));

  // Cache: avoid re-fetching same mode
  const [generatedModes, setGeneratedModes] = useState<Map<SermonOutlineMode, SermonOutlineJSON>>(
    new Map()
  );

  const generate = useCallback(
    async (targetMode: SermonOutlineMode) => {
      // Check cache
      const cached = generatedModes.get(targetMode);
      if (cached) {
        setOutline(cached);
        setExpandedMovements(new Set([0]));
        return;
      }

      setLoading(true);
      setError(null);
      setOutline(null);

      try {
        const res = await fetch("/api/sermon/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            book: bookCode,
            bookName,
            chapter,
            mode: targetMode,
            chapterText,
          }),
        });

        if (!res.ok) {
          const j = await res.json() as { error?: string };
          throw new Error(j.error ?? "Generation failed");
        }

        const data = await res.json() as {
          outlineId: string | null;
          outline: SermonOutlineJSON;
          cached?: boolean;
        };

        setOutline(data.outline);
        setOutlineId(data.outlineId);
        setExpandedMovements(new Set([0]));
        setGeneratedModes((prev) => new Map(prev).set(targetMode, data.outline));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [bookCode, bookName, chapter, chapterText, generatedModes]
  );

  // Generate on first open
  useEffect(() => {
    void generate("sermon");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleModeChange(newMode: SermonOutlineMode) {
    setMode(newMode);
    void generate(newMode);
  }

  function toggleMovement(idx: number) {
    setExpandedMovements((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleSaveToggle() {
    if (!outlineId) return;
    const next = !isSaved;
    setIsSaved(next);
    await fetch("/api/sermon/generate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outlineId, isSaved: next }),
    });
  }

  async function handleCopyMarkdown() {
    if (!outline) return;
    const md = buildMarkdown(outline, mode, bookName, chapter);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-t-3xl flex flex-col max-h-[92vh]"
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
              Outline — {bookName} {chapter}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
              {MODE_DESCRIPTIONS[mode]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {outline && (
              <>
                <button
                  onClick={() => void handleSaveToggle()}
                  className="p-2 rounded-xl transition-opacity hover:opacity-70"
                  title={isSaved ? "Unsave outline" : "Save outline"}
                >
                  {isSaved ? (
                    <BookmarkCheck size={18} style={{ color: "var(--color-accent)" }} />
                  ) : (
                    <Bookmark size={18} style={{ color: "var(--color-text-3)" }} />
                  )}
                </button>
                <button
                  onClick={() => void handleCopyMarkdown()}
                  className="p-2 rounded-xl transition-opacity hover:opacity-70"
                  title="Copy as Markdown"
                >
                  {copied ? (
                    <Check size={18} style={{ color: "#22c55e" }} />
                  ) : (
                    <Copy size={18} style={{ color: "var(--color-text-3)" }} />
                  )}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-xl transition-opacity hover:opacity-70">
              <X size={18} style={{ color: "var(--color-text-3)" }} />
            </button>
          </div>
        </div>

        {/* ── Mode Tabs ── */}
        <div className="flex px-5 pt-3 pb-2 gap-2 flex-shrink-0">
          {(Object.keys(MODE_LABELS) as SermonOutlineMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: mode === m ? "var(--color-accent)" : "var(--color-surface-2)",
                color: mode === m ? "var(--color-bg)" : "var(--color-text-2)",
              }}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 px-5 pb-8 pt-2">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: "var(--color-accent)" }}
              />
              <p className="text-sm" style={{ color: "var(--color-text-3)" }}>
                Charles is building your outline…
              </p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-sm mb-3" style={{ color: "var(--color-text-2)" }}>
                {error}
              </p>
              <button
                onClick={() => void generate(mode)}
                className="text-xs font-semibold px-4 py-2 rounded-full"
                style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
              >
                Try again
              </button>
            </div>
          )}

          {outline && !loading && (
            <div className="space-y-5">
              {/* Main idea */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "var(--color-surface-2)" }}
              >
                <p
                  className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                  style={{ color: "var(--color-text-3)" }}
                >
                  Big Idea
                </p>
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{
                    color: "var(--color-text-1)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  &ldquo;{outline.main_idea}&rdquo;
                </p>
              </div>

              {/* Context */}
              {outline.context && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Context
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                    {outline.context}
                  </p>
                </div>
              )}

              {/* Movements */}
              {outline.movements?.length > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Movements
                  </p>
                  <div className="space-y-2">
                    {outline.movements.map((mv, i) => {
                      const isOpen = expandedMovements.has(i);
                      return (
                        <div
                          key={i}
                          className="rounded-2xl overflow-hidden"
                          style={{
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                          }}
                        >
                          <button
                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                            onClick={() => toggleMovement(i)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="text-xs font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{
                                  background: "var(--color-accent)",
                                  color: "var(--color-bg)",
                                }}
                              >
                                {i + 1}
                              </span>
                              <span
                                className="text-sm font-semibold truncate"
                                style={{ color: "var(--color-text-1)" }}
                              >
                                {mv.heading}
                              </span>
                              {mv.verses && (
                                <span
                                  className="text-xs shrink-0"
                                  style={{ color: "var(--color-text-3)" }}
                                >
                                  {mv.verses}
                                </span>
                              )}
                            </div>
                            {isOpen ? (
                              <ChevronUp size={16} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
                            ) : (
                              <ChevronDown size={16} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
                            )}
                          </button>

                          {isOpen && (
                            <div
                              className="px-4 pb-4 space-y-3"
                              style={{ borderTop: "1px solid var(--color-border)" }}
                            >
                              <p
                                className="text-sm leading-relaxed pt-3"
                                style={{ color: "var(--color-text-2)" }}
                              >
                                {mv.exegesis}
                              </p>
                              {mv.bridge && (
                                <div
                                  className="rounded-xl p-3"
                                  style={{ background: "var(--color-surface-2)" }}
                                >
                                  <p
                                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                                    style={{ color: "var(--color-text-3)" }}
                                  >
                                    Bridge
                                  </p>
                                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                                    {mv.bridge}
                                  </p>
                                </div>
                              )}
                              {mv.cross_refs?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {mv.cross_refs.map((ref) => (
                                    <span
                                      key={ref}
                                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                                      style={{
                                        background: "rgba(196,160,64,0.12)",
                                        color: "#C4A040",
                                      }}
                                    >
                                      {ref}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kid-friendly summary (family devotions) */}
              {outline.kid_friendly_summary && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    In Simple Words
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                    {outline.kid_friendly_summary}
                  </p>
                </div>
              )}

              {/* Application directions */}
              {outline.application_directions?.length > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Application Directions
                  </p>
                  <ul className="space-y-1.5">
                    {outline.application_directions.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-text-2)" }}>
                        <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>→</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Discussion questions */}
              {(outline.discussion_questions?.length ?? 0) > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Discussion Questions
                  </p>
                  <ol className="space-y-2 list-decimal list-inside">
                    {outline.discussion_questions?.map((q, i) => (
                      <li key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Activity (family) */}
              {outline.activity && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(196,160,64,0.08)",
                    border: "1px solid rgba(196,160,64,0.25)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                    style={{ color: "#C4A040" }}
                  >
                    Activity
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                    {outline.activity}
                  </p>
                </div>
              )}

              {/* Prayer direction / starter */}
              {(outline.prayer_direction ?? outline.prayer_starter) && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-1"
                    style={{ color: "#8b5cf6" }}
                  >
                    Prayer
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                    {outline.prayer_direction ?? outline.prayer_starter}
                  </p>
                </div>
              )}

              {/* Exegetical footnotes */}
              {outline.exegetical_footnotes?.length > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Exegetical Notes
                  </p>
                  <ul className="space-y-1.5">
                    {outline.exegetical_footnotes.map((note, i) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--color-text-3)" }}>
                        <span style={{ flexShrink: 0 }}>†</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Illustrative threads */}
              {outline.illustrative_threads?.length > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Illustrative Threads
                  </p>
                  <ul className="space-y-1.5">
                    {outline.illustrative_threads.map((t, i) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--color-text-3)" }}>
                        <span style={{ flexShrink: 0 }}>⌁</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* User notes */}
              <div>
                <p
                  className="text-[10px] uppercase font-semibold tracking-widest mb-2"
                  style={{ color: "var(--color-text-3)" }}
                >
                  Your Notes
                </p>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  onBlur={async () => {
                    if (!outlineId) return;
                    await fetch("/api/sermon/generate", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ outlineId, userNotes }),
                    });
                  }}
                  placeholder="Add your own notes, illustrations, or edits here…"
                  className="w-full rounded-2xl p-3 text-sm resize-none outline-none"
                  rows={4}
                  style={{
                    background: "var(--color-surface-2)",
                    color: "var(--color-text-1)",
                    border: "1px solid var(--color-border)",
                    fontFamily: "var(--font-garamond)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Markdown export helper ─────────────────────────────────────────────────────

function buildMarkdown(
  outline: SermonOutlineJSON,
  mode: SermonOutlineMode,
  bookName: string,
  chapter: number
): string {
  const modeLabel = { sermon: "Sermon Skeleton", small_group: "Small Group Guide", family_devotions: "Family Devotions" }[mode];
  const lines: string[] = [
    `# ${bookName} ${chapter} — ${modeLabel}`,
    `## Big Idea`,
    `> ${outline.main_idea}`,
    "",
  ];

  if (outline.context) {
    lines.push(`## Context`, outline.context, "");
  }

  if (outline.movements?.length) {
    lines.push("## Movements");
    for (const [i, mv] of outline.movements.entries()) {
      lines.push(`### ${i + 1}. ${mv.heading} (${mv.verses})`);
      lines.push(mv.exegesis);
      if (mv.bridge) lines.push(`\n**Bridge:** ${mv.bridge}`);
      if (mv.cross_refs?.length) lines.push(`\n**Cross-refs:** ${mv.cross_refs.join(", ")}`);
      lines.push("");
    }
  }

  if (outline.discussion_questions?.length) {
    lines.push("## Discussion Questions");
    outline.discussion_questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }

  if (outline.application_directions?.length) {
    lines.push("## Application Directions");
    outline.application_directions.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  if (outline.exegetical_footnotes?.length) {
    lines.push("## Exegetical Notes");
    outline.exegetical_footnotes.forEach((n) => lines.push(`- ${n}`));
    lines.push("");
  }

  if (outline.illustrative_threads?.length) {
    lines.push("## Illustrative Threads");
    outline.illustrative_threads.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }

  if (outline.prayer_direction) lines.push("## Prayer Direction", outline.prayer_direction, "");
  if (outline.prayer_starter) lines.push("## Prayer Starter", outline.prayer_starter, "");
  if (outline.activity) lines.push("## Activity", outline.activity, "");

  return lines.join("\n");
}

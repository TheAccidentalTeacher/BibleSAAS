"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { PrayerJournalRow, PrayerCategory } from "@/types/database";

const CATEGORIES: { value: PrayerCategory; label: string; emoji: string }[] = [
  { value: "petition", label: "Petition", emoji: "🙏" },
  { value: "praise", label: "Praise", emoji: "✨" },
  { value: "thanksgiving", label: "Thanksgiving", emoji: "💛" },
  { value: "intercession", label: "Intercession", emoji: "🕊️" },
  { value: "confession", label: "Confession", emoji: "🤍" },
  { value: "lament", label: "Lament", emoji: "🌧️" },
];

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  answered: "Answered",
  archived: "Archived",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

interface NewPrayerFormState {
  title: string;
  body: string;
  category: PrayerCategory;
  passage_ref: string;
  linked_verse_text: string;
}

const DEFAULT_FORM: NewPrayerFormState = {
  title: "",
  body: "",
  category: "petition",
  passage_ref: "",
  linked_verse_text: "",
};

interface MarkAnsweredFormState {
  prayerId: string;
  answered_note: string;
}

export default function PrayerClient({
  initialPrayers,
}: {
  initialPrayers: PrayerJournalRow[];
}) {
  const [prayers, setPrayers] = useState<PrayerJournalRow[]>(initialPrayers);
  const [filter, setFilter] = useState<"ongoing" | "answered" | "all">("ongoing");
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState<NewPrayerFormState>(DEFAULT_FORM);
  const [submitting, startSubmit] = useTransition();
  const [markingAnswered, startMarkAnswered] = useTransition();
  const [markAnsweredFor, setMarkAnsweredFor] = useState<MarkAnsweredFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLamentMode = form.category === "lament" && showNewForm;

  const displayed = prayers.filter((p) => {
    if (filter === "all") return p.status !== "archived";
    return p.status === filter;
  });

  const ongoingCount = prayers.filter((p) => p.status === "ongoing").length;

  function submitNewPrayer() {
    if (!form.body.trim()) return;
    startSubmit(async () => {
      setError(null);
      try {
        const res = await fetch("/api/prayer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title || undefined,
            body: form.body,
            category: form.category,
            passage_ref: form.passage_ref || undefined,
            linked_verse_text: form.linked_verse_text || undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to save prayer");
        const { prayer } = (await res.json()) as { prayer: PrayerJournalRow };
        setPrayers((prev) => [prayer, ...prev]);
        setForm(DEFAULT_FORM);
        setShowNewForm(false);
      } catch {
        setError("Couldn't save your prayer. Please try again.");
      }
    });
  }

  function submitMarkAnswered() {
    if (!markAnsweredFor) return;
    const { prayerId, answered_note } = markAnsweredFor;
    startMarkAnswered(async () => {
      try {
        const res = await fetch(`/api/prayer/${prayerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "answered", answered_note }),
        });
        if (!res.ok) throw new Error();
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayerId
              ? {
                  ...p,
                  status: "answered",
                  answered_at: new Date().toISOString(),
                  answered_note,
                }
              : p
          )
        );
        setMarkAnsweredFor(null);
      } catch {
        // fail silently
      }
    });
  }

  async function deletePrayer(id: string) {
    try {
      await fetch(`/api/prayer/${id}`, { method: "DELETE" });
      setPrayers((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // fail silently
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-lg px-4 py-10"
      style={
        isLamentMode
          ? {
              filter: "brightness(0.85)",
              transition: "filter 0.5s ease",
            }
          : {}
      }
    >
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="mb-3 inline-flex items-center gap-1 text-[13px] transition-colors"
          style={{ color: "var(--color-text-3)" }}
        >
          ← Profile
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-1)",
              }}
            >
              {isLamentMode ? "This is a hard day" : "Prayer Journal"}
            </h1>
            {ongoingCount > 0 && (
              <p className="mt-1 text-[13px]" style={{ color: "var(--color-text-3)" }}>
                {ongoingCount} ongoing prayer{ongoingCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {!showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              + New
            </button>
          )}
        </div>
      </div>

      {/* New Prayer Form */}
      {showNewForm && (
        <div
          className="mb-6 rounded-[var(--radius-card)] border p-5"
          style={{
            borderColor: isLamentMode
              ? "var(--color-text-3)"
              : "var(--color-accent)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="mb-4 text-[14px] font-semibold"
            style={{ color: "var(--color-text-1)" }}
          >
            {isLamentMode
              ? "Bring your grief before God"
              : "New Prayer"}
          </h2>

          {/* Category picker */}
          <div className="mb-4">
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-text-3)" }}
            >
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() =>
                    setForm((f) => ({ ...f, category: cat.value }))
                  }
                  className="rounded-full px-3 py-1 text-[12px] font-medium transition-all"
                  style={
                    form.category === cat.value
                      ? {
                          background: "var(--color-accent)",
                          color: "var(--color-bg)",
                        }
                      : {
                          background: "var(--color-bg)",
                          color: "var(--color-text-2)",
                          border: "1px solid var(--color-border)",
                        }
                  }
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title (optional) */}
          <input
            className="mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-[14px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
            }}
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          {/* Body */}
          <textarea
            className="mb-3 w-full resize-none rounded-lg border bg-transparent px-3 py-2.5 text-[14px] leading-relaxed outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              minHeight: 120,
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
            }}
            placeholder={
              isLamentMode
                ? "Tell God exactly what's heavy on your heart. He can handle it."
                : "Write your prayer…"
            }
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />

          {/* Passage ref (optional) */}
          <input
            className="mb-3 w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-2)",
            }}
            placeholder="Linked passage (e.g. Psalm 22:1)"
            value={form.passage_ref}
            onChange={(e) =>
              setForm((f) => ({ ...f, passage_ref: e.target.value }))
            }
          />

          {error && (
            <p className="mb-3 text-[13px]" style={{ color: "#e05" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={submitNewPrayer}
              disabled={!form.body.trim() || submitting}
              className="rounded-full px-4 py-2 text-[13px] font-medium transition-opacity disabled:opacity-40 hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              {submitting ? "Saving…" : "Save Prayer"}
            </button>
            <button
              onClick={() => {
                setShowNewForm(false);
                setForm(DEFAULT_FORM);
                setError(null);
              }}
              className="rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mark Answered Form */}
      {markAnsweredFor && (
        <div
          className="mb-6 rounded-[var(--radius-card)] border p-5"
          style={{
            borderColor: "var(--color-accent)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="mb-2 text-[14px] font-semibold"
            style={{ color: "var(--color-text-1)" }}
          >
            Mark as Answered 🙌
          </h2>
          <p
            className="mb-3 text-[13px]"
            style={{ color: "var(--color-text-3)" }}
          >
            How did God answer this prayer?
          </p>
          <textarea
            className="mb-3 w-full resize-none rounded-lg border bg-transparent px-3 py-2.5 text-[14px] leading-relaxed outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              minHeight: 80,
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
            }}
            placeholder="Optional note about how it was answered…"
            value={markAnsweredFor.answered_note}
            onChange={(e) =>
              setMarkAnsweredFor((m) =>
                m ? { ...m, answered_note: e.target.value } : null
              )
            }
          />
          <div className="flex gap-2">
            <button
              onClick={submitMarkAnswered}
              disabled={markingAnswered}
              className="rounded-full px-4 py-2 text-[13px] font-medium transition-opacity disabled:opacity-40 hover:opacity-80"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
            >
              {markingAnswered ? "Saving…" : "Confirm"}
            </button>
            <button
              onClick={() => setMarkAnsweredFor(null)}
              className="rounded-full px-4 py-2 text-[13px] transition-opacity hover:opacity-80"
              style={{
                color: "var(--color-text-3)",
                border: "1px solid var(--color-border)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1">
        {(["ongoing", "answered", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
            style={
              filter === f
                ? {
                    background: "var(--color-accent)",
                    color: "var(--color-bg)",
                  }
                : {
                    color: "var(--color-text-3)",
                    border: "1px solid var(--color-border)",
                  }
            }
          >
            {f === "ongoing" ? "Ongoing" : f === "answered" ? "Answered" : "All"}
          </button>
        ))}
      </div>

      {/* Prayer list */}
      {displayed.length === 0 ? (
        <div
          className="rounded-[var(--radius-card)] border p-8 text-center"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <p className="text-[15px]" style={{ color: "var(--color-text-3)" }}>
            {filter === "ongoing"
              ? "No ongoing prayers."
              : filter === "answered"
              ? "No answered prayers yet."
              : "No prayers yet."}
          </p>
          {filter === "ongoing" && !showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-3 text-[13px] underline"
              style={{ color: "var(--color-accent)" }}
            >
              Write your first prayer
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {displayed.map((prayer) => {
            const catDef = CATEGORIES.find((c) => c.value === prayer.category);
            const charlesText =
              prayer.charles_note &&
              typeof prayer.charles_note === "object" &&
              "text" in prayer.charles_note
                ? (prayer.charles_note as { text: string }).text
                : null;

            return (
              <li
                key={prayer.id as string}
                className="rounded-[var(--radius-card)] border p-4"
                style={{
                  borderColor:
                    prayer.status === "answered"
                      ? "var(--color-accent)"
                      : prayer.category === "lament"
                      ? "var(--color-text-3)"
                      : "var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                {/* Top line */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--color-bg)",
                        color: "var(--color-text-3)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {catDef?.emoji} {catDef?.label ?? prayer.category}
                    </span>
                    {prayer.status === "answered" && (
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--color-accent)" }}
                      >
                        ✓ Answered
                      </span>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-[11px]"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    {formatDate(prayer.created_at as string)}
                  </span>
                </div>

                {/* Title */}
                {prayer.title && (
                  <p
                    className="mb-1 text-[14px] font-semibold"
                    style={{ color: "var(--color-text-1)" }}
                  >
                    {prayer.title as string}
                  </p>
                )}

                {/* Body */}
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "var(--color-text-1)" }}
                >
                  {(prayer.body as string).length > 200
                    ? (prayer.body as string).slice(0, 200) + "…"
                    : (prayer.body as string)}
                </p>

                {/* Passage ref */}
                {prayer.passage_ref && (
                  <p
                    className="mt-2 text-[12px] italic"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    {prayer.passage_ref as string}
                  </p>
                )}

                {/* Charles note */}
                {charlesText && (
                  <div
                    className="mt-3 border-l-2 pl-3"
                    style={{
                      borderColor:
                        prayer.category === "lament"
                          ? "var(--color-text-3)"
                          : "var(--color-accent)",
                    }}
                  >
                    <p
                      className="text-[13px] italic leading-relaxed"
                      style={{ color: "var(--color-text-2)" }}
                    >
                      {charlesText}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--color-text-3)" }}
                    >
                      — Charles
                    </p>
                  </div>
                )}

                {/* Answered note */}
                {prayer.answered_note && (
                  <div
                    className="mt-3 rounded-lg p-3 text-[13px]"
                    style={{
                      background: "var(--color-bg)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    <span className="font-semibold">Answer: </span>
                    {prayer.answered_note as string}
                  </div>
                )}

                {/* Actions */}
                {prayer.status === "ongoing" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setMarkAnsweredFor({
                          prayerId: prayer.id as string,
                          answered_note: "",
                        })
                      }
                      className="rounded-full px-3 py-1 text-[12px] font-medium transition-opacity hover:opacity-80"
                      style={{
                        background: "var(--color-accent)",
                        color: "var(--color-bg)",
                      }}
                    >
                      Mark Answered
                    </button>
                    <button
                      onClick={() => deletePrayer(prayer.id as string)}
                      className="rounded-full px-3 py-1 text-[12px] transition-opacity hover:opacity-80"
                      style={{
                        color: "var(--color-text-3)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      Archive
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

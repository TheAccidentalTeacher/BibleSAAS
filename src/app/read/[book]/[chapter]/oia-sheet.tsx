"use client";

/**
 * OIA Study Sheet — Full-screen bottom sheet for OIA study session.
 *
 * Shows 5 questions (3 observe → 1 interpret → 1 apply).
 * All questions shown at once in a scrollable list.
 * Submit sends to /api/journal/submit; Charles responses animate in.
 */

import { useState, useRef, FormEvent } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import type { OIAQuestion } from "@/lib/charles/content";

interface OIASheetProps {
  bookCode: string;
  bookName: string;
  chapter: number;
  translation: string;
  questions: OIAQuestion[];
  onClose: () => void;
}

interface Answer {
  oia_type: OIAQuestion["oia_type"];
  question_text: string;
  answer_text: string;
}

interface CharlesResponse {
  oia_type: OIAQuestion["oia_type"];
  question_text: string;
  charles_response: string | null;
}

const OIA_LABELS: Record<OIAQuestion["oia_type"], string> = {
  observe: "Observe",
  interpret: "Interpret",
  apply: "Apply",
};

const OIA_COLORS: Record<OIAQuestion["oia_type"], string> = {
  observe: "#3B82F6",
  interpret: "#8B5CF6",
  apply: "#10B981",
};

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  minHeight = 80,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
    onChange(el.value);
  }

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
      style={{
        minHeight: `${minHeight}px`,
        background: "var(--color-surface-2)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-1)",
        fontFamily: "var(--font-sans)",
        lineHeight: "1.6",
      }}
    />
  );
}

export default function OIASheet({
  bookCode,
  bookName,
  chapter,
  translation,
  questions,
  onClose,
}: OIASheetProps) {
  const [answers, setAnswers] = useState<string[]>(
    questions.map(() => "")
  );
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<CharlesResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAnyAnswer = answers.some((a) => a.trim().length > 0);

  function updateAnswer(i: number, val: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasAnyAnswer || submitting) return;

    setSubmitting(true);
    setError(null);

    const payload: Answer[] = questions
      .map((q, i) => ({
        oia_type: q.oia_type,
        question_text: q.text,
        answer_text: answers[i],
      }))
      .filter((a) => a.answer_text.trim().length > 0);

    try {
      const res = await fetch("/api/journal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: bookCode,
          chapter,
          translation,
          answers: payload,
        }),
      });

      if (!res.ok) {
        const { error: msg } = (await res.json()) as { error: string };
        throw new Error(msg ?? "Submission failed");
      }

      const { responses: rawResponses } = (await res.json()) as {
        entry_id: string;
        responses: CharlesResponse[];
      };

      setResponses(rawResponses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl shadow-2xl flex flex-col"
        style={{
          background: "var(--color-bg)",
          maxHeight: "92vh",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <h2
              className="font-semibold text-sm"
              style={{ color: "var(--color-text-1)" }}
            >
              Study — {bookName} {chapter}
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-3)" }}
            >
              {responses
                ? "Charles has responded"
                : "Answer what you can — even partial answers are real study"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-2)",
            }}
            aria-label="Close study sheet"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {!responses ? (
            /* ── Questions form ── */
            <form onSubmit={handleSubmit} className="px-5 py-5 space-y-6 pb-8">
              {questions.map((q, i) => (
                <div key={i}>
                  {/* Question type badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: `${OIA_COLORS[q.oia_type]}22`,
                        color: OIA_COLORS[q.oia_type],
                      }}
                    >
                      {OIA_LABELS[q.oia_type]}
                    </span>
                  </div>

                  {/* Question text */}
                  <p
                    className="text-sm font-medium mb-1.5"
                    style={{ color: "var(--color-text-1)" }}
                  >
                    {q.text}
                  </p>

                  {/* Answer prompt */}
                  {q.answer_prompt && (
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--color-text-3)" }}
                    >
                      {q.answer_prompt}
                    </p>
                  )}

                  <AutoResizeTextarea
                    value={answers[i]}
                    onChange={(val) => updateAnswer(i, val)}
                    placeholder="Your thoughts..."
                  />
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={!hasAnyAnswer || submitting}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending to Charles…
                  </>
                ) : (
                  "Submit to Charles"
                )}
              </button>
            </form>
          ) : (
            /* ── Responses view ── */
            <div className="px-5 py-5 space-y-6 pb-8">
              {responses.map((r, i) => (
                <div key={i}>
                  {/* Question recap */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: `${OIA_COLORS[r.oia_type as OIAQuestion["oia_type"]]}22`,
                        color: OIA_COLORS[r.oia_type as OIAQuestion["oia_type"]],
                      }}
                    >
                      {OIA_LABELS[r.oia_type as OIAQuestion["oia_type"]]}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--color-text-2)" }}
                  >
                    {r.question_text}
                  </p>

                  {/* Charles response */}
                  {r.charles_response ? (
                    <div
                      className="rounded-xl px-4 py-3 border-l-2"
                      style={{
                        background: "var(--color-surface)",
                        borderLeftColor: "var(--color-accent)",
                      }}
                    >
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: "var(--font-garamond)",
                          fontSize: "15px",
                          color: "var(--color-text-1)",
                        }}
                      >
                        {r.charles_response}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-xs italic"
                      style={{ color: "var(--color-text-3)" }}
                    >
                      (No response generated for this answer.)
                    </p>
                  )}
                </div>
              ))}

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-2)",
                }}
              >
                <ChevronDown size={16} />
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

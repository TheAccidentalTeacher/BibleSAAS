"use client";

/**
 * ReviewSession — Full-screen spaced repetition review UI.
 *
 * Three modes: flashcard, fill_blank, word_order
 * Rating buttons: Hard (q=2) / Got It (q=4) / Nailed It (q=5)
 * On complete: shows celebration + redirect to /profile/memory-verses
 */

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, RotateCcw, CheckCircle2 } from "lucide-react";
import type { MemoryVerseRow } from "@/types/database";

type EnrichedVerse = MemoryVerseRow & { bookName: string };
type ReviewMode = "flashcard" | "fill_blank" | "word_order";
type CardState = "idle" | "revealed" | "checked";

interface Props {
  verses: EnrichedVerse[];
}

// Pick which review mode to actually show for this card
function pickMode(verse: EnrichedVerse, index: number): ReviewMode {
  if (verse.review_mode === "all") {
    const modes: ReviewMode[] = ["flashcard", "fill_blank", "word_order"];
    return modes[index % 3]!;
  }
  return verse.review_mode as ReviewMode;
}

// Blank every Nth word (every 4th, starting from 2nd)
function makeBlankVerse(text: string): { blanked: string; answers: Map<number, string> } {
  const words = text.split(/\s+/);
  const answers = new Map<number, string>();
  const blanked = words.map((w, i) => {
    if (i > 0 && i % 4 === 2) {
      answers.set(i, w.replace(/[^a-zA-Z]/g, "").toLowerCase());
      return "___";
    }
    return w;
  });
  return { blanked: blanked.join(" "), answers };
}

// Shuffle array
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ─── Flashcard ──────────────────────────────────────────────────────────────
function FlashcardMode({
  verse,
  cardState,
  onReveal,
  onRate,
}: {
  verse: EnrichedVerse;
  cardState: CardState;
  onReveal: () => void;
  onRate: (q: number) => void;
}) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      <div
        className="flex-1 rounded-2xl p-6 border flex flex-col items-center justify-center text-center"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <p className="text-lg font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
          {verse.bookName} {verse.chapter}:{verse.verse}
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-3)" }}>
          {verse.translation}
        </p>
        {cardState === "idle" ? (
          <p className="text-sm italic" style={{ color: "var(--color-text-3)" }}>
            Can you recall this verse?
          </p>
        ) : (
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-1)" }}>
            {verse.verse_text}
          </p>
        )}
      </div>
      {cardState === "idle" ? (
        <button
          onClick={onReveal}
          className="w-full py-3.5 rounded-full font-semibold text-sm"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Reveal
        </button>
      ) : (
        <RatingButtons onRate={onRate} />
      )}
    </div>
  );
}

// ─── Fill in Blank ──────────────────────────────────────────────────────────
function FillBlankMode({
  verse,
  cardState,
  onCheck,
  onRate,
}: {
  verse: EnrichedVerse;
  cardState: CardState;
  onCheck: (correct: boolean) => void;
  onRate: (q: number) => void;
}) {
  const { blanked, answers } = makeBlankVerse(verse.verse_text);
  const blankCount = answers.size;
  const [inputs, setInputs] = useState<string[]>(Array(blankCount).fill(""));
  const [result, setResult] = useState<boolean | null>(null);

  // If no blanks (very short verse), show as flashcard-style
  if (blankCount === 0) {
    return (
      <FlashcardMode verse={verse} cardState={cardState} onReveal={() => onCheck(true)} onRate={onRate} />
    );
  }

  const words = blanked.split(/\s+/);
  let blankIndex = 0;

  function handleCheck() {
    const answerArray = Array.from(answers.values());
    const allCorrect = inputs.every(
      (inp, i) => inp.trim().toLowerCase() === (answerArray[i] ?? "").toLowerCase()
    );
    setResult(allCorrect);
    onCheck(allCorrect);
  }

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div
        className="flex-1 rounded-2xl p-6 border"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-accent)" }}>
          {verse.bookName} {verse.chapter}:{verse.verse} ({verse.translation})
        </p>
        <p className="text-sm leading-loose" style={{ color: "var(--color-text-1)" }}>
          {words.map((w, i) => {
            if (w === "___") {
              const idx = blankIndex++;
              return (
                <span key={i} className="inline-block mx-0.5">
                  {cardState === "checked" ? (
                    <span
                      className="font-semibold px-1 rounded"
                      style={{
                        background: result ? "#22c55e22" : "#ef444422",
                        color: result ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {Array.from(answers.values())[idx]}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={inputs[idx] ?? ""}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[idx] = e.target.value;
                        setInputs(newInputs);
                      }}
                      className="border-b-2 w-20 text-center text-sm outline-none"
                      style={{
                        borderColor: "var(--color-accent)",
                        background: "transparent",
                        color: "var(--color-text-1)",
                      }}
                    />
                  )}
                </span>
              );
            }
            return <span key={i}>{w} </span>;
          })}
        </p>
        {cardState === "checked" && result !== null && (
          <p className="mt-3 text-sm font-medium" style={{ color: result ? "#22c55e" : "#ef4444" }}>
            {result ? "✓ Correct!" : "✗ Not quite — the answers are shown above."}
          </p>
        )}
      </div>
      {cardState !== "checked" ? (
        <button
          onClick={handleCheck}
          className="w-full py-3.5 rounded-full font-semibold text-sm"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Check
        </button>
      ) : (
        <RatingButtons onRate={onRate} />
      )}
    </div>
  );
}

// ─── Word Order ─────────────────────────────────────────────────────────────
function WordOrderMode({
  verse,
  cardState,
  onCheck,
  onRate,
}: {
  verse: EnrichedVerse;
  cardState: CardState;
  onCheck: (correct: boolean) => void;
  onRate: (q: number) => void;
}) {
  const words = verse.verse_text.split(/\s+/);
  const [shuffled] = useState(() => shuffle(words.map((w, i) => ({ w, i }))));
  const [selected, setSelected] = useState<{ w: string; i: number }[]>([]);
  const [remaining, setRemaining] = useState(shuffled);
  const [result, setResult] = useState<boolean | null>(null);

  function addWord(item: { w: string; i: number }) {
    setSelected((s) => [...s, item]);
    setRemaining((r) => r.filter((x) => x.i !== item.i));
  }

  function removeWord(item: { w: string; i: number }) {
    setRemaining((r) => [...r, item].sort((a, b) => shuffled.findIndex(x=>x.i===a.i) - shuffled.findIndex(x=>x.i===b.i)));
    setSelected((s) => s.filter((x) => x.i !== item.i));
  }

  function handleCheck() {
    const attempt = selected.map((x) => x.w).join(" ");
    const correct = attempt === verse.verse_text;
    setResult(correct);
    onCheck(correct);
  }

  return (
    <div className="flex flex-col flex-1 gap-4">
      <p className="text-xs font-semibold" style={{ color: "var(--color-accent)" }}>
        {verse.bookName} {verse.chapter}:{verse.verse} ({verse.translation})
      </p>
      {/* Answer area */}
      <div
        className="min-h-[80px] rounded-xl p-3 border flex flex-wrap gap-1.5 content-start"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {selected.length === 0 && (
          <span className="text-[13px] italic" style={{ color: "var(--color-text-3)" }}>
            Tap words to build the verse
          </span>
        )}
        {selected.map((item) => (
          <button
            key={item.i}
            onClick={() => { if (cardState !== "checked") removeWord(item); }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border"
            style={{
              background: cardState === "checked"
                ? result ? "#22c55e22" : "#ef444422"
                : "var(--color-accent)",
              borderColor: cardState === "checked"
                ? result ? "#22c55e" : "#ef4444"
                : "var(--color-accent)",
              color: cardState === "checked"
                ? result ? "#22c55e" : "#ef4444"
                : "var(--color-bg)",
            }}
          >
            {item.w}
          </button>
        ))}
      </div>

      {cardState !== "checked" ? (
        <>
          {/* Word chips */}
          <div
            className="rounded-xl p-3 border flex flex-wrap gap-1.5"
            style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
          >
            {remaining.map((item) => (
              <button
                key={item.i}
                onClick={() => addWord(item)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-1)",
                }}
              >
                {item.w}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSelected([]); setRemaining(shuffled); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-3)" }}
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button
              onClick={handleCheck}
              disabled={selected.length === 0}
              className="flex-1 py-2 rounded-full font-semibold text-sm"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                opacity: selected.length === 0 ? 0.5 : 1,
              }}
            >
              Check
            </button>
          </div>
        </>
      ) : (
        <>
          {result !== null && (
            <p className="text-sm font-medium text-center" style={{ color: result ? "#22c55e" : "#ef4444" }}>
              {result ? "✓ Perfect order!" : `✗ Correct: "${verse.verse_text}"`}
            </p>
          )}
          <RatingButtons onRate={onRate} />
        </>
      )}
    </div>
  );
}

// ─── Rating Buttons ──────────────────────────────────────────────────────────
function RatingButtons({ onRate }: { onRate: (q: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Hard", q: 2, bg: "#ef444422", border: "#ef4444", color: "#ef4444" },
        { label: "Got It", q: 4, bg: "var(--color-surface-2)", border: "var(--color-border)", color: "var(--color-text-1)" },
        { label: "Nailed It ★", q: 5, bg: "rgba(139,92,246,0.12)", border: "#8b5cf6", color: "#8b5cf6" },
      ].map((btn) => (
        <button
          key={btn.label}
          onClick={() => onRate(btn.q)}
          className="py-3 rounded-xl font-semibold text-xs border"
          style={{ background: btn.bg, borderColor: btn.border, color: btn.color }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// ─── Mastery Celebration ────────────────────────────────────────────────────
function MasteryCelebration({ verse, onContinue }: { verse: EnrichedVerse; onContinue: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-6xl mb-4">👑</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#f59e0b" }}>Verse Mastered!</h1>
      <p className="text-sm mb-1" style={{ color: "var(--color-text-2)" }}>
        {verse.bookName} {verse.chapter}:{verse.verse}
      </p>
      <blockquote
        className="mt-4 mb-6 text-base italic leading-relaxed rounded-xl p-4 border-l-4 max-w-sm"
        style={{
          background: "var(--color-surface)",
          borderLeftColor: "#f59e0b",
          color: "var(--color-text-1)",
        }}
      >
        {verse.verse_text}
      </blockquote>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-3)" }}>
        +50 XP awarded ✨
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-3 rounded-full font-semibold"
        style={{ background: "#f59e0b", color: "#fff" }}
      >
        Continue
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReviewSession({ verses }: Props) {
  const router = useRouter();
  const [queue] = useState(verses);
  const [index, setIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>("idle");
  const [masteredVerse, setMasteredVerse] = useState<EnrichedVerse | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = queue[index];
  const mode = current ? pickMode(current, index) : "flashcard";

  const handleRate = useCallback((quality: number) => {
    if (!current) return;
    startTransition(async () => {
      const res = await fetch("/api/memory/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memory_verse_id: current.id,
          review_mode: mode,
          quality,
        }),
      });
      if (res.ok) {
        const data = await res.json() as { justMastered: boolean };
        if (data.justMastered) {
          setMasteredVerse(current);
        } else {
          advanceQueue();
        }
      } else {
        advanceQueue();
      }
    });
  }, [current, mode]);

  function advanceQueue() {
    if (index + 1 >= queue.length) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
      setCardState("idle");
    }
  }

  function handleMasteryContinue() {
    setMasteredVerse(null);
    advanceQueue();
  }

  if (completed) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: "var(--color-bg)" }}
      >
        <CheckCircle2 size={56} className="mb-4" style={{ color: "#22c55e" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-1)" }}>
          Session Complete!
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-3)" }}>
          You reviewed {queue.length} verse{queue.length !== 1 ? "s" : ""}.
        </p>
        <button
          onClick={() => router.push("/profile/memory-verses")}
          className="px-8 py-3 rounded-full font-semibold"
          style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
        >
          Done
        </button>
      </div>
    );
  }

  if (!current) {
    router.push("/profile/memory-verses");
    return null;
  }

  return (
    <>
      {masteredVerse && (
        <MasteryCelebration verse={masteredVerse} onContinue={handleMasteryContinue} />
      )}
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => router.push("/profile/memory-verses")}
            aria-label="Exit review"
            style={{ color: "var(--color-text-3)" }}
          >
            <X size={20} />
          </button>
          <div className="text-sm font-semibold" style={{ color: "var(--color-text-2)" }}>
            {index + 1} of {queue.length}
          </div>
          <div
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}
          >
            {mode.replace("_", " ")}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1" style={{ background: "var(--color-surface-2)" }}>
          <div
            className="h-1 transition-all"
            style={{
              background: "var(--color-accent)",
              width: `${((index) / queue.length) * 100}%`,
            }}
          />
        </div>

        {/* Card area */}
        <div className="flex-1 flex flex-col px-4 py-5 max-w-[640px] mx-auto w-full">
          {mode === "flashcard" && (
            <FlashcardMode
              verse={current}
              cardState={cardState}
              onReveal={() => setCardState("revealed")}
              onRate={handleRate}
            />
          )}
          {mode === "fill_blank" && (
            <FillBlankMode
              verse={current}
              cardState={cardState}
              onCheck={(correct) => {
                setCardState("checked");
              }}
              onRate={handleRate}
            />
          )}
          {mode === "word_order" && (
            <WordOrderMode
              verse={current}
              cardState={cardState}
              onCheck={(correct) => {
                setCardState("checked");
              }}
              onRate={handleRate}
            />
          )}
        </div>

        {isPending && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <div
              className="text-sm px-4 py-2 rounded-full"
              style={{ background: "var(--color-surface)", color: "var(--color-text-2)" }}
            >
              Saving…
            </div>
          </div>
        )}
      </div>
    </>
  );
}

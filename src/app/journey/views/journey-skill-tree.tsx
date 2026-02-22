"use client";

import Link from "next/link";
import { BIBLE_BOOKS } from "@/lib/bible";
import { BIBLE_PHASES } from "../journey-types";
import type { JourneyData } from "../journey-types";

interface Props {
  data: JourneyData;
}

type NodeState = "locked" | "started" | "complete";

function phaseState(pct: number): NodeState {
  if (pct >= 1) return "complete";
  if (pct > 0) return "started";
  return "locked";
}

const NODE_COLORS: Record<NodeState, { bg: string; border: string; text: string }> = {
  locked:   { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "var(--color-text-secondary)" },
  started:  { bg: "rgba(96,165,250,0.12)",  border: "#60a5fa66",             text: "#60a5fa" },
  complete: { bg: "rgba(245,158,11,0.15)",  border: "#f59e0b88",             text: "#f59e0b" },
};

export default function JourneySkillTree({ data }: Props) {
  const { byBook } = data;
  const chapterCount = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.code, b.chapters]));

  return (
    <div className="pb-6">
      <p className="text-xs text-center text-[var(--color-text-secondary)] mb-4">
        Gold = complete · Blue = in progress · Tap to open
      </p>

      {/* 7 phase columns, scrollable horizontally */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {BIBLE_PHASES.map((phase) => {
            // Phase root node
            let phaseTotal = 0;
            let phaseRead = 0;
            phase.books.forEach((code) => {
              phaseTotal += chapterCount[code] ?? 0;
              phaseRead += (byBook[code] ?? []).length;
            });
            const phasePct = phaseTotal > 0 ? phaseRead / phaseTotal : 0;
            const rootState = phaseState(phasePct);
            const rootStyle = NODE_COLORS[rootState];

            return (
              <div key={phase.id} className="flex flex-col items-center gap-1" style={{ width: 80 }}>
                {/* Phase root */}
                <div
                  className="w-16 rounded-xl px-1 py-2 text-center"
                  style={{ background: rootStyle.bg, border: `1px solid ${rootStyle.border}` }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: phase.color }}>
                    Ph.{phase.id}
                  </p>
                  <p className="text-[9px] leading-tight mt-0.5" style={{ color: rootStyle.text }}>
                    {phase.title.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p className="text-[9px] mt-1 font-semibold" style={{ color: rootStyle.text }}>
                    {Math.round(phasePct * 100)}%
                  </p>
                </div>

                {/* Vertical connector */}
                <div className="w-px h-3" style={{ background: `${phase.color}44` }} />

                {/* Book nodes */}
                <div className="flex flex-col gap-1 items-center">
                  {phase.books.map((code, idx) => {
                    const book = BIBLE_BOOKS.find((b) => b.code === code);
                    if (!book) return null;
                    const total = book.chapters;
                    const read = (byBook[code] ?? []).length;
                    const pct = total > 0 ? read / total : 0;
                    const state = phaseState(pct);
                    const style = NODE_COLORS[state];
                    const isLastNode = idx === phase.books.length - 1;

                    return (
                      <div key={code} className="flex flex-col items-center">
                        <Link
                          href={`/read/${code}/1`}
                          className="w-14 rounded-lg py-1.5 px-1 text-center relative overflow-hidden transition-all"
                          style={{
                            background: style.bg,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          {/* progress fill */}
                          <div
                            className="absolute bottom-0 left-0 right-0 transition-all"
                            style={{
                              height: `${pct * 100}%`,
                              background: state === "complete" ? `${phase.color}33` : `${phase.color}1a`,
                            }}
                          />
                          <p
                            className="relative z-10 text-[9px] font-bold"
                            style={{ color: state === "locked" ? "var(--color-text-secondary)" : phase.color }}
                          >
                            {book.abbrev ?? code}
                          </p>
                          {state === "complete" && (
                            <p className="relative z-10 text-[8px]" style={{ color: "#f59e0b" }}>✓</p>
                          )}
                          {state === "started" && (
                            <p className="relative z-10 text-[8px]" style={{ color: style.text }}>
                              {read}/{total}
                            </p>
                          )}
                        </Link>
                        {!isLastNode && (
                          <div className="w-px h-2" style={{ background: `${phase.color}33` }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

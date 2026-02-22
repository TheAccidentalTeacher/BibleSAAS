"use client";

import Link from "next/link";
import { BIBLE_BOOKS } from "@/lib/bible";
import { BIBLE_PHASES } from "../journey-types";
import type { JourneyData } from "../journey-types";

interface Props {
  data: JourneyData;
}

export default function JourneyPhases({ data }: Props) {
  const { byBook } = data;

  // Build a chapterCount map from BIBLE_BOOKS
  const chapterCount = Object.fromEntries(
    BIBLE_BOOKS.map((b) => [b.code, b.chapters])
  );

  return (
    <div className="space-y-4 pb-6">
      {BIBLE_PHASES.map((phase) => {
        // Calculate phase completion
        let phaseTotal = 0;
        let phaseRead = 0;
        phase.books.forEach((code) => {
          const total = chapterCount[code] ?? 0;
          const read = (byBook[code] ?? []).length;
          phaseTotal += total;
          phaseRead += read;
        });
        const phasePct = phaseTotal > 0 ? Math.round((phaseRead / phaseTotal) * 100) : 0;

        return (
          <details
            key={phase.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: phase.accentBg, border: `1px solid ${phase.color}22` }}
          >
            <summary
              className="flex items-center gap-3 p-4 cursor-pointer select-none list-none"
              style={{ WebkitTapHighlightColor: "transparent" } as React.CSSProperties}
            >
              {/* Phase number pip */}
              <span
                className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: phase.color, color: "#000" }}
              >
                {phase.id}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {phase.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {phase.subtitle} · {phaseRead}/{phaseTotal} chapters
                </p>
              </div>

              {/* Completion badge */}
              <span
                className="flex-none text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${phase.color}22`, color: phase.color }}
              >
                {phasePct}%
              </span>
            </summary>

            {/* Book grid inside */}
            <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2">
              {phase.books.map((code) => {
                const book = BIBLE_BOOKS.find((b) => b.code === code);
                if (!book) return null;
                const total = book.chapters;
                const read = (byBook[code] ?? []).length;
                const pct = total > 0 ? read / total : 0;
                const done = pct >= 1;

                return (
                  <Link
                    key={code}
                    href={`/read/${code}/1`}
                    className="relative rounded-xl p-2 overflow-hidden flex flex-col gap-0.5"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    {/* fill bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                      style={{
                        height: `${Math.max(4, pct * 100)}%`,
                        background: done ? `${phase.color}44` : `${phase.color}22`,
                        borderTop: done ? `1px solid ${phase.color}88` : "none",
                      }}
                    />
                    <span className="relative z-10 text-[10px] font-bold text-[var(--color-text-primary)] truncate">
                      {book.abbrev ?? code}
                    </span>
                    <span className="relative z-10 text-[9px] text-[var(--color-text-secondary)]">
                      {read}/{total}
                    </span>
                    {done && (
                      <span
                        className="absolute top-1 right-1 text-[8px] font-black"
                        style={{ color: phase.color }}
                      >
                        ✓
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

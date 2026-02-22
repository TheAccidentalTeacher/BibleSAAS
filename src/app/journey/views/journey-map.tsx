"use client";

import Link from "next/link";
import { BIBLE_BOOKS } from "@/lib/bible";
import type { JourneyData } from "../journey-types";

interface Props {
  data: JourneyData;
}

interface Region {
  id: string;
  name: string;
  description: string;
  color: string;
  accentBg: string;
  books: string[];       // book codes whose narratives are primarily in this region
}

const REGIONS: Region[] = [
  {
    id: "egypt",
    name: "Egypt",
    description: "Land of bondage & exodus",
    color: "#f59e0b",
    accentBg: "rgba(245,158,11,0.10)",
    books: ["GEN", "EXO", "LEV", "NUM"],
  },
  {
    id: "canaan",
    name: "Canaan / Israel",
    description: "The Promised Land",
    color: "#34d399",
    accentBg: "rgba(52,211,153,0.10)",
    books: ["DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"],
  },
  {
    id: "mesopotamia",
    name: "Mesopotamia / Persia",
    description: "Babylon, Assyria, Persia",
    color: "#a78bfa",
    accentBg: "rgba(167,139,250,0.10)",
    books: ["DAN", "EZR", "NEH", "EST"],
  },
  {
    id: "judea",
    name: "Judea & Galilee",
    description: "The life of Jesus",
    color: "#60a5fa",
    accentBg: "rgba(96,165,250,0.10)",
    books: ["MAT", "MRK", "LUK", "JHN", "ACT"],
  },
  {
    id: "mediterranean",
    name: "Mediterranean World",
    description: "Missions & churches across Asia Minor, Greece, Rome",
    color: "#f97316",
    accentBg: "rgba(249,115,22,0.10)",
    books: ["ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"],
  },
];

export default function JourneyMap({ data }: Props) {
  const { byBook } = data;
  const chapterCount = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.code, b.chapters]));

  return (
    <div className="space-y-3 pb-6">
      <p className="text-xs text-center text-[var(--color-text-secondary)]">
        Biblical regions — tap a book to start reading
      </p>

      {REGIONS.map((region) => {
        // Count chapters read in this region
        let regionTotal = 0;
        let regionRead = 0;
        region.books.forEach((code) => {
          regionTotal += chapterCount[code] ?? 0;
          regionRead += (byBook[code] ?? []).length;
        });
        const pct = regionTotal > 0 ? Math.round((regionRead / regionTotal) * 100) : 0;
        const anyRead = regionRead > 0;

        return (
          <div
            key={region.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: region.accentBg,
              border: `1px solid ${region.color}${anyRead ? "44" : "18"}`,
              opacity: anyRead ? 1 : 0.6,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: region.color }}
                >
                  {region.name}
                </h3>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {region.description}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${region.color}22`, color: region.color }}
              >
                {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-1">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: region.color }}
                />
              </div>
            </div>

            {/* Book chips */}
            <div className="p-4 pt-3 flex flex-wrap gap-1.5">
              {region.books.map((code) => {
                const book = BIBLE_BOOKS.find((b) => b.code === code);
                if (!book) return null;
                const read = (byBook[code] ?? []).length;
                const total = book.chapters;
                const bookPct = total > 0 ? read / total : 0;
                const done = bookPct >= 1;
                const started = bookPct > 0 && !done;

                return (
                  <Link
                    key={code}
                    href={`/read/${code}/1`}
                    className="rounded-lg px-2 py-1 text-[10px] font-semibold transition-all"
                    style={{
                      background: done
                        ? `${region.color}44`
                        : started
                        ? `${region.color}22`
                        : "rgba(255,255,255,0.04)",
                      color: done
                        ? region.color
                        : started
                        ? `${region.color}cc`
                        : "var(--color-text-secondary)",
                      border: `1px solid ${done ? region.color + "66" : region.color + "18"}`,
                    }}
                  >
                    {book.abbrev ?? code}
                    {done && " ✓"}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

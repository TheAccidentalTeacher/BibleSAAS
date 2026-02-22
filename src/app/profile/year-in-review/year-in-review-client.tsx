"use client";

import { useState } from "react";

interface YearStats {
  year: number;
  chapters_read: number;
  longest_streak: number;
  top_books: string[];
  recurring_themes: string[];
  charles_letter: string;
  answered_prayers_count: number;
  memory_verses_mastered: number;
}

interface YearRecord {
  year: number;
  charles_reflection: string | null;
  content_json: YearStats;
  email_sent_at: string | null;
}

interface YearInReviewClientProps {
  years: YearRecord[];
  tier: string;
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
      <span className="text-3xl font-semibold text-amber-800">{value}</span>
      <span className="mt-1 text-xs uppercase tracking-wide text-amber-600">{label}</span>
    </div>
  );
}

export default function YearInReviewClient({ years, tier }: YearInReviewClientProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (tier !== "your_edition") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mb-4 text-5xl">📜</div>
        <h2 className="mb-2 text-xl font-semibold text-stone-800">Year in Review</h2>
        <p className="mb-6 text-stone-500">
          A personal letter from Charles reflecting on your year of study — available exclusively in the{" "}
          <span className="font-medium text-amber-700">Your Edition</span> plan.
        </p>
        <a
          href="/profile/subscription"
          className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-sm font-medium text-white hover:bg-amber-700"
        >
          Upgrade to Your Edition
        </a>
      </div>
    );
  }

  if (years.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mb-4 text-5xl">📜</div>
        <h2 className="mb-2 text-xl font-semibold text-stone-800">Year in Review</h2>
        <p className="text-stone-500">
          Your first Year in Review will be generated on January 1. Keep reading — Charles is taking notes.
        </p>
      </div>
    );
  }

  const record = years[selectedIdx];
  const stats: YearStats = record.content_json ?? {
    year: record.year,
    chapters_read: 0,
    longest_streak: 0,
    top_books: [],
    recurring_themes: [],
    charles_letter: record.charles_reflection ?? "",
    answered_prayers_count: 0,
    memory_verses_mastered: 0,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      {/* Year selector */}
      {years.length > 1 && (
        <div className="flex gap-2">
          {years.map((y, i) => (
            <button
              key={y.year}
              onClick={() => setSelectedIdx(i)}
              className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                i === selectedIdx
                  ? "bg-amber-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {y.year}
            </button>
          ))}
        </div>
      )}

      {/* Charles letter */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
          A letter from Charles
        </h2>
        <p className="text-sm font-medium text-stone-500 mb-4">{stats.year} · Year in Review</p>
        <p className="whitespace-pre-line font-serif text-base leading-relaxed text-stone-800">
          {stats.charles_letter || record.charles_reflection || "Your letter will appear here."}
        </p>
      </section>

      {/* Stats grid */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Your year in numbers
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard value={stats.chapters_read} label="Chapters read" />
          <StatCard value={stats.longest_streak} label="Longest streak" />
          <StatCard value={stats.memory_verses_mastered} label="Verses mastered" />
          <StatCard value={stats.answered_prayers_count} label="Prayers answered" />
        </div>
      </section>

      {/* Top books */}
      {stats.top_books && stats.top_books.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
            Books you dwelled in most
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.top_books.map((book, i) => (
              <span
                key={book}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  i === 0
                    ? "bg-amber-600 text-white"
                    : i === 1
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {book}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Recurring themes */}
      {stats.recurring_themes && stats.recurring_themes.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
            Themes Charles sees in your reading
          </h3>
          <ul className="space-y-2">
            {stats.recurring_themes.map((theme) => (
              <li key={theme} className="flex items-start gap-2 text-stone-700">
                <span className="mt-0.5 text-amber-500">✦</span>
                <span className="text-sm">{theme}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

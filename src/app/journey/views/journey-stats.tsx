"use client";

import { getLevelForXp } from "@/lib/xp";
import type { JourneyData } from "../journey-types";

interface Props {
  data: JourneyData;
}

const TOTAL_CHAPTERS = 1189;

export default function JourneyStats({ data }: Props) {
  const { totalChaptersRead, streakData, counts } = data;
  const readPct = Math.round((totalChaptersRead / TOTAL_CHAPTERS) * 100);

  const levelInfo = getLevelForXp(streakData.totalXp);
  const xpProgress = levelInfo.nextLevelXp != null
    ? ((streakData.totalXp - levelInfo.minXp) /
        (levelInfo.nextLevelXp - levelInfo.minXp)) *
      100
    : 100;

  const ACTIVITY_CARDS = [
    { label: "Verses Memorized", value: counts.memory, sub: `${counts.mastered} mastered` },
    { label: "Journal Entries", value: counts.journal, sub: "reflections recorded" },
    { label: "Highlights", value: counts.highlight, sub: "passages highlighted" },
    { label: "Bookmarks", value: counts.bookmark, sub: "verses saved" },
    { label: "Reference Trails", value: counts.trails, sub: "trails created" },
    { label: "Days in Word", value: streakData.totalDays, sub: `${streakData.currentStreak} day streak` },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Reading progress */}
      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Bible Reading
          </h2>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {totalChaptersRead} / {TOTAL_CHAPTERS} chapters
          </span>
        </div>
        <div className="relative h-4 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${readPct}%`,
              background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            }}
          />
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)] text-right">
          {readPct}% complete
        </p>
      </section>

      {/* Streak row */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Current Streak", value: streakData.currentStreak, unit: "days" },
          { label: "Longest Streak", value: streakData.longestStreak, unit: "days" },
          { label: "Total Days", value: streakData.totalDays, unit: "days" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 text-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-2xl font-bold text-[var(--color-accent)]">
              {s.value}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* XP / Level */}
      <section>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-[var(--color-text-tertiary)]">
            Level {levelInfo.level} — {levelInfo.title}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {streakData.totalXp} XP
            {levelInfo.nextLevelXp != null ? ` / ${levelInfo.nextLevelXp}` : ""}
          </span>
        </div>
        <div className="relative h-3 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, xpProgress)}%`,
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
            }}
          />
        </div>
        {levelInfo.nextLevelXp != null && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] text-right">
            Next level at {levelInfo.nextLevelXp} XP
          </p>
        )}
      </section>

      {/* Activity grid */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
          Activity
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                {card.value}
              </p>
              <p className="text-xs font-medium text-[var(--color-text-tertiary)] mt-0.5">
                {card.label}
              </p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

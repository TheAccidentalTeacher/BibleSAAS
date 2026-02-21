"use client";

/**
 * DashboardClient — Client shell for interactive dashboard elements.
 * Wraps PlanPicker open/close state and router-push actions.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, BookOpen, CheckCircle2, ChevronRight, Plus } from "lucide-react";
import PlanPicker from "./plan-picker";
import type { ReadingPlanRow, UserReadingPlanRow, PlanChapterRow, ReadingProgressRow, UserStreakRow } from "@/types/database";

interface TodayChapter {
  planChapter: PlanChapterRow;
  done: boolean;
  bookName: string;
}

interface RecentEntry {
  id: string;
  book: string;
  chapter: number;
  created_at: string;
  firstLine: string;
}

interface DashboardClientProps {
  displayName: string;
  tier: string;
  activePlan: UserReadingPlanRow | null;
  plans: ReadingPlanRow[];
  todayChapters: TodayChapter[];
  totalDays: number;
  lastRead: ReadingProgressRow | null;
  lastReadBookName: string | null;
  streak: UserStreakRow | null;
  recentJournal: RecentEntry[];
}

export default function DashboardClient({
  displayName,
  activePlan,
  plans,
  todayChapters,
  totalDays,
  lastRead,
  lastReadBookName,
  streak,
  recentJournal,
}: DashboardClientProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [localActivePlan, setLocalActivePlan] = useState(activePlan);

  const progressPct = localActivePlan && totalDays > 0
    ? Math.round((localActivePlan.current_day - 1) / totalDays * 100)
    : 0;

  const firstName = displayName.split(" ")[0];

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-5 pt-5 pb-4"
        style={{ background: "var(--color-bg)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: "var(--color-text-3)", fontFamily: "var(--font-sans)" }}
        >
          Good day
        </p>
        <h1
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-1)" }}
        >
          {firstName}
        </h1>
      </header>

      <main className="px-5 max-w-[640px] mx-auto flex flex-col gap-6 pt-2">

        {/* ── Streak widget ── */}
        {streak && (
          <div
            className="flex items-center gap-4 rounded-2xl px-5 py-4 border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-2">
              <Flame size={22} style={{ color: "#F97316" }} />
              <div>
                <p className="text-2xl font-bold leading-none" style={{ color: "var(--color-text-1)" }}>
                  {streak.current_streak}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-3)" }}>day streak</p>
              </div>
            </div>
            <div
              className="w-px self-stretch mx-1"
              style={{ background: "var(--color-border)" }}
            />
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: "var(--color-text-2)" }}>
                {streak.longest_streak}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-3)" }}>longest</p>
            </div>
          </div>
        )}

        {/* ── Quick resume ── */}
        {lastRead && lastReadBookName && (
          <button
            onClick={() => router.push(`/read/${lastRead.book_code}/${lastRead.chapter_number}`)}
            className="w-full text-left rounded-2xl p-5 border flex items-center gap-4 transition-opacity hover:opacity-80"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div
              className="w-12 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-accent)", opacity: 0.15 }}
            >
              <BookOpen size={24} style={{ color: "var(--color-accent)", opacity: 1 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-text-3)" }}>
                Continue reading
              </p>
              <p className="font-bold text-base leading-tight" style={{ color: "var(--color-text-1)" }}>
                {lastReadBookName} {lastRead.chapter_number}
              </p>
              {lastRead.reading_plan_id && (
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                  Reading plan
                </p>
              )}
            </div>
            <ChevronRight size={18} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
          </button>
        )}

        {!lastRead && (
          <button
            onClick={() => router.push("/read/GEN/1")}
            className="w-full text-left rounded-2xl p-5 border flex items-center gap-4"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <BookOpen size={20} style={{ color: "var(--color-accent)" }} />
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--color-text-1)" }}>Start reading</p>
              <p className="text-xs" style={{ color: "var(--color-text-3)" }}>Begin with Genesis 1</p>
            </div>
            <ChevronRight size={16} style={{ color: "var(--color-text-3)" }} />
          </button>
        )}

        {/* ── Reading plan ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
              Reading Plan
            </h2>
            {!localActivePlan && (
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                <Plus size={13} />
                Choose plan
              </button>
            )}
          </div>

          {!localActivePlan ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="w-full rounded-2xl p-5 border flex flex-col items-center gap-2 text-center"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderStyle: "dashed",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--color-text-2)" }}>
                No active reading plan
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                Choose a plan to read through the Bible systematically
              </p>
            </button>
          ) : (
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-1)" }}>
                  Day {localActivePlan.current_day} of {totalDays}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                  {progressPct}%
                </p>
              </div>
              <div
                className="w-full rounded-full h-2 mb-4"
                style={{ background: "var(--color-surface-2)" }}
              >
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${progressPct}%`, background: "var(--color-accent)" }}
                />
              </div>

              {/* Today's chapters */}
              {todayChapters.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--color-text-3)" }}>
                    Today
                  </p>
                  <div className="flex flex-col gap-2">
                    {todayChapters.map(({ planChapter, done, bookName }) => (
                      <button
                        key={planChapter.id}
                        onClick={() =>
                          router.push(`/read/${planChapter.book}/${planChapter.chapter}`)
                        }
                        className="flex items-center gap-3 rounded-xl p-3 border text-left transition-opacity hover:opacity-80"
                        style={{
                          background: done ? "var(--color-surface-2)" : "var(--color-surface)",
                          borderColor: "var(--color-border)",
                          opacity: done ? 0.65 : 1,
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                        ) : (
                          <BookOpen size={16} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
                        )}
                        <span
                          className="flex-1 text-sm font-medium"
                          style={{
                            color: done ? "var(--color-text-3)" : "var(--color-text-1)",
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {bookName} {planChapter.chapter}
                        </span>
                        {planChapter.section_label && (
                          <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                            {planChapter.section_label}
                          </span>
                        )}
                        <ChevronRight size={14} style={{ color: "var(--color-text-3)", flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Recent journal ── */}
        {recentJournal.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-3)" }}>
                Recent Notes
              </h2>
              <a
                href="/profile/journal"
                className="text-xs font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                See all
              </a>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentJournal.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => router.push(`/read/${entry.book}/${entry.chapter}`)}
                  className="flex-shrink-0 rounded-2xl p-4 border text-left"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    width: "200px",
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
                    {entry.book} {entry.chapter}
                  </p>
                  <p
                    className="text-xs leading-relaxed line-clamp-3"
                    style={{ color: "var(--color-text-2)", fontFamily: "var(--font-garamond)", fontSize: "13px" }}
                  >
                    {entry.firstLine}
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: "var(--color-text-3)" }}>
                    {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Trail cards placeholder ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-3)" }}>
            Daily Trails
          </h2>
          <div className="flex flex-col gap-3">
            {["Morning Trail", "Evening Trail"].map((t) => (
              <div
                key={t}
                className="rounded-2xl p-4 border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  opacity: 0.5,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-2)" }}>{t}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>Coming in Phase 13</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Plan picker sheet */}
      {pickerOpen && (
        <PlanPicker
          plans={plans}
          onSelect={(planId) => {
            setLocalActivePlan({
              id: "pending",
              user_id: "",
              plan_id: planId,
              started_at: new Date().toISOString(),
              current_day: 1,
              active: true,
              completed_at: null,
              meta: {},
            } as unknown as UserReadingPlanRow);
            setPickerOpen(false);
            router.refresh();
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

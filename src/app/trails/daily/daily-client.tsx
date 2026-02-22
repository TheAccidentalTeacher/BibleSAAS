"use client";

/**
 * DailyTrailsPage — Morning + Evening daily cross-reference trail cards.
 *
 * Each card shows:
 * - Slot (Morning / Evening) with time icon
 * - Origin verse reference
 * - AI rationale / description
 * - Community stat: "N people started this trail today"
 * - CTA: "Begin Trail" → POST /api/trails/create, then redirect to /trails/[id]
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sunrise, Moon, GitFork, ArrowRight, Users } from "lucide-react";

interface DailyTrail {
  id: string;
  trail_date: string;
  slot: "morning" | "evening";
  origin_book: string;
  origin_chapter: number;
  origin_verse: number;
  ai_rationale: string | null;
  community_stats: Record<string, number> | null;
  user_trail_id: string | null;
}

interface DailyData {
  today: string;
  morning: DailyTrail | null;
  evening: DailyTrail | null;
}

export default function DailyTrailsClient() {
  const router = useRouter();
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null); // slot being started

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/trails/daily");
      if (res.ok) {
        const j = await res.json() as DailyData;
        setData(j);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBegin(trail: DailyTrail) {
    // If already started, navigate directly
    if (trail.user_trail_id) {
      router.push(`/trails/${trail.user_trail_id}`);
      return;
    }

    setStarting(trail.slot);
    try {
      const res = await fetch("/api/trails/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: trail.origin_book,
          chapter: trail.origin_chapter,
          verse: trail.origin_verse,
          trail_type: trail.slot === "morning" ? "daily_morning" : "daily_evening",
          daily_trail_id: trail.id,
        }),
      });
      if (res.ok) {
        const { trail_id } = await res.json() as { trail_id: string };
        // Store active trail and navigate to the trail's starting chapter
        localStorage.setItem("activeTrail", JSON.stringify({ id: trail_id, stepCount: 1 }));
        router.push(`/read/${trail.origin_book}/${trail.origin_chapter}`);
      }
    } finally {
      setStarting(null);
    }
  }

  const todayFormatted = data?.today
    ? new Date(data.today + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main
      className="min-h-screen pb-28 px-5 pt-6"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <Link
        href="/trails"
        className="flex items-center gap-1.5 mb-6 text-sm w-fit"
        style={{ color: "var(--color-text-3)" }}
      >
        ← Trails
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <GitFork size={18} style={{ color: "var(--color-accent)" }} />
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Daily Trails
        </h1>
      </div>
      {todayFormatted && (
        <p className="text-sm mb-8" style={{ color: "var(--color-text-3)" }}>
          {todayFormatted}
        </p>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl animate-pulse"
              style={{ background: "var(--color-surface)" }}
            />
          ))}
        </div>
      )}

      {!loading && !data?.morning && !data?.evening && (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
            No daily trails have been seeded for today yet.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--color-text-3)" }}>
            Check back later — the daily trails are prepared each morning.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {[data?.morning, data?.evening].filter(Boolean).map((trail) => {
          if (!trail) return null;
          const isMorning = trail.slot === "morning";
          const Icon = isMorning ? Sunrise : Moon;
          const slotColor = isMorning ? "#f59e0b" : "#818cf8";
          const started = Boolean(trail.user_trail_id);
          const communityCount =
            (trail.community_stats?.["started_count"] as number | undefined) ?? 0;

          return (
            <div
              key={trail.id}
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              {/* Slot header */}
              <div
                className="flex items-center gap-2 px-5 py-3 border-b"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface-2)",
                }}
              >
                <Icon size={15} style={{ color: slotColor }} />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: slotColor }}
                >
                  {isMorning ? "Morning Trail" : "Evening Trail"}
                </span>
                {started && (
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: slotColor, color: "#fff" }}
                  >
                    In Progress
                  </span>
                )}
              </div>

              <div className="px-5 py-4">
                {/* Origin verse */}
                <p
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--color-accent)",
                  }}
                >
                  {trail.origin_book} {trail.origin_chapter}:{trail.origin_verse}
                </p>

                {/* AI rationale */}
                {trail.ai_rationale && (
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "var(--color-text-2)" }}
                  >
                    {trail.ai_rationale}
                  </p>
                )}

                {/* Community stat */}
                {communityCount > 0 && (
                  <div
                    className="flex items-center gap-1.5 mb-4"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    <Users size={12} />
                    <span className="text-xs">
                      {communityCount.toLocaleString()} people started this trail today
                    </span>
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  disabled={starting === trail.slot}
                  onClick={() => void handleBegin(trail)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity"
                  style={{
                    background: slotColor,
                    color: "#fff",
                    opacity: starting === trail.slot ? 0.6 : 1,
                  }}
                >
                  {starting === trail.slot ? (
                    "Starting…"
                  ) : started ? (
                    <>Continue Trail <ArrowRight size={14} /></>
                  ) : (
                    <>Begin Trail <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

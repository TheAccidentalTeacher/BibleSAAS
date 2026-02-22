import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { GitFork } from "@phosphor-icons/react/dist/ssr";
import type { CrossReferenceTrailRow } from "@/types/database";

export const metadata = { title: "Trails — Bible Study App" };

const TYPE_LABEL: Record<string, string> = {
  free: "Free explore",
  daily_morning: "Morning trail",
  daily_evening: "Evening trail",
  thread_needle: "Thread the Needle",
};

export default async function TrailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawTrails } = await supabase
    .from("cross_reference_trails")
    .select("id, name, trail_type, origin_book, origin_chapter, origin_verse, step_count, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const trails = (rawTrails ?? []) as unknown as Partial<CrossReferenceTrailRow>[];

  return (
    <>
      <main
        className="min-h-screen pb-28 px-5 pt-6"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <GitFork size={22} style={{ color: "var(--color-accent)" }} />
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trails
          </h1>
        </div>
        <p className="text-sm mb-7" style={{ color: "var(--color-text-3)" }}>
          Cross-reference paths through Scripture.
        </p>

        {/* Quick-start cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/trails/daily"
            className="rounded-2xl border p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <span className="text-lg">🌅</span>
            <span className="text-sm font-semibold">Daily Trails</span>
            <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
              Morning + evening curated paths
            </span>
          </Link>
          <Link
            href="/trails/new"
            className="rounded-2xl border p-4 flex flex-col gap-2 hover:opacity-80 transition-opacity"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <span className="text-lg">🧵</span>
            <span className="text-sm font-semibold">Thread the Needle</span>
            <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
              Find the shortest path between two verses
            </span>
          </Link>
        </div>

        {/* Trail list */}
        <h2
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: "var(--color-text-3)" }}
        >
          Your Trails
        </h2>

        {trails.length === 0 && (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
              No trails yet. Start one by tapping a cross-reference dot while reading.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {trails.map((trail) => (
            <Link
              key={trail.id}
              href={`/trails/${trail.id}`}
              className="flex items-center gap-4 rounded-xl border px-4 py-3.5 hover:opacity-80 transition-opacity"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {trail.name ??
                    `${trail.origin_book} ${trail.origin_chapter}:${trail.origin_verse}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                  {TYPE_LABEL[trail.trail_type ?? "free"] ?? trail.trail_type} ·{" "}
                  {trail.step_count} stop{trail.step_count !== 1 ? "s" : ""}
                  {trail.completed_at && " · ✓ Complete"}
                </p>
              </div>
              <span style={{ color: "var(--color-text-3)", fontSize: 18 }}>→</span>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}


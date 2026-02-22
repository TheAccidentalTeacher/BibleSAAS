import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/layout/bottom-nav";
import { getLevelForXp } from "@/lib/xp";
import type { StreakRow } from "@/types/database";

export const metadata = { title: "Profile" };

/**
 * /profile — basic profile page (Phase 1).
 *
 * Phase 6 (Personalization) will expand this with:
 *  - Font / theme picker
 *  - Notification preferences
 *  - Subscription management (Stripe portal)
 *  - Data export trigger
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, subscription_tier, created_at")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? user.email ?? "—";
  const tier = profile?.subscription_tier ?? "free";
  const joined = profile?.created_at
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(profile.created_at))
    : "—";

  // XP + streak
  const { data: streakRaw } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, total_xp, current_level, total_days")
    .eq("user_id", user.id)
    .maybeSingle();
  const streakData = streakRaw as unknown as Pick<StreakRow, "current_streak" | "longest_streak" | "total_xp" | "current_level" | "total_days"> | null;
  const totalXp = streakData?.total_xp ?? 0;
  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? 0;
  const totalDays = streakData?.total_days ?? 0;
  const levelInfo = getLevelForXp(totalXp);
  const xpIntoLevel = totalXp - levelInfo.minXp;
  const xpForLevel = (levelInfo.nextLevelXp ?? levelInfo.minXp + 1000) - levelInfo.minXp;
  const levelPct = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));

  return (
    <>
      <main className="flex min-h-screen flex-col bg-[var(--color-bg)] pb-20">
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        {/* Back link */}
        <a
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1 text-[13px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
        >
          ← Dashboard
        </a>

        {/* Header */}
        <div className="mb-8">
          <p className="label mb-2">Account</p>
          <h1
            className="text-4xl font-bold text-[var(--color-text-1)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {displayName ?? "Your Profile"}
          </h1>
        </div>

        {/* XP / Level card */}
        <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>Level {levelInfo.level}</p>
              <p className="text-[18px] font-bold text-[var(--color-text-1)]">{levelInfo.title}</p>
            </div>
            <p className="text-[13px] text-[var(--color-text-3)]">{totalXp.toLocaleString()} XP</p>
          </div>
          {/* XP progress bar */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${levelPct}%`, background: "var(--color-accent)" }}
            />
          </div>
          {levelInfo.nextLevelXp && (
            <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-text-3)" }}>
              {totalXp - levelInfo.minXp} / {xpForLevel} XP to Level {levelInfo.level + 1}
            </p>
          )}

          {/* Streak stats */}
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[var(--color-text-1)]">{currentStreak}</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-3)" }}>Current streak</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[var(--color-text-1)]">{longestStreak}</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-3)" }}>Best streak</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[var(--color-text-1)]">{totalDays}</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-3)" }}>Days read</p>
            </div>
          </div>
        </div>

        {/* My Study — quick links */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {[
            { href: "/profile/journal", label: "Study Journal", desc: "Past OIA sessions & notes" },
            { href: "/profile/prayer", label: "Prayer Journal", desc: "Prayers, laments & answered prayer" },
            { href: "/profile/memory-verses", label: "Memory Verses", desc: "Spaced repetition verse memorization" },
            { href: "/profile/bookmarks", label: "Bookmarks", desc: "Saved verses" },
            { href: "/profile/family", label: "Family Unit", desc: "Share verses & threads with family" },
            { href: "/profile/chats", label: "Chat History", desc: "Past conversations with Charles" },
            { href: "/profile/companions", label: "Companions", desc: "Switch voice or build your own companion" },
            { href: "/profile/groups", label: "Study Groups", desc: "Verse threads and prayer with your group" },
            { href: "/profile/settings", label: "Notification Settings", desc: "Email & push notification preferences" },
            { href: "/profile/upgrade", label: "Plans & Billing", desc: "Upgrade your plan or manage subscription" },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-bg)]"
            >
              <div>
                <p className="text-[15px] font-medium text-[var(--color-text-1)]">{label}</p>
                <p className="text-[12px] text-[var(--color-text-3)]">{desc}</p>
              </div>
              <span className="text-[var(--color-text-3)]">→</span>
            </Link>
          ))}
        </div>

        {/* Info card */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {/* Display name */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="label mb-0.5">Display name</p>
              <p className="text-[15px] text-[var(--color-text-1)]">
                {displayName ?? <span className="text-[var(--color-text-3)]">Not set</span>}
              </p>
            </div>
            {/* Edit display name — Phase 6 */}
            <span className="text-[12px] text-[var(--color-text-3)]">edit (coming soon)</span>
          </div>

          {/* Email */}
          <div className="px-5 py-4">
            <p className="label mb-0.5">Email</p>
            <p className="text-[15px] text-[var(--color-text-1)]">{email}</p>
          </div>

          {/* Tier */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="label mb-0.5">Subscription tier</p>
              <p className="text-[15px] text-[var(--color-text-1)] capitalize">{tier}</p>
            </div>
            {tier === "free" && (
              <a
                href="/profile/upgrade"
                className="text-[13px] text-[var(--color-accent)] hover:underline"
              >
                Upgrade ↗
              </a>
            )}
          </div>

          {/* Joined */}
          <div className="px-5 py-4">
            <p className="label mb-0.5">Member since</p>
            <p className="text-[15px] text-[var(--color-text-1)]">{joined}</p>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-8">
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </div>

        {/* Danger zone — Phase 6 */}
        <div className="mt-6 rounded-[var(--radius-card)] border border-red-500/20 bg-red-500/5 px-5 py-4">
          <p className="label text-red-400 mb-1">Danger zone</p>
          <p className="text-[13px] text-[var(--color-text-3)]">
            Account deletion and data export will be available in a future update.
          </p>
        </div>
      </div>
    </main>
    <BottomNav />
    </>
  );
}

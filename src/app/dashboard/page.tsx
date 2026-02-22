/**
 * /dashboard — Main application dashboard.
 *
 * Server component: fetches all dashboard data, renders DashboardClient.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import BottomNav from "@/components/layout/bottom-nav";
import DashboardClient from "./dashboard-client";
import type {
  ReadingPlanRow,
  UserReadingPlanRow,
  PlanChapterRow,
  ReadingProgressRow,
  UserStreakRow,
  JournalEntryRow,
} from "@/types/database";

export const metadata = { title: "Dashboard — Bible Study App" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // ── Profile ───────────────────────────────────────────────────────────────
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, subscription_tier, onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as unknown as {
    display_name?: string | null;
    subscription_tier?: string;
    onboarding_complete?: boolean;
  } | null;

  if (profile && !profile.onboarding_complete) redirect("/onboarding");

  const displayName = profile?.display_name ?? user.email ?? "Friend";
  const tier = profile?.subscription_tier ?? "free";

  // ── Reading plans ─────────────────────────────────────────────────────────
  const [{ data: plansData }, { data: activePlanData }] = await Promise.all([
    supabase
      .from("reading_plans")
      .select("*")
      .eq("is_system", true)
      .order("is_default", { ascending: false }),
    supabase
      .from("user_reading_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle(),
  ]);

  const plans = (plansData as unknown as ReadingPlanRow[]) ?? [];
  const activePlan = activePlanData as unknown as UserReadingPlanRow | null;

  // ── Today's chapters ──────────────────────────────────────────────────────
  let todayChapters: { planChapter: PlanChapterRow; done: boolean; bookName: string }[] = [];
  let totalDays = 0;

  if (activePlan) {
    const [{ data: chaptersData }, { data: allChaptersData }] = await Promise.all([
      supabase
        .from("plan_chapters")
        .select("*")
        .eq("plan_id", activePlan.plan_id)
        .eq("day_number", activePlan.current_day),
      supabase
        .from("plan_chapters")
        .select("id")
        .eq("plan_id", activePlan.plan_id),
    ]);

    totalDays = (allChaptersData as unknown as { id: string }[] | null)?.length ?? 0;
    const rawChapters = (chaptersData as unknown as PlanChapterRow[]) ?? [];

    const progressChecks = await Promise.all(
      rawChapters.map(async (pc) => {
        const { data } = await supabase
          .from("reading_progress")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_code", pc.book)
          .eq("chapter_number", pc.chapter)
          .maybeSingle();
        return { planChapter: pc, done: data !== null };
      })
    );

    todayChapters = progressChecks.map(({ planChapter, done }) => ({
      planChapter,
      done,
      bookName: getBook(planChapter.book)?.name ?? planChapter.book,
    }));
  }

  // ── Last read chapter ─────────────────────────────────────────────────────
  const { data: lastReadData } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastRead = lastReadData as unknown as ReadingProgressRow | null;
  const lastReadBookName = lastRead
    ? (getBook(lastRead.book_code)?.name ?? lastRead.book_code)
    : null;

  // ── Streak ────────────────────────────────────────────────────────────────
  const { data: streakData } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const streak = streakData as unknown as UserStreakRow | null;

  // ── Recent journal entries ────────────────────────────────────────────────
  const { data: journalData } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const rawJournal = (journalData as unknown as JournalEntryRow[]) ?? [];
  const recentJournal = rawJournal
    .filter((e) => e.book && e.chapter)
    .map((e) => ({
      id: e.id,
      book: e.book as string,
      chapter: e.chapter as number,
      created_at: e.created_at,
      firstLine: e.note ? e.note.slice(0, 120) : "Study session",
    }));

  // ── Memory verses due today ───────────────────────────────────────────────
  const todayDate = new Date().toISOString().split("T")[0]!;
  const { count: memoryDueCount } = await supabase
    .from("memory_verses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("mastered", false)
    .lte("next_review", todayDate);
  const memoryVerseDueCount = memoryDueCount ?? 0;

  // ── Verse Pulse (top 3 this week) ─────────────────────────────────────────────
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); // Sunday
  thisWeekStart.setHours(0, 0, 0, 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pulseData } = await (supabase as any)
    .from("verse_pulse_cache")
    .select("verse_ref, weight")
    .gte("week_start", thisWeekStart.toISOString().split("T")[0])
    .order("weight", { ascending: false })
    .limit(3);
  const pulseVerses: { verse_ref: string; weight: number }[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pulseData ?? []).map((r: any) => ({ verse_ref: r.verse_ref as string, weight: r.weight as number }));

  return (
    <>
      <DashboardClient
        displayName={displayName}
        tier={tier}
        activePlan={activePlan}
        plans={plans}
        todayChapters={todayChapters}
        totalDays={totalDays}
        lastRead={lastRead}
        lastReadBookName={lastReadBookName}
        streak={streak}
        recentJournal={recentJournal}
        memoryVerseDueCount={memoryVerseDueCount}
        pulseVerses={pulseVerses}
      />
      <BottomNav />
    </>
  );
}


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
    .filter((e) => e.book_code && e.chapter_number)
    .map((e) => {
      const content = e.content as Record<string, unknown> | null;
      const firstLine =
        typeof content?.note === "string"
          ? content.note.slice(0, 120)
          : typeof content?.text === "string"
          ? content.text.slice(0, 120)
          : "Study session";
      return {
        id: e.id,
        book: e.book_code!,
        chapter: e.chapter_number!,
        created_at: e.created_at,
        firstLine,
      };
    });

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
      />
      <BottomNav />
    </>
  );
}


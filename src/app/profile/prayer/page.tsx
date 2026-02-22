/**
 * /profile/prayer — Prayer Journal screen.
 *
 * Loads initial prayer data server-side; delegates interaction to PrayerClient.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/bottom-nav";
import PrayerClient from "./prayer-client";
import type { PrayerJournalRow } from "@/types/database";

export const metadata = { title: "Prayer Journal" };

export default async function PrayerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("prayer_journal")
    .select(
      "id, title, body, category, status, answered_at, answered_note, passage_ref, linked_verse_text, tags, charles_note, created_at"
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const prayers = (data ?? []) as unknown as PrayerJournalRow[];

  return (
    <>
      <main
        className="flex min-h-screen flex-col pb-24"
        style={{ background: "var(--color-bg)" }}
      >
        <PrayerClient initialPrayers={prayers} />
      </main>
      <BottomNav />
    </>
  );
}

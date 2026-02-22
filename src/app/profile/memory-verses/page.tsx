/**
 * /profile/memory-verses — Memory Verse management screen
 *
 * Shows three sections:
 *  1. Due Today — overdue/due-today verses (review CTA)
 *  2. All Verses — current intervals in human-readable form
 *  3. Mastered — gold crown, long intervals
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import type { MemoryVerseRow } from "@/types/database";
import MemoryClient from "./memory-client";

export const metadata = { title: "Memory Verses" };

export default async function MemoryVersesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("memory_verses")
    .select("*")
    .eq("user_id", user.id)
    .order("mastered", { ascending: true })
    .order("next_review", { ascending: true });

  const verses = (data as unknown as MemoryVerseRow[]) ?? [];
  const today = new Date().toISOString().split("T")[0]!;
  const due = verses.filter((v) => !v.mastered && v.next_review <= today);
  const upcoming = verses.filter((v) => !v.mastered && v.next_review > today);
  const mastered = verses.filter((v) => v.mastered);

  // Enrich with book names
  function enrich(rows: MemoryVerseRow[]) {
    return rows.map((v) => ({
      ...v,
      bookName: getBook(v.book)?.name ?? v.book,
    }));
  }

  return (
    <MemoryClient
      due={enrich(due)}
      upcoming={enrich(upcoming)}
      mastered={enrich(mastered)}
      today={today}
    />
  );
}

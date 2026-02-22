/**
 * /profile/memory-verses/review — Full-screen review session
 * Server wrapper: fetches due-today queue, hands to client component.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import type { MemoryVerseRow } from "@/types/database";
import ReviewSession from "./review-session";

export const metadata = { title: "Memory Review" };

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const today = new Date().toISOString().split("T")[0]!;
  const { data } = await supabase
    .from("memory_verses")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_review", today)
    .eq("mastered", false)
    .order("next_review", { ascending: true });

  const verses = ((data as unknown as MemoryVerseRow[]) ?? []).map((v) => ({
    ...v,
    bookName: getBook(v.book)?.name ?? v.book,
  }));

  if (verses.length === 0) redirect("/profile/memory-verses");

  return <ReviewSession verses={verses} />;
}

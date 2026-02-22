/**
 * /profile/journal — Journal history list.
 *
 * Shows all past study sessions sorted by most recent.
 * Tap any entry to view the full session.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { getBook } from "@/lib/bible";
import type { JournalEntryRow } from "@/types/database";

export const metadata = { title: "Journal" };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch journal entries with answer counts
  const { data: entriesRaw } = await supabase
    .from("journal_entries")
    .select(
      `
      id, book, chapter, studied_at, note, is_lament_session, created_at,
      journal_answers(count)
    `
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const entries = (entriesRaw ?? []) as unknown as (JournalEntryRow & {
    journal_answers: { count: number }[];
  })[];

  return (
    <>
      <main
        className="flex min-h-screen flex-col pb-24"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="mx-auto w-full max-w-lg px-4 py-10">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/profile"
                className="mb-3 inline-flex items-center gap-1 text-[13px] transition-colors"
                style={{ color: "var(--color-text-3)" }}
              >
                ← Profile
              </Link>
              <h1
                className="text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-1)",
                }}
              >
                Study Journal
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: "var(--color-text-3)" }}>
                {entries.length} session{entries.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {entries.length === 0 ? (
            <div
              className="rounded-[var(--radius-card)] border p-8 text-center"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <p
                className="text-[15px]"
                style={{ color: "var(--color-text-3)" }}
              >
                No journal entries yet.
              </p>
              <p
                className="mt-1 text-[13px]"
                style={{ color: "var(--color-text-3)" }}
              >
                Answer OIA questions on the reading screen to create your first
                entry.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
                style={{
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                }}
              >
                Start Reading
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => {
                const bookName =
                  getBook(entry.book as string)?.name ?? (entry.book as string);
                const answerCount =
                  (entry.journal_answers?.[0] as unknown as { count: number })
                    ?.count ?? 0;
                const preview = entry.note
                  ? (entry.note as string).slice(0, 80) +
                    ((entry.note as string).length > 80 ? "…" : "")
                  : null;

                return (
                  <li key={entry.id as string}>
                    <Link
                      href={`/profile/journal/${entry.id}`}
                      className="group flex flex-col gap-1.5 rounded-[var(--radius-card)] border p-4 transition-all hover:border-[var(--color-accent)]"
                      style={{
                        borderColor: entry.is_lament_session
                          ? "var(--color-text-3)"
                          : "var(--color-border)",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {entry.is_lament_session && (
                            <span
                              className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
                              style={{
                                background: "var(--color-text-3)",
                                color: "var(--color-bg)",
                              }}
                            >
                              Lament
                            </span>
                          )}
                          <span
                            className="text-[16px] font-semibold"
                            style={{ color: "var(--color-text-1)" }}
                          >
                            {bookName} {entry.chapter as number}
                          </span>
                        </div>
                        <span
                          className="shrink-0 text-[12px]"
                          style={{ color: "var(--color-text-3)" }}
                        >
                          {formatDate(entry.studied_at as string)}
                        </span>
                      </div>

                      {preview && (
                        <p
                          className="text-[13px] leading-relaxed"
                          style={{ color: "var(--color-text-2)" }}
                        >
                          {preview}
                        </p>
                      )}

                      <div
                        className="flex items-center gap-3 text-[12px]"
                        style={{ color: "var(--color-text-3)" }}
                      >
                        {answerCount > 0 && (
                          <span>
                            {answerCount} answer{answerCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          View →
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

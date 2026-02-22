/**
 * /profile/journal/[id] — Journal session view.
 *
 * Shows a full study session: OIA answers + Charles responses + free note.
 */

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { getBook } from "@/lib/bible";
import type { JournalEntryRow, JournalAnswerRow } from "@/types/database";
import JournalNoteEditor from "./journal-note-editor";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const OIA_LABELS: Record<string, string> = {
  observe: "Observe",
  interpret: "Interpret",
  apply: "Apply",
};

const OIA_ORDER = ["observe", "interpret", "apply"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("book, chapter")
    .eq("id", id)
    .maybeSingle();
  if (!data) return { title: "Journal" };
  const bookName = getBook((data as { book: string }).book)?.name ?? data.book;
  return { title: `${bookName} ${(data as { chapter: number }).chapter} — Journal` };
}

export default async function JournalSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch entry
  const { data: entryRaw } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!entryRaw) notFound();
  const entry = entryRaw as unknown as JournalEntryRow;

  // Fetch answers
  const { data: answersRaw } = await supabase
    .from("journal_answers")
    .select("*")
    .eq("entry_id", id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const answers = (answersRaw ?? []) as unknown as JournalAnswerRow[];

  // Group by OIA type
  const grouped = OIA_ORDER.reduce<Record<string, JournalAnswerRow[]>>(
    (acc, type) => {
      acc[type] = answers.filter((a) => a.oia_type === type);
      return acc;
    },
    {}
  );

  const bookName = getBook(entry.book)?.name ?? entry.book;
  const isLament = entry.is_lament_session;

  return (
    <>
      <main
        className="flex min-h-screen flex-col pb-24"
        style={{
          background: isLament
            ? "color-mix(in srgb, var(--color-bg) 95%, black 5%)"
            : "var(--color-bg)",
        }}
      >
        <div className="mx-auto w-full max-w-lg px-4 py-10">
          {/* Back */}
          <Link
            href="/profile/journal"
            className="mb-8 inline-flex items-center gap-1 text-[13px] transition-colors"
            style={{ color: "var(--color-text-3)" }}
          >
            ← Journal
          </Link>

          {/* Chapter header */}
          <div className="mb-1 flex items-center gap-2">
            {isLament && (
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
          </div>

          <h1
            className="text-3xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-1)",
            }}
          >
            {bookName} {entry.chapter}
          </h1>
          <p
            className="mt-1 mb-8 text-[13px]"
            style={{ color: "var(--color-text-3)" }}
          >
            {formatDate(entry.studied_at)}
          </p>

          {/* OIA answers */}
          {answers.length > 0 ? (
            <div className="space-y-8 mb-8">
              {OIA_ORDER.map((type) => {
                const group = grouped[type];
                if (!group || group.length === 0) return null;
                return (
                  <section key={type}>
                    <h2
                      className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {OIA_LABELS[type]}
                    </h2>
                    <div className="space-y-5">
                      {group.map((answer) => (
                        <div key={answer.id as string}>
                          {/* Question */}
                          <p
                            className="mb-2 text-[13px] font-medium"
                            style={{ color: "var(--color-text-2)" }}
                          >
                            {answer.question_text as string}
                          </p>
                          {/* User's answer */}
                          <p
                            className="text-[15px] leading-relaxed"
                            style={{ color: "var(--color-text-1)" }}
                          >
                            {answer.answer_text as string}
                          </p>
                          {/* Charles's response */}
                          {answer.charles_response && (
                            <div
                              className="mt-3 border-l-2 pl-4"
                              style={{
                                borderColor: isLament
                                  ? "var(--color-text-3)"
                                  : "var(--color-accent)",
                              }}
                            >
                              <p
                                className="text-[13px] italic leading-relaxed"
                                style={{ color: "var(--color-text-2)" }}
                              >
                                {answer.charles_response as string}
                              </p>
                              <p
                                className="mt-1 text-[11px]"
                                style={{ color: "var(--color-text-3)" }}
                              >
                                — Charles
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div
              className="mb-8 rounded-[var(--radius-card)] border p-5 text-[14px]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-3)",
              }}
            >
              No OIA answers recorded for this session.
            </div>
          )}

          {/* Free note section */}
          <section>
            <h2
              className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-3)" }}
            >
              Notes
            </h2>
            <JournalNoteEditor entryId={entry.id} initialNote={entry.note} />
          </section>

          {/* Read this chapter again */}
          <div className="mt-10">
            <Link
              href={`/read/${entry.book.toLowerCase()}/${entry.chapter}`}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-2)",
              }}
            >
              Read {bookName} {entry.chapter} again →
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

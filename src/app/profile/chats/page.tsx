import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import { MessageSquare, Plus, ArrowLeft, BookOpen } from "lucide-react";
import type { ChatSessionRow } from "@/types/database";

export const metadata = { title: "Conversations — Bible Study App" };

function formatDate(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ChatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id, title, anchor_book, anchor_chapter, message_count, last_message_at, started_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("last_message_at", { ascending: false })
    .limit(50);

  const rows = (sessions ?? []) as Pick<
    ChatSessionRow,
    "id" | "title" | "anchor_book" | "anchor_chapter" | "message_count" | "last_message_at" | "started_at"
  >[];

  return (
    <>
      <main className="min-h-screen pb-24" style={{ background: "var(--color-bg-primary)" }}>
        {/* Header */}
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b"
          style={{ background: "var(--color-bg-primary)", borderColor: "var(--color-border)" }}
        >
          <Link href="/profile" className="text-[var(--color-text-secondary)]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="flex-1 text-base font-bold text-[var(--color-text-primary)]">
            Conversations
          </h1>
          <Link
            href="/chat/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
          >
            <Plus size={14} />
            New
          </Link>
        </header>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-xl font-bold"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--color-accent)" }}
            >
              <MessageSquare size={24} />
            </div>
            <p className="text-base font-semibold text-[var(--color-text-primary)]">
              No conversations yet
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xs">
              Start by tapping &ldquo;Ask Charles&rdquo; on any chapter, or start a new open conversation.
            </p>
            <Link
              href="/chat/new"
              className="mt-6 px-6 py-3 rounded-full text-sm font-semibold"
              style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
            >
              Start a conversation
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {rows.map((session) => {
              const title = (session.title as string | null) ?? "Untitled conversation";
              const book = session.anchor_book as string | null;
              const ch = session.anchor_chapter as number | null;
              const msgCount = (session.message_count as number) ?? 0;
              const ts = session.last_message_at as string;

              return (
                <Link
                  key={session.id as string}
                  href={`/chat/${session.id as string}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="flex-none w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
                  >
                    C
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {title}
                      </p>
                      <span className="flex-none text-[10px] text-[var(--color-text-secondary)]">
                        {formatDate(ts)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {book && ch && (
                        <span
                          className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: "var(--color-accent)22", color: "var(--color-accent)" }}
                        >
                          <BookOpen size={8} />
                          {book} {ch}
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        {msgCount} message{msgCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

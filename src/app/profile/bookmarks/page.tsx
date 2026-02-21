/**
 * /profile/bookmarks — All saved bookmarks for the current user.
 *
 * Server component: fetches bookmarks, groups by book, renders list.
 * Clicking an item navigates to /read/[book]/[chapter]?verse=[v]
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import type { BookmarkRow } from "@/types/database";
import { Bookmark, ArrowLeft, BookOpen } from "lucide-react";

export const metadata = { title: "Bookmarks — Bible Study App" };

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bookmarks = (data as unknown as BookmarkRow[]) ?? [];

  // Group by book
  const grouped = bookmarks.reduce<Record<string, BookmarkRow[]>>((acc, bm) => {
    const key = bm.book;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bm);
    return acc;
  }, {});

  const bookKeys = Object.keys(grouped);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 h-[52px] border-b"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <Link
          href="/profile"
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: "var(--color-text-2)" }}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 flex items-center gap-2">
          <Bookmark size={16} style={{ color: "var(--color-accent)" }} />
          <h1
            className="font-semibold"
            style={{ fontFamily: "var(--font-sans)", fontSize: "15px" }}
          >
            Bookmarks
          </h1>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
          {bookmarks.length} saved
        </p>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-6">
        {bookmarks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 mt-20 text-center"
            style={{ color: "var(--color-text-3)" }}
          >
            <BookOpen size={36} />
            <div>
              <p className="font-medium mb-1">No bookmarks yet</p>
              <p className="text-sm">
                Tap any verse number while reading to bookmark it.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              Start reading
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookKeys.map((bookCode) => {
              const bookData = getBook(bookCode);
              const name = bookData?.name ?? bookCode;
              const entries = grouped[bookCode];
              return (
                <section key={bookCode}>
                  <h2
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    {name}
                  </h2>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {entries.map((bm, i) => {
                      const href = `/read/${bookCode}/${bm.chapter}${bm.verse ? `?verse=${bm.verse}` : ""}`;
                      const label = bm.label
                        ? bm.label
                        : bm.verse
                        ? `${name} ${bm.chapter}:${bm.verse}`
                        : `${name} ${bm.chapter}`;
                      return (
                        <Link
                          key={bm.id}
                          href={href}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:opacity-80"
                          style={{
                            background: "var(--color-surface)",
                            borderTop:
                              i > 0 ? `1px solid var(--color-border)` : undefined,
                          }}
                        >
                          <Bookmark
                            size={14}
                            style={{ color: "var(--color-accent)", flexShrink: 0 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--color-text-1)" }}
                            >
                              {label}
                            </p>
                            {bm.label && bm.verse && (
                              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
                                {name} {bm.chapter}:{bm.verse}
                              </p>
                            )}
                          </div>
                          <p className="text-xs flex-shrink-0" style={{ color: "var(--color-text-3)" }}>
                            {new Date(bm.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

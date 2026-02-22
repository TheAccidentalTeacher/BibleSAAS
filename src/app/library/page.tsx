import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import LibrarySearch from "./library-search";

export const metadata = { title: "Library — Bible Study App" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Recently visited history
  const { data: history } = await supabase
    .from("user_library_history")
    .select("id, entry_type, entry_label, entry_slug, last_visited_at")
    .eq("user_id", user.id)
    .order("last_visited_at", { ascending: false })
    .limit(10);

  const sections = [
    { href: "/library/word-study", label: "Word Study", icon: "📖", desc: "Strong's lexicon & morphology" },
    { href: "/library/dictionary", label: "Dictionary", icon: "📚", desc: "Easton's, Smith's, ISBE" },
    { href: "/library/commentary", label: "Commentary", icon: "🏛", desc: "Henry, Calvin, Clarke" },
    { href: "/library/hymns", label: "Hymns", icon: "🎵", desc: "Classic hymns & themes" },
    { href: "/library/characters", label: "Characters", icon: "👤", desc: "Bible character profiles" },
    { href: "/library/catechism", label: "Catechism", icon: "📜", desc: "Q&A for faith formation" },
  ];

  return (
    <>
      <main
        className="min-h-screen pb-24"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-20 px-5 h-[52px] flex items-center border-b"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-1)" }}
          >
            Library
          </h1>
        </header>

        <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-6">
          {/* Search */}
          <LibrarySearch />

          {/* Recently Visited */}
          {history && history.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-3)" }}>
                Recently Visited
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {history.map((h) => {
                  const hrefMap: Record<string, string> = {
                    word_study: `/library/word-study/${h.entry_slug ?? h.id}`,
                    dictionary: `/library/dictionary/${h.entry_slug ?? h.id}`,
                    hymn: `/library/hymns`,
                    commentary: `/library/commentary`,
                    character_card: `/library/characters`,
                    catechism: `/library/catechism`,
                  };
                  return (
                    <Link
                      key={h.id}
                      href={hrefMap[h.entry_type] ?? "/library"}
                      className="shrink-0 rounded-xl border px-4 py-3 text-sm shadow-sm"
                      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", minWidth: "140px" }}
                    >
                      <p className="font-medium truncate" style={{ color: "var(--color-text-1)" }}>
                        {h.entry_label ?? "Entry"}
                      </p>
                      <p className="text-[11px] capitalize mt-0.5" style={{ color: "var(--color-text-3)" }}>
                        {h.entry_type.replace("_", " ")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section grid */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-3)" }}>
              Browse
            </p>
            <div className="grid grid-cols-2 gap-3">
              {sections.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="rounded-2xl border p-4 flex flex-col gap-2 transition-colors hover:bg-[var(--color-surface-2)]"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                >
                  <span className="text-2xl leading-none">{s.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-1)" }}>{s.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-3)" }}>{s.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

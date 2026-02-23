"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";

export default function WordStudyIndexPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { strongs_number: string; original_word: string; transliteration: string; definition: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/library/word-study?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <>
      <main
        className="min-h-screen pb-24"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-5 h-[52px] border-b"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <Link href="/library" className="text-sm" style={{ color: "var(--color-text-2)" }}>
            ‹ Library
          </Link>
          <h1 className="text-base font-semibold" style={{ color: "var(--color-text-1)" }}>
            Word Study
          </h1>
        </header>

        <div className="px-4 py-5 max-w-lg mx-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by English word, Strong's number (H1234) …"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
            }}
          />

          {/* Hint */}
          {!query && results.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-4xl mb-3">📖</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-2)" }}>
                Look up any Hebrew or Greek word
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>
                Search by English meaning, transliteration, or Strong&apos;s number (e.g. H2617, G26)
              </p>
            </div>
          )}

          {loading && (
            <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-3)" }}>
              Searching…
            </p>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {results.map((r) => (
                <button
                  key={r.strongs_number}
                  onClick={() => router.push(`/library/word-study/${r.strongs_number}`)}
                  className="text-left rounded-xl border px-4 py-3 transition-colors hover:brightness-110"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: "var(--color-surface-2)", color: "var(--color-accent)" }}
                    >
                      {r.strongs_number}
                    </span>
                    <span className="font-medium text-sm" style={{ color: "var(--color-text-1)" }}>
                      {r.original_word}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-3)" }}>
                      {r.transliteration}
                    </span>
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-2)" }}>
                    {r.definition}
                  </p>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-3)" }}>
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

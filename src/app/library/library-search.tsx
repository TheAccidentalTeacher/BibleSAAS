"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchResult {
  type: "dictionary" | "word_study";
  id: string;
  label: string;
  subtitle: string;
  snippet: string;
  href: string;
}

export default function LibrarySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const r = await fetch(`/api/library/search?q=${encodeURIComponent(query)}`);
      if (r.ok) {
        const j = await r.json() as { results: SearchResult[] };
        setResults(j.results);
      }
      setLoading(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <Search size={15} style={{ color: "var(--color-text-3)" }} />
        <input
          type="text"
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--color-text-1)" }}
          placeholder="Search dictionary, words, hymns…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} aria-label="Clear">
            <X size={14} style={{ color: "var(--color-text-3)" }} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {query && (
        <div
          className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          {loading && (
            <div className="px-4 py-3 text-xs" style={{ color: "var(--color-text-3)" }}>Searching…</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-xs" style={{ color: "var(--color-text-3)" }}>No results for &ldquo;{query}&rdquo;</div>
          )}
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => { setQuery(""); setResults([]); router.push(r.href); }}
              className="w-full flex flex-col items-start px-4 py-3 border-b text-left hover:bg-[var(--color-bg)] transition-colors"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>{r.label}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-surface-2)", color: "var(--color-text-3)" }}>
                  {r.subtitle}
                </span>
              </div>
              {r.snippet && (
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--color-text-3)" }}>{r.snippet}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

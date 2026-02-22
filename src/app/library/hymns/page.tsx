"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const THEMES = [
  "All","grace","atonement","resurrection","sovereignty","comfort","praise","lament",
  "faith","repentance","holiness","providence","creation","redemption",
];

interface HymnCard {
  id: string;
  title: string;
  first_line: string | null;
  author: string | null;
  year_written: number | null;
  tune_name: string | null;
  meter: string | null;
  thematic_tags: string[];
  explicit_refs: string[];
}

interface HymnDetail extends HymnCard {
  lyrics: string;
}

export default function HymnsPage() {
  const [theme, setTheme] = useState("All");
  const [hymns, setHymns] = useState<HymnCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<HymnDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const url = theme === "All"
      ? "/api/library/hymns?limit=40"
      : `/api/library/hymns?theme=${encodeURIComponent(theme)}&limit=40`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setHymns(data.hymns ?? []);
    }
    setLoading(false);
  }, [theme]);

  useEffect(() => { load(); }, [load]);

  const openHymn = async (h: HymnCard) => {
    setDetailLoading(true);
    setSelected(null);
    const res = await fetch(`/api/library/hymns?id=${h.id}`);
    if (res.ok) {
      const data = await res.json();
      setSelected(data.hymn ?? null);
    }
    setDetailLoading(false);
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="text-[var(--muted)] text-sm">← Hymns</button>
        </div>
        <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{selected.title}</h1>
            {selected.author && <p className="text-sm text-[var(--muted)]">{selected.author}{selected.year_written ? `, ${selected.year_written}` : ""}</p>}
            {selected.tune_name && <p className="text-xs text-[var(--muted)]">Tune: {selected.tune_name}{selected.meter ? ` · ${selected.meter}` : ""}</p>}
          </div>
          {selected.thematic_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.thematic_tags.map((t) => (
                <span key={t} className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-2.5 py-0.5 capitalize">{t}</span>
              ))}
            </div>
          )}
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{selected.lyrics}</pre>
          {selected.explicit_refs.length > 0 && (
            <div className="border-t border-[var(--border)] pt-4 space-y-2">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Scripture References</p>
              <div className="flex flex-wrap gap-2">
                {selected.explicit_refs.map((ref) => (
                  <span key={ref} className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-2.5 py-0.5 text-[var(--muted)]">{ref}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Hymns</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Theme filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                theme === t
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading…</div>
        )}

        {detailLoading && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading hymn…</div>
        )}

        {!loading && hymns.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No hymns found for theme &ldquo;{theme}&rdquo;.</div>
        )}

        <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
          {hymns.map((h) => (
            <button
              key={h.id}
              onClick={() => openHymn(h)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--surface)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{h.title}</p>
                  {h.first_line && (
                    <p className="text-xs text-[var(--muted)] mt-0.5 truncate italic">&ldquo;{h.first_line}&rdquo;</p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {h.author ?? "Unknown"}{h.year_written ? `, ${h.year_written}` : ""}
                  </p>
                </div>
                <span className="text-[var(--muted)] text-xs shrink-0 mt-1">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

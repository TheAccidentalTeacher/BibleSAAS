"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const CATECHISMS = [
  { id: "WSC", label: "Westminster Shorter", abbrev: "WSC", questions: 107 },
  { id: "WLC", label: "Westminster Larger", abbrev: "WLC", questions: 196 },
  { id: "HC", label: "Heidelberg", abbrev: "HC", questions: 129 },
];

interface CatechismEntry {
  id: string;
  catechism: string;
  question_number: number;
  lord_day: number | null;
  section: string | null;
  question_text: string;
  answer_text: string;
  scripture_refs: string[] | null;
  keywords: string[] | null;
  charles_note: string | null;
}

export default function CatechismPage() {
  const [cat, setCat] = useState("WSC");
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<CatechismEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ cat });
    if (q) params.set("q", q);
    const res = await fetch(`/api/library/catechism?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries ?? []);
    }
    setLoading(false);
  }, [cat, q]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const catInfo = CATECHISMS.find((c) => c.id === cat)!;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Catechism</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Catechism selector */}
        <div className="flex gap-2">
          {CATECHISMS.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); setQ(""); setExpanded(null); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                cat === c.id
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {c.abbrev}
            </button>
          ))}
        </div>

        {/* Catechism title and count */}
        <div>
          <h1 className="text-base font-semibold">{catInfo.label} Catechism</h1>
          <p className="text-xs text-[var(--muted)]">{catInfo.questions} questions</p>
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder={`Search ${catInfo.abbrev}…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
        />

        {loading && <div className="py-12 text-center text-sm text-[var(--muted)]">Loading…</div>}

        {/* Q&A list */}
        <div className="space-y-2">
          {entries.map((e) => {
            const isOpen = expanded === e.id;
            return (
              <div key={e.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--surface)] transition-colors"
                >
                  <span className="text-xs font-mono text-[var(--accent)] shrink-0 mt-0.5 w-8">Q{e.question_number}.</span>
                  <span className="text-sm font-medium leading-snug">{e.question_text}</span>
                  <span className="text-[var(--muted)] shrink-0 ml-auto">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] space-y-3">
                    <p className="text-sm leading-relaxed">
                      <span className="text-xs font-mono text-[var(--muted)] mr-2">A.</span>
                      {e.answer_text}
                    </p>
                    {e.charles_note && (
                      <div className="bg-[var(--surface)] rounded-lg p-3 italic text-sm text-[var(--muted)]">
                        &ldquo;{e.charles_note}&rdquo;
                        <p className="mt-1 text-xs not-italic font-medium text-[var(--accent)]">— Charles</p>
                      </div>
                    )}
                    {e.scripture_refs && e.scripture_refs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {e.scripture_refs.map((ref) => (
                          <span key={ref} className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-2 py-0.5 text-[var(--muted)]">
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.keywords && e.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {e.keywords.map((kw) => (
                          <span key={kw} className="text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-full px-2 py-0.5">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

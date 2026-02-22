"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface DictEntry {
  id: string;
  source: string;
  term: string;
  slug: string;
  body: string;
  passage_refs: string[];
  charles_note: string | null;
  is_primary_source: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  eastons: "Easton's",
  smiths: "Smith's",
  isbe: "ISBE",
};

export default function DictionarySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [primary, setPrimary] = useState<DictEntry | null>(null);
  const [activeSource, setActiveSource] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/library/dictionary?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setEntries(data.entries ?? []);
      setPrimary(data.primary ?? null);
      setActiveSource(data.primary?.source ?? data.entries?.[0]?.source ?? "");
      setLoading(false);
    };
    load();
  }, [slug]);

  const activeEntry = entries.find((e) => e.source === activeSource);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6 flex items-center justify-center">
        <p className="text-[var(--muted)] text-sm">Loading…</p>
      </div>
    );
  }

  if (!primary) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <p className="text-[var(--muted)]">Entry not found.</p>
        <button onClick={() => router.back()} className="text-[var(--accent)] underline text-sm mt-2">← Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Dictionary</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Term heading */}
        <div>
          <h1 className="text-2xl font-bold capitalize">{primary.term}</h1>
        </div>

        {/* Charles note */}
        {primary.charles_note && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 italic text-sm text-[var(--muted)]">
            &ldquo;{primary.charles_note}&rdquo;
            <p className="mt-1 text-xs not-italic font-medium text-[var(--accent)]">— Charles synthesis</p>
          </div>
        )}

        {/* Source tabs */}
        {entries.length > 1 && (
          <div className="flex border-b border-[var(--border)] gap-1">
            {entries.map((e) => (
              <button
                key={e.source}
                onClick={() => setActiveSource(e.source)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeSource === e.source
                    ? "border-[var(--accent)] text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted)]"
                }`}
              >
                {SOURCE_LABELS[e.source] ?? e.source}
              </button>
            ))}
          </div>
        )}

        {/* Entry body */}
        {activeEntry && (
          <div className="prose prose-sm max-w-none text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
            {activeEntry.body}
          </div>
        )}

        {/* Passage refs */}
        {activeEntry && activeEntry.passage_refs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">Scripture References</p>
            <div className="flex flex-wrap gap-2">
              {activeEntry.passage_refs.map((ref) => (
                <span
                  key={ref}
                  className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1 text-[var(--muted)]"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

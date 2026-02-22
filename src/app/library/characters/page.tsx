"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const RARITY_STYLES: Record<string, { label: string; class: string }> = {
  faithful: { label: "Faithful", class: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300" },
  renowned: { label: "Renowned", class: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  mighty: { label: "Mighty", class: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  eternal: { label: "Eternal", class: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  the_word: { label: "The Word", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold" },
};

const ROLE_FILTERS = ["All","prophet","apostle","king","judge","priest","disciple","patriarch","warrior","wife","mother"];

interface CharacterCard {
  id: string;
  name: string;
  alternate_names: string[] | null;
  primary_role: string | null;
  era: string | null;
  first_mention_book: string | null;
  description: string | null;
  rarity: "faithful" | "renowned" | "mighty" | "eternal" | "the_word";
  is_athlete_of_faith: boolean;
  is_in_hebrews_11: boolean;
}

export default function CharactersPage() {
  const [role, setRole] = useState("All");
  const [q, setQ] = useState("");
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CharacterCard | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "60" });
    if (role !== "All") params.set("role", role);
    if (q) params.set("q", q);
    const res = await fetch(`/api/library/characters?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCharacters(data.characters ?? []);
    }
    setLoading(false);
  }, [role, q]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Bible Characters</span>
      </div>

      {/* Character detail overlay */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-xl mx-auto bg-[var(--background)] rounded-t-2xl p-6 space-y-3 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selected.name}</h2>
                {selected.alternate_names?.length ? (
                  <p className="text-xs text-[var(--muted)]">aka {selected.alternate_names.join(", ")}</p>
                ) : null}
              </div>
              <button onClick={() => setSelected(null)} className="text-[var(--muted)] text-xl leading-none">×</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {RARITY_STYLES[selected.rarity] && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${RARITY_STYLES[selected.rarity].class}`}>
                  {RARITY_STYLES[selected.rarity].label}
                </span>
              )}
              {selected.primary_role && (
                <span className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-full px-2.5 py-0.5 capitalize">
                  {selected.primary_role}
                </span>
              )}
              {selected.is_in_hebrews_11 && (
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full px-2.5 py-0.5">
                  Hebrews 11
                </span>
              )}
            </div>
            {selected.era && <p className="text-xs text-[var(--muted)]">Era: {selected.era}</p>}
            {selected.first_mention_book && <p className="text-xs text-[var(--muted)]">First appears: {selected.first_mention_book}</p>}
            {selected.description && (
              <p className="text-sm leading-relaxed">{selected.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <input
          type="search"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm"
        />

        {/* Role filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                role === r
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {loading && <div className="py-12 text-center text-sm text-[var(--muted)]">Loading…</div>}

        {/* Character grid */}
        <div className="grid grid-cols-2 gap-3">
          {characters.map((c) => {
            const rarity = RARITY_STYLES[c.rarity];
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 space-y-1.5 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-sm font-semibold leading-tight">{c.name}</p>
                  {rarity && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${rarity.class}`}>
                      {rarity.label}
                    </span>
                  )}
                </div>
                {c.primary_role && <p className="text-xs text-[var(--muted)] capitalize">{c.primary_role}</p>}
                {c.first_mention_book && <p className="text-[10px] text-[var(--muted)]">{c.first_mention_book}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

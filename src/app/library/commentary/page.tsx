"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
  "2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
  "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James",
  "1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

const SOURCE_LABELS: Record<string, string> = {
  matthew_henry: "Matthew Henry",
  calvin: "Calvin",
  adam_clarke: "Adam Clarke",
};

interface CommentaryEntry {
  id: string;
  source: string;
  book: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  section_title: string | null;
  body: string;
  is_vault_featured: boolean;
}

export default function CommentaryPage() {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(3);
  const [activeSource, setActiveSource] = useState("matthew_henry");
  const [grouped, setGrouped] = useState<Record<string, CommentaryEntry[]>>({});
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/library/commentary?book=${encodeURIComponent(book)}&chapter=${chapter}`);
    if (res.ok) {
      const data = await res.json();
      setGrouped(data.grouped ?? {});
      setSources(data.sources ?? []);
      if (data.sources?.length && !data.sources.includes(activeSource)) {
        setActiveSource(data.sources[0]);
      }
    }
    setLoading(false);
    setExpanded(null);
  }, [book, chapter, activeSource]);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [book, chapter]);

  const entries = grouped[activeSource] ?? [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Commentary</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Passage picker */}
        <div className="flex gap-2">
          <select
            value={book}
            onChange={(e) => setBook(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm px-3 py-2"
          >
            {BIBLE_BOOKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={150}
            value={chapter}
            onChange={(e) => setChapter(Number(e.target.value))}
            className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm px-3 py-2"
            placeholder="Ch."
          />
        </div>

        {/* Source tabs */}
        {sources.length > 0 && (
          <div className="flex border-b border-[var(--border)] gap-1">
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => setActiveSource(src)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeSource === src
                    ? "border-[var(--accent)] text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted)]"
                }`}
              >
                {SOURCE_LABELS[src] ?? src}
              </button>
            ))}
          </div>
        )}

        {/* Entries */}
        {loading && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading…</div>
        )}

        {!loading && entries.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No commentary for {book} {chapter} in this source.
          </div>
        )}

        <div className="space-y-3">
          {entries.map((e) => {
            const verseLabel = e.verse_start
              ? `v.${e.verse_start}${e.verse_end && e.verse_end !== e.verse_start ? `–${e.verse_end}` : ""}`
              : "Chapter";
            const isOpen = expanded === e.id;
            const preview = e.body.slice(0, 200);
            return (
              <div key={e.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className="w-full text-left px-4 py-3 flex items-start justify-between gap-2 hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-[var(--accent)] mr-2">{verseLabel}</span>
                    <span className="text-sm font-medium">{e.section_title ?? `${book} ${chapter}:${e.verse_start ?? ""}`}</span>
                    {!isOpen && (
                      <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{preview}…</p>
                    )}
                  </div>
                  <span className="text-[var(--muted)] mt-0.5 shrink-0">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-wrap text-[var(--foreground)] border-t border-[var(--border)]">
                    {e.body}
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

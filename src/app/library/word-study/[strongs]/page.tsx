import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { WordOccurrenceRow, StrongsLexiconRow } from "@/types/database";

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

interface Props {
  params: Promise<{ strongs: string }>;
}

export default async function WordStudyPage({ params }: Props) {
  const { strongs } = await params;
  const strongsNum = strongs.toUpperCase();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawEntry } = await supabase
    .from("strongs_lexicon")
    .select("*")
    .eq("strongs_number", strongsNum)
    .single();
  const entry = rawEntry as unknown as StrongsLexiconRow | null;

  if (!entry) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <p className="text-[var(--muted)]">Word not found: {strongsNum}</p>
        <Link href="/library" className="text-[var(--accent)] underline">← Library</Link>
      </div>
    );
  }

  // Fetch verse occurrences
  const { data: verses } = await supabase
    .from("word_occurrences")
    .select("book, chapter, verse, count")
    .eq("strongs_number", strongsNum)
    .order("book")
    .order("chapter")
    .order("verse")
    .limit(60);

  // Track visit
  await supabase.from("user_library_history").upsert({
    user_id: user.id,
    entry_type: "word_study",
    entry_id: entry.id,
    entry_slug: strongsNum,
    entry_label: `${entry.transliteration ?? entry.original_word} (${strongsNum})`,
    last_visited_at: new Date().toISOString(),
    visit_count: 1,
  }, { onConflict: "user_id,entry_type,entry_id", ignoreDuplicates: false });

  const heatmap = (entry.occurrence_heatmap ?? {}) as Record<string, number>;
  const maxCount = Math.max(1, ...Object.values(heatmap).map(Number));
  const charles = (entry.charles_study ?? {}) as Record<string, string>;
  const occurrenceList: Pick<WordOccurrenceRow, "book"|"chapter"|"verse"|"count">[] = verses ?? [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
        <Link href="/library" className="text-[var(--muted)] text-sm">← Library</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-sm font-medium">Word Study</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-1">
          <p
            className="text-5xl font-bold"
            dir={entry.language === "hebrew" ? "rtl" : "ltr"}
            style={{ fontFamily: entry.language === "hebrew" ? "SBL Hebrew, serif" : "SBL Greek, serif" }}
          >
            {entry.original_word}
          </p>
          <p className="text-xl text-[var(--muted)]">{entry.transliteration}</p>
          <p className="text-mono text-sm text-[var(--accent)] font-medium">{strongsNum}</p>
          {entry.pronunciation && (
            <p className="text-sm text-[var(--muted)]">{entry.pronunciation}</p>
          )}
        </div>

        {/* Quick definition */}
        {entry.short_def && (
          <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted)] mb-1">Definition</p>
            <p className="text-base leading-relaxed">{entry.short_def}</p>
            {entry.part_of_speech && (
              <span className="mt-2 inline-block text-xs bg-[var(--accent)] bg-opacity-15 text-[var(--accent)] px-2 py-0.5 rounded-full">
                {entry.part_of_speech}
              </span>
            )}
          </div>
        )}

        {/* Charles Synthesis */}
        {charles.intro && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Charles Explains</h2>
            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] space-y-3">
              {charles.intro && <p className="text-sm leading-relaxed">{charles.intro}</p>}
              {charles.etymology && (
                <div>
                  <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">Etymology</p>
                  <p className="text-sm leading-relaxed">{charles.etymology}</p>
                </div>
              )}
              {charles.usage_insight && (
                <div>
                  <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">Usage Insight</p>
                  <p className="text-sm leading-relaxed">{charles.usage_insight}</p>
                </div>
              )}
              {charles.theological_weight && (
                <div>
                  <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-1">Theological Weight</p>
                  <p className="text-sm leading-relaxed">{charles.theological_weight}</p>
                </div>
              )}
              {charles.closing_line && (
                <p className="text-sm italic text-[var(--muted)] border-t border-[var(--border)] pt-3">
                  &ldquo;{charles.closing_line}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Occurrence Heat Map */}
        {Object.keys(heatmap).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold">Across Scripture</h2>
              <span className="text-sm text-[var(--muted)]">{entry.total_occurrences} occurrences</span>
            </div>
            <div className="grid grid-cols-11 gap-0.5">
              {BIBLE_BOOKS.map((book) => {
                const count = Number(heatmap[book] ?? 0);
                const intensity = count === 0 ? 0 : Math.max(0.1, count / maxCount);
                return (
                  <div
                    key={book}
                    title={`${book}: ${count}`}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: count === 0
                        ? "var(--border)"
                        : `rgba(var(--accent-rgb, 124 99 80), ${intensity})`,
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Genesis</span>
              <span>← OT · NT →</span>
              <span>Revelation</span>
            </div>
          </div>
        )}

        {/* Verse List */}
        {occurrenceList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Appears In</h2>
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
              {occurrenceList.map((v, i) => (
                <Link
                  key={i}
                  href={`/read/${encodeURIComponent(v.book)}/${v.chapter}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--surface)] transition-colors"
                >
                  <span className="font-medium">{v.book} {v.chapter}:{v.verse}</span>
                  {v.count > 1 && (
                    <span className="text-xs text-[var(--muted)]">×{v.count}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Raw Lexicon (accordion) */}
        {(entry.long_def || entry.kjv_usage || entry.usage_notes) && (
          <details className="border border-[var(--border)] rounded-xl overflow-hidden">
            <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-[var(--surface)] select-none">
              Raw Lexicon Data
            </summary>
            <div className="px-4 pb-4 pt-2 space-y-3 text-sm text-[var(--muted)]">
              {entry.long_def && (
                <div>
                  <p className="font-medium text-[var(--foreground)] mb-1">Full Definition</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{entry.long_def}</p>
                </div>
              )}
              {entry.kjv_usage && (
                <div>
                  <p className="font-medium text-[var(--foreground)] mb-1">KJV Translations</p>
                  <p className="leading-relaxed">{entry.kjv_usage}</p>
                </div>
              )}
              {entry.usage_notes && (
                <div>
                  <p className="font-medium text-[var(--foreground)] mb-1">Usage Notes</p>
                  <p className="leading-relaxed">{entry.usage_notes}</p>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

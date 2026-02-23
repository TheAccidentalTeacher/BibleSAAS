import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED_NAME = 'spurgeon_morning_evening';
const DELAY_MS = 50;
const BATCH_SIZE = 20;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCheckpoint(): Promise<number | null> {
  const { data, error } = await supabase
    .from('seed_checkpoints')
    .select('last_checkpoint, status')
    .eq('seed_name', SEED_NAME)
    .single();
  if (error || !data) return null;
  if (data.status === 'complete') {
    console.log('Seed already complete. Delete checkpoint row to re-run.');
    process.exit(0);
  }
  return data.last_checkpoint ? parseInt(data.last_checkpoint) : null;
}

async function saveCheckpoint(lastIdx: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: SEED_NAME,
      last_checkpoint: String(lastIdx),
      rows_inserted: rowsInserted,
      status: 'in_progress',
      last_updated_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

async function markComplete(rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: SEED_NAME,
      last_checkpoint: '9999',
      rows_inserted: rowsInserted,
      status: 'complete',
      last_updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

const MONTH_NAMES = [
  '',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

// Normalize Spurgeon's book names to match our DB (from chapters table)
const BOOK_ALIASES: Record<string, string> = {
  'Song of Songs': 'Song of Solomon',
  'Psalm': 'Psalms',
  'Songs of Solomon': 'Song of Solomon',
  'Song': 'Song of Solomon',
  'Revelation of John': 'Revelation',
  'Apocalypse': 'Revelation',
};

function normalizeBook(raw: string): string {
  return BOOK_ALIASES[raw] ?? raw;
}

function parseVerseRef(ref: string): { book: string; chapter: number; verse: number } | null {
  if (!ref) return null;
  // Take only first reference if semicolon-separated
  const firstRef = ref.split(';')[0].trim();
  // Match: (optional number + space + book words) + space + chapter:verse
  const match = firstRef.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;
  const [, bookRaw, chapter, verse] = match;
  return {
    book: normalizeBook(bookRaw.trim()),
    chapter: parseInt(chapter),
    verse: parseInt(verse),
  };
}

function extractRef(keyverse: string): { book: string; chapter: number; verse: number } | null {
  if (!keyverse) return null;
  // Split on em dash (U+2014), possibly followed by thin space (U+2009)
  const dashIdx = keyverse.indexOf('\u2014');
  if (dashIdx === -1) return null;
  const refPart = keyverse.slice(dashIdx + 1).replace(/\u2009/g, ' ').trim();
  return parseVerseRef(refPart);
}

interface SpurgeonEntry {
  date: string;
  time: 'am' | 'pm';
  month: number;
  day: number;
  keyverse: string;
  body: string;
}

async function main() {
  console.log('Starting Spurgeon Morning & Evening seed...');

  const checkpoint = await getCheckpoint();
  const startIdx = checkpoint ? checkpoint + 1 : 0;

  console.log('Fetching m_e.json from GitHub...');
  const res = await fetch(
    'https://raw.githubusercontent.com/russianryebread/morning-and-evening/master/m_e.json'
  );
  if (!res.ok) throw new Error(`Failed to fetch: HTTP ${res.status}`);

  const rawData: (SpurgeonEntry | null)[] = await res.json();
  const entries = rawData.filter((e): e is SpurgeonEntry => e !== null);
  console.log(`Loaded ${entries.length} entries (${rawData.length - entries.length} nulls filtered)`);

  if (startIdx >= entries.length) {
    console.log('Already processed all entries.');
    return;
  }

  // Check if table already has data (no unique constraint, avoid duplicates)
  const { count: existingCount } = await supabase
    .from('spurgeon_index')
    .select('*', { count: 'exact', head: true });
  if ((existingCount ?? 0) >= entries.length) {
    console.log(`Already seeded (${existingCount} rows found). Marking complete.`);
    await markComplete(existingCount ?? 0);
    return;
  }

  console.log(`Resuming from index ${startIdx}`);

  let rowsInserted = 0;
  let batch: Array<Record<string, unknown>> = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const { error } = await supabase
      .from('spurgeon_index')
      .insert(batch);
    if (error) {
      if (error.code === '23505') {
        console.log(`  (batch already exists, skipping)`);
      } else {
        throw new Error(`Batch insert error: ${error.message}`);
      }
    }
    rowsInserted += batch.length;
    batch = [];
  };

  for (let i = startIdx; i < entries.length; i++) {
    const entry = entries[i];

    const monthName = MONTH_NAMES[entry.month] ?? `month${entry.month}`;
    const timeWord = entry.time === 'am' ? 'morning' : 'evening';
    const dateKey = `${monthName}-${entry.day}-${timeWord}`;

    const parsed = extractRef(entry.keyverse);

    batch.push({
      source: 'morning_evening',
      date_key: dateKey,
      book: parsed?.book ?? null,
      chapter: parsed?.chapter ?? null,
      verse: parsed?.verse ?? null,
      title: entry.keyverse
        ? entry.keyverse.slice(entry.keyverse.indexOf('\u2014') + 1).replace(/\u2009/g, ' ').trim()
        : null,
      body: entry.body,
      meta: {
        date: entry.date,
        month: entry.month,
        day: entry.day,
        time: entry.time,
      },
    });

    if (batch.length >= BATCH_SIZE) {
      await flush();
      await sleep(DELAY_MS);
    }

    if (i % 100 === 0) {
      await flush();
      await saveCheckpoint(i, rowsInserted);
      console.log(`  [${i}/${entries.length}] ${dateKey} — ${rowsInserted} rows`);
    }
  }

  await flush();
  await markComplete(rowsInserted);
  console.log(`\nSpurgeon seed complete. ${rowsInserted} entries inserted.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

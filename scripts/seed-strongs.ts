import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED_NAME = 'strongs_lexicon';
const DELAY_MS = 100;
const BATCH_SIZE = 50;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Checkpoint: "H:1234" or "G:5678" indicating language:lastIndex
async function getCheckpoint(): Promise<{ lang: string; lastNum: number } | null> {
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
  if (!data.last_checkpoint) return null;
  const [lang, num] = data.last_checkpoint.split(':');
  return { lang, lastNum: parseInt(num) };
}

async function saveCheckpoint(lang: string, lastNum: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: SEED_NAME,
      last_checkpoint: `${lang}:${lastNum}`,
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
      last_checkpoint: 'G:9999',
      rows_inserted: rowsInserted,
      status: 'complete',
      last_updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

interface StrongsEntry {
  lemma?: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
}

async function fetchStrongsDict(language: 'hebrew' | 'greek'): Promise<Record<string, StrongsEntry>> {
  const baseUrl = 'https://raw.githubusercontent.com/openscriptures/strongs/master';
  const url =
    language === 'hebrew'
      ? `${baseUrl}/hebrew/strongs-hebrew-dictionary.js`
      : `${baseUrl}/greek/strongs-greek-dictionary.js`;

  console.log(`Fetching ${language} dictionary from ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${language} dictionary: ${res.status}`);

  const text = await res.text();
  // File format: var strongsXxxDictionary = { ... };
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`Could not find JSON in ${language} dictionary`);

  return JSON.parse(text.slice(start, end + 1));
}

async function seedLanguage(
  language: 'hebrew' | 'greek',
  dict: Record<string, StrongsEntry>,
  startAfterNum: number,
  initialRows: number
): Promise<number> {
  const prefix = language === 'hebrew' ? 'H' : 'G';
  const entries = Object.entries(dict) as [string, StrongsEntry][];

  // Sort numerically
  entries.sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, ''));
    const numB = parseInt(b[0].replace(/\D/g, ''));
    return numA - numB;
  });

  let rowsInserted = initialRows;
  let batch: Array<Record<string, unknown>> = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const { error } = await supabase
      .from('strongs_lexicon')
      .upsert(batch, { onConflict: 'strongs_number' });
    if (error) throw new Error(`Batch upsert error: ${error.message}`);
    rowsInserted += batch.length;
    batch = [];
  };

  for (const [key, entry] of entries) {
    const num = parseInt(key.replace(/\D/g, ''));
    if (isNaN(num)) continue;
    if (language === 'hebrew' ? num <= startAfterNum : num <= startAfterNum) continue;

    batch.push({
      strongs_number: `${prefix}${num}`,
      language,
      original_word: entry.lemma ?? null,
      transliteration: entry.xlit ?? null,
      pronunciation: entry.pron ?? null,
      part_of_speech: null,
      short_def: entry.strongs_def ? entry.strongs_def.slice(0, 500) : null,
      long_def: entry.strongs_def ?? null,
      kjv_usage: entry.kjv_def ?? null,
      source: 'openscriptures',
      hebrew_root: null,
      root_strongs: null,
      semantic_domain: null,
      occurrence_heatmap: null,
      total_occurrences: null,
      meta: entry.derivation ? { derivation: entry.derivation } : null,
    });

    if (batch.length >= BATCH_SIZE) {
      await flush();
      await saveCheckpoint(prefix, num, rowsInserted);
      console.log(`  ${prefix}${num} — ${rowsInserted} total rows`);
      await sleep(DELAY_MS);
    }
  }

  await flush();
  return rowsInserted;
}

async function main() {
  console.log("Starting Strong's lexicon seed...");

  const checkpoint = await getCheckpoint();
  let startLang = 'H';
  let startNum = 0;
  let totalRows = 0;

  if (checkpoint) {
    startLang = checkpoint.lang;
    startNum = checkpoint.lastNum;
    console.log(`Resuming from ${startLang}:${startNum}`);
  }

  // Fetch both dictionaries up-front so we can resume mid-Greek without re-fetching
  const hebrewDict = await fetchStrongsDict('hebrew');
  const greekDict = await fetchStrongsDict('greek');

  if (startLang === 'H') {
    console.log(`\nSeeding Hebrew (${Object.keys(hebrewDict).length} entries)...`);
    totalRows = await seedLanguage('hebrew', hebrewDict, startNum, totalRows);
    await saveCheckpoint('H', 99999, totalRows);
    console.log(`\nHebrew complete. Starting Greek...`);
    startNum = 0; // Reset for Greek
  }

  console.log(`\nSeeding Greek (${Object.keys(greekDict).length} entries)...`);
  totalRows = await seedLanguage(
    'greek',
    greekDict,
    startLang === 'G' ? startNum : 0,
    totalRows
  );

  await markComplete(totalRows);
  console.log(`\nStrong's seed complete. ${totalRows} total rows inserted.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

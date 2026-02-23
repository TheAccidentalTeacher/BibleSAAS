import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED_NAME = 'tsk_references';
const DELAY_MS = 200;
const BATCH_SIZE = 500;
const CHECKPOINT_EVERY = 5000; // lines

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

async function saveCheckpoint(lastLine: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    {
      seed_name: SEED_NAME,
      last_checkpoint: String(lastLine),
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
      last_checkpoint: '999999',
      rows_inserted: rowsInserted,
      status: 'complete',
      last_updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'seed_name' }
  );
}

// OSIS abbreviation → full book name (as stored in our chapters table)
const OSIS_TO_BOOK: Record<string, string> = {
  Gen: 'Genesis',
  Exod: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deut: 'Deuteronomy',
  Josh: 'Joshua',
  Judg: 'Judges',
  Ruth: 'Ruth',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles',
  '2Chr': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Esth: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Prov: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Ezek: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zeph: 'Zephaniah',
  Hag: 'Haggai',
  Zech: 'Zechariah',
  Mal: 'Malachi',
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1Thess': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1Pet': '1 Peter',
  '2Pet': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
};

function parseRef(ref: string): { book: string; chapter: number; verse: number } | null {
  // Format: Book.Chapter.Verse  (e.g. Gen.1.1, 1Cor.13.4)
  const parts = ref.trim().split('.');
  if (parts.length < 3) return null;

  // Book may contain dots only if it's a weird abbreviation, so use everything except last 2 as book
  const versePart = parseInt(parts[parts.length - 1]);
  const chapterPart = parseInt(parts[parts.length - 2]);
  const bookAbbr = parts.slice(0, parts.length - 2).join('.');

  const book = OSIS_TO_BOOK[bookAbbr];
  if (!book) {
    return null; // Unknown book abbreviation
  }

  if (isNaN(chapterPart) || isNaN(versePart)) return null;

  return { book, chapter: chapterPart, verse: versePart };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_TSK_FILE = path.join(__dirname, 'cross-references.txt');
const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/shandran/openbible/main/cross_references_expanded.csv';
const TSK_URL = 'https://a.openbible.info/data/cross-references.txt';

function fetchHttps(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/plain,text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.openbible.info/labs/cross-references/',
      },
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location;
        if (location) return fetchHttps(location).then(resolve).catch(reject);
        return reject(new Error(`Redirect with no location`));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Starting TSK cross-references seed...');

  const checkpoint = await getCheckpoint();
  const startLine = checkpoint ? checkpoint + 1 : 1; // line 1 is header, data starts line 2

  let text: string;
  let isCsvFormat = false;

  // 1. Try local file first (fastest for re-runs)
  if (fs.existsSync(LOCAL_TSK_FILE)) {
    console.log(`Using local file: ${LOCAL_TSK_FILE}`);
    text = fs.readFileSync(LOCAL_TSK_FILE, 'utf-8');
    isCsvFormat = LOCAL_TSK_FILE.endsWith('.csv');
  } else {
    // 2. Try GitHub mirror CSV (no Cloudflare, ~26 MB)
    console.log(`Fetching cross-references from GitHub mirror...`);
    try {
      text = await fetchHttps(GITHUB_CSV_URL);
      if (text.length < 10000) throw new Error(`Response too short (${text.length} bytes)`);
      console.log(`Fetched ${(text.length / 1024 / 1024).toFixed(1)} MB from GitHub`);
      isCsvFormat = true;
    } catch (githubErr) {
      console.log(`GitHub failed (${(githubErr as Error).message}), trying openbible.info...`);
      // 3. Try openbible.info directly (Cloudflare-blocked but worth a try)
      try {
        text = await fetchHttps(TSK_URL);
        if (text.length < 10000) throw new Error(`Response too short (${text.length} bytes)`);
        console.log(`Fetched ${(text.length / 1024 / 1024).toFixed(1)} MB from openbible.info`);
      } catch (err) {
        console.error(`\n❌  All remote sources failed.`);
        console.error('\nDownload the file manually and save to: scripts/cross-references.txt');
        console.error('  Browser URL: https://a.openbible.info/data/cross-references.txt');
        process.exit(1);
      }
    }
  }

  const lines = text.split('\n');
  console.log(`Loaded ${lines.length} lines (format: ${isCsvFormat ? 'CSV' : 'TSV'})`);

  // Track verse stats in memory
  const verseStats = new Map<string, number>();

  let rowsInserted = 0;
  let batch: Array<Record<string, unknown>> = [];
  let skipped = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    const { error } = await supabase.from('tsk_references').insert(batch);
    if (error) {
      if (error.code === '23505') {
        console.log(`  (duplicate batch skipped)`);
      } else {
        console.warn(`Batch insert warning: ${error.message}`);
      }
    } else {
      rowsInserted += batch.length;
    }
    batch = [];
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip already-processed lines when resuming
    if (i < startLine) {
      // Still count verse stats for skipped lines so totals are correct at the end
      // Rebuild stats for skipped lines (both formats)
      if (isCsvFormat) {
        const cols = line.split(',');
        const fromBook = cols[3] ? OSIS_TO_BOOK[cols[3].trim()] : null;
        const fromCh = cols[4] ? parseInt(cols[4]) : NaN;
        const fromVs = cols[5] ? parseInt(cols[5]) : NaN;
        if (fromBook && !isNaN(fromCh) && !isNaN(fromVs)) {
          const key = `${fromBook}|${fromCh}|${fromVs}`;
          verseStats.set(key, (verseStats.get(key) ?? 0) + 1);
        }
      } else {
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const from = parseRef(parts[0]);
          if (from) {
            const key = `${from.book}|${from.chapter}|${from.verse}`;
            verseStats.set(key, (verseStats.get(key) ?? 0) + 1);
          }
        }
      }
      continue;
    }

    let from: { book: string; chapter: number; verse: number } | null = null;
    let to: { book: string; chapter: number; verse: number } | null = null;
    let votes: number | null = null;

    if (isCsvFormat) {
      // CSV columns: [3]=fromBookAbbr [4]=fromCh [5]=fromVs [8]=toBookAbbr [9]=toCh [10]=toVs [2]=votes
      const cols = line.split(',');
      if (cols.length < 11) continue;
      const fromBook = cols[3] ? OSIS_TO_BOOK[cols[3].trim()] : null;
      const toBook = cols[8] ? OSIS_TO_BOOK[cols[8].trim()] : null;
      const fromCh = parseInt(cols[4]);
      const fromVs = parseInt(cols[5]);
      const toCh = parseInt(cols[9]);
      const toVs = parseInt(cols[10]);
      votes = cols[2] ? parseInt(cols[2]) : null;
      if (fromBook && toBook && !isNaN(fromCh) && !isNaN(fromVs) && !isNaN(toCh) && !isNaN(toVs)) {
        from = { book: fromBook, chapter: fromCh, verse: fromVs };
        to = { book: toBook, chapter: toCh, verse: toVs };
      }
    } else {
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      from = parseRef(parts[0]);
      to = parseRef(parts[1]);
      votes = parts[2] ? parseInt(parts[2]) : null;
    }

    if (!from || !to) {
      skipped++;
      continue;
    }

    // Accumulate verse stats
    const key = `${from.book}|${from.chapter}|${from.verse}`;
    verseStats.set(key, (verseStats.get(key) ?? 0) + 1);

    batch.push({
      from_book: from.book,
      from_chapter: from.chapter,
      from_verse: from.verse,
      to_book: to.book,
      to_chapter: to.chapter,
      to_verse: to.verse,
      meta: votes !== null ? { votes } : null,
    });

    if (batch.length >= BATCH_SIZE) {
      await flush();
      await sleep(DELAY_MS);
    }

    if (i % CHECKPOINT_EVERY === 0) {
      await flush();
      await saveCheckpoint(i, rowsInserted);
      console.log(`  Line ${i} / ${lines.length} — ${rowsInserted} refs inserted`);
    }
  }

  await flush();
  console.log(`\nAll ${rowsInserted} references inserted (${skipped} skipped).`);

  // Seed tsk_verse_stats
  console.log(`\nSeeding tsk_verse_stats (${verseStats.size} unique verses)...`);
  const statsBatch: Array<Record<string, unknown>> = [];
  let statsRows = 0;

  for (const [key, count] of verseStats.entries()) {
    const [book, chapter, verse] = key.split('|');
    statsBatch.push({
      book,
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      reference_count: count,
    });

    if (statsBatch.length >= BATCH_SIZE) {
      const { error } = await supabase
        .from('tsk_verse_stats')
        .upsert(statsBatch, { onConflict: 'book,chapter,verse' });
      if (error) console.warn(`Stats batch warning: ${error.message}`);
      else statsRows += statsBatch.length;
      statsBatch.length = 0;
      await sleep(50);
    }
  }

  if (statsBatch.length > 0) {
    const { error } = await supabase
      .from('tsk_verse_stats')
      .upsert(statsBatch, { onConflict: 'book,chapter,verse' });
    if (error) console.warn(`Stats batch warning: ${error.message}`);
    else statsRows += statsBatch.length;
  }

  console.log(`tsk_verse_stats: ${statsRows} rows inserted.`);

  await markComplete(rowsInserted + statsRows);
  console.log(`\nTSK seed complete.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

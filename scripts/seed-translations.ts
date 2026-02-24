/**
 * seed-translations.ts
 *
 * Seeds the `chapters` table with the WEB (World English Bible) translation.
 * WEB is fully public domain — stored permanently (no expires_at).
 *
 * Source: bible-api.com (free, no API key required for public-domain texts)
 *
 * Checkpointing: progress is saved to seed_checkpoints so the script can be
 * safely interrupted and resumed from where it left off.
 *
 * Run: npm run seed:translations
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Full canonical Bible book list with chapter counts
const BOOKS: { name: string; apiName: string; chapters: number }[] = [
  { name: 'Genesis',        apiName: 'genesis',        chapters: 50 },
  { name: 'Exodus',         apiName: 'exodus',         chapters: 40 },
  { name: 'Leviticus',      apiName: 'leviticus',      chapters: 27 },
  { name: 'Numbers',        apiName: 'numbers',        chapters: 36 },
  { name: 'Deuteronomy',    apiName: 'deuteronomy',    chapters: 34 },
  { name: 'Joshua',         apiName: 'joshua',         chapters: 24 },
  { name: 'Judges',         apiName: 'judges',         chapters: 21 },
  { name: 'Ruth',           apiName: 'ruth',           chapters: 4  },
  { name: '1 Samuel',       apiName: '1+samuel',       chapters: 31 },
  { name: '2 Samuel',       apiName: '2+samuel',       chapters: 24 },
  { name: '1 Kings',        apiName: '1+kings',        chapters: 22 },
  { name: '2 Kings',        apiName: '2+kings',        chapters: 25 },
  { name: '1 Chronicles',   apiName: '1+chronicles',   chapters: 29 },
  { name: '2 Chronicles',   apiName: '2+chronicles',   chapters: 36 },
  { name: 'Ezra',           apiName: 'ezra',           chapters: 10 },
  { name: 'Nehemiah',       apiName: 'nehemiah',       chapters: 13 },
  { name: 'Esther',         apiName: 'esther',         chapters: 10 },
  { name: 'Job',            apiName: 'job',            chapters: 42 },
  { name: 'Psalms',         apiName: 'psalms',         chapters: 150 },
  { name: 'Proverbs',       apiName: 'proverbs',       chapters: 31 },
  { name: 'Ecclesiastes',   apiName: 'ecclesiastes',   chapters: 12 },
  { name: 'Song of Solomon',apiName: 'song+of+solomon',chapters: 8  },
  { name: 'Isaiah',         apiName: 'isaiah',         chapters: 66 },
  { name: 'Jeremiah',       apiName: 'jeremiah',       chapters: 52 },
  { name: 'Lamentations',   apiName: 'lamentations',   chapters: 5  },
  { name: 'Ezekiel',        apiName: 'ezekiel',        chapters: 48 },
  { name: 'Daniel',         apiName: 'daniel',         chapters: 12 },
  { name: 'Hosea',          apiName: 'hosea',          chapters: 14 },
  { name: 'Joel',           apiName: 'joel',           chapters: 3  },
  { name: 'Amos',           apiName: 'amos',           chapters: 9  },
  { name: 'Obadiah',        apiName: 'obadiah',        chapters: 1  },
  { name: 'Jonah',          apiName: 'jonah',          chapters: 4  },
  { name: 'Micah',          apiName: 'micah',          chapters: 7  },
  { name: 'Nahum',          apiName: 'nahum',          chapters: 3  },
  { name: 'Habakkuk',       apiName: 'habakkuk',       chapters: 3  },
  { name: 'Zephaniah',      apiName: 'zephaniah',      chapters: 3  },
  { name: 'Haggai',         apiName: 'haggai',         chapters: 2  },
  { name: 'Zechariah',      apiName: 'zechariah',      chapters: 14 },
  { name: 'Malachi',        apiName: 'malachi',        chapters: 4  },
  { name: 'Matthew',        apiName: 'matthew',        chapters: 28 },
  { name: 'Mark',           apiName: 'mark',           chapters: 16 },
  { name: 'Luke',           apiName: 'luke',           chapters: 24 },
  { name: 'John',           apiName: 'john',           chapters: 21 },
  { name: 'Acts',           apiName: 'acts',           chapters: 28 },
  { name: 'Romans',         apiName: 'romans',         chapters: 16 },
  { name: '1 Corinthians',  apiName: '1+corinthians',  chapters: 16 },
  { name: '2 Corinthians',  apiName: '2+corinthians',  chapters: 13 },
  { name: 'Galatians',      apiName: 'galatians',      chapters: 6  },
  { name: 'Ephesians',      apiName: 'ephesians',      chapters: 6  },
  { name: 'Philippians',    apiName: 'philippians',    chapters: 4  },
  { name: 'Colossians',     apiName: 'colossians',     chapters: 4  },
  { name: '1 Thessalonians',apiName: '1+thessalonians',chapters: 5  },
  { name: '2 Thessalonians',apiName: '2+thessalonians',chapters: 3  },
  { name: '1 Timothy',      apiName: '1+timothy',      chapters: 6  },
  { name: '2 Timothy',      apiName: '2+timothy',      chapters: 4  },
  { name: 'Titus',          apiName: 'titus',          chapters: 3  },
  { name: 'Philemon',       apiName: 'philemon',       chapters: 1  },
  { name: 'Hebrews',        apiName: 'hebrews',        chapters: 13 },
  { name: 'James',          apiName: 'james',          chapters: 5  },
  { name: '1 Peter',        apiName: '1+peter',        chapters: 5  },
  { name: '2 Peter',        apiName: '2+peter',        chapters: 3  },
  { name: '1 John',         apiName: '1+john',         chapters: 5  },
  { name: '2 John',         apiName: '2+john',         chapters: 1  },
  { name: '3 John',         apiName: '3+john',         chapters: 1  },
  { name: 'Jude',           apiName: 'jude',           chapters: 1  },
  { name: 'Revelation',     apiName: 'revelation',     chapters: 22 },
];

const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
const DELAY_MS = 700; // be polite to the free API

const TRANSLATIONS = [
  { name: 'WEB', apiKey: 'web', seedName: 'web_chapters' },
  { name: 'KJV', apiKey: 'kjv', seedName: 'kjv_chapters' },
  { name: 'ASV', apiKey: 'asv', seedName: 'asv_chapters' },
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type CheckpointResult = { last_book: string; last_chapter: number } | null | 'complete';

async function getCheckpoint(seedName: string): Promise<CheckpointResult> {
  const { data } = await supabase
    .from('seed_checkpoints')
    .select('last_checkpoint, status')
    .eq('seed_name', seedName)
    .single();

  if (!data) return null;  // no row — start fresh
  if (data.status === 'complete') return 'complete';
  return (data.last_checkpoint as { last_book: string; last_chapter: number }) ?? null;
}

async function saveCheckpoint(seedName: string, book: string, chapter: number, rowsInserted: number) {
  await supabase
    .from('seed_checkpoints')
    .upsert({
      seed_name: seedName,
      last_checkpoint: { last_book: book, last_chapter: chapter },
      rows_inserted: rowsInserted,
      status: 'in_progress',
      last_updated_at: new Date().toISOString(),
    }, { onConflict: 'seed_name' });
}

async function markComplete(seedName: string, rowsInserted: number) {
  await supabase
    .from('seed_checkpoints')
    .upsert({
      seed_name: seedName,
      last_checkpoint: { last_book: 'Revelation', last_chapter: 22 },
      rows_inserted: rowsInserted,
      status: 'complete',
      completed_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    }, { onConflict: 'seed_name' });
}

async function fetchChapter(apiName: string, chapter: number, translationKey: string): Promise<{ verse: number; text: string }[]> {
  const url = `https://bible-api.com/${apiName}+${chapter}?translation=${translationKey}`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        // Rate limited — back off for 60s on first hit, 120s after that
        const wait = attempt <= 2 ? 60_000 : 120_000;
        console.log(`    Rate limited (429). Waiting ${wait / 1000}s before retry ${attempt}/5...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        verses: { verse: number; text: string }[];
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      return data.verses.map(v => ({ verse: v.verse, text: v.text.trim() }));
    } catch (err) {
      if (attempt === 5) throw err;
      console.log(`    Retry ${attempt}/5...`);
      await sleep(2000 * attempt);
    }
  }
  return [];
}

async function seedTranslation(translationName: string, apiKey: string, seedName: string) {
  console.log(`\n=== ${translationName} Translation ===`);

  const checkpoint = await getCheckpoint(seedName);
  if (checkpoint === 'complete') {
    console.log(`  Already complete — skipping.`);
    return;
  }

  const resumeBook = checkpoint?.last_book ?? null;
  const resumeChapter = checkpoint?.last_chapter ?? 0;
  let skipping = resumeBook !== null;

  if (skipping) {
    console.log(`  Resuming from: ${resumeBook} chapter ${resumeChapter + 1}`);
  } else {
    console.log(`  Starting from Genesis 1`);
  }

  let rowsInserted = 0;
  let chaptersProcessed = 0;

  for (const book of BOOKS) {
    if (skipping && book.name !== resumeBook) {
      chaptersProcessed += book.chapters;
      continue;
    }

    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      if (skipping && chapter <= resumeChapter) {
        chaptersProcessed++;
        continue;
      }
      skipping = false;

      chaptersProcessed++;
      const pct = ((chaptersProcessed / TOTAL_CHAPTERS) * 100).toFixed(1);
      process.stdout.write(`  [${pct}%] ${book.name} ${chapter}/${book.chapters}... `);

      try {
        const verses = await fetchChapter(book.apiName, chapter, apiKey);

        if (verses.length === 0) {
          console.log('SKIP (no verses)');
          continue;
        }

        const { error } = await supabase
          .from('chapters')
          .upsert({
            book: book.name,
            chapter,
            translation: translationName,
            text_json: verses,
            fetched_at: new Date().toISOString(),
            expires_at: null,
          }, { onConflict: 'book,chapter,translation' });

        if (error) {
          console.log(`ERROR: ${error.message}`);
        } else {
          rowsInserted++;
          console.log(`OK (${verses.length} verses)`);
        }

        if (rowsInserted % 10 === 0) {
          await saveCheckpoint(seedName, book.name, chapter, rowsInserted);
        }

        await sleep(DELAY_MS);

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.log(`FAILED: ${message}`);
        await saveCheckpoint(seedName, book.name, chapter - 1, rowsInserted);
        console.log('\nSeed interrupted. Run again to resume from this point.');
        process.exit(1);
      }
    }
  }

  await markComplete(seedName, rowsInserted);
  console.log(`\n  ${translationName} complete: ${rowsInserted} chapters inserted.`);
}

async function main() {
  console.log('=== BibleSaaS — Bible Translation Seed ===');
  console.log(`Total chapters per translation: ${TOTAL_CHAPTERS}`);

  for (const t of TRANSLATIONS) {
    await seedTranslation(t.name, t.apiKey, t.seedName);
  }

  console.log('\n=== All translations complete. Run: npm run dev ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

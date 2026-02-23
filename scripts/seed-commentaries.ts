/**
 * seed-commentaries.ts
 *
 * Seeds commentary_entries with Matthew Henry's Concise Commentary (public domain).
 * Source: CCEL EPUB — https://ccel.org/ccel/h/henry/mhcc/cache/mhcc.epub
 *
 * The EPUB is a ZIP of XHTML files:
 *   mhcc.{bookRoman}.html            → Book page  (<h1>Genesis</h1>)
 *   mhcc.{bookRoman}.{chapRoman}.html → Chapter    (<div class="Commentary" id="Bible_Gen.1.1-Gen.1.2">)
 *
 * One DB row per verse-section div.
 *
 * Run: npm run seed:commentaries
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED_NAME = 'commentaries_mhcc';
const SOURCE = 'Matthew Henry Concise Commentary';
const BATCH_SIZE = 100;
const DELAY_MS = 100;

const EPUB_URL = 'https://ccel.org/ccel/h/henry/mhcc/cache/mhcc.epub';
const EPUB_PATH = path.join(__dirname, 'mhcc.epub');
const EPUB_ZIP  = path.join(__dirname, 'mhcc.zip');
const EXTRACT_DIR = path.join(__dirname, 'mhcc_extracted', 'OEBPS');

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Checkpoint helpers ────────────────────────────────────────────────────────

async function getCheckpoint(): Promise<number | null> {
  const { data } = await supabase
    .from('seed_checkpoints')
    .select('last_checkpoint, status')
    .eq('seed_name', SEED_NAME)
    .maybeSingle();
  if (!data) return null;
  if (data.status === 'complete') return -1;
  return (data.last_checkpoint as { file_index?: number })?.file_index ?? 0;
}

async function saveCheckpoint(fileIndex: number, rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    { seed_name: SEED_NAME, last_checkpoint: { file_index: fileIndex },
      rows_inserted: rowsInserted, status: 'in_progress',
      last_updated_at: new Date().toISOString() },
    { onConflict: 'seed_name' }
  );
}

async function markComplete(rowsInserted: number) {
  await supabase.from('seed_checkpoints').upsert(
    { seed_name: SEED_NAME, last_checkpoint: { file_index: -1 },
      rows_inserted: rowsInserted, status: 'complete',
      last_updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString() },
    { onConflict: 'seed_name' }
  );
}

// ── EPUB download & extraction ────────────────────────────────────────────────

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        return downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function ensureExtracted(): Promise<void> {
  if (fs.existsSync(EXTRACT_DIR) && fs.readdirSync(EXTRACT_DIR).length > 100) {
    console.log(`Using existing EPUB extraction at ${EXTRACT_DIR}`);
    return;
  }
  if (!fs.existsSync(EPUB_PATH)) {
    console.log('Downloading MHCC EPUB from CCEL (~3.4 MB)...');
    await downloadFile(EPUB_URL, EPUB_PATH);
    console.log(`Downloaded ${(fs.statSync(EPUB_PATH).size / 1024 / 1024).toFixed(1)} MB`);
  }
  console.log('Extracting EPUB...');
  const extractRoot = path.join(__dirname, 'mhcc_extracted');
  const psCmd = [
    `Copy-Item -Path '${EPUB_PATH.replace(/'/g, "''")}' -Destination '${EPUB_ZIP.replace(/'/g, "''")}' -Force`,
    `Expand-Archive -Path '${EPUB_ZIP.replace(/'/g, "''")}' -DestinationPath '${extractRoot.replace(/'/g, "''")}' -Force`,
    `Remove-Item '${EPUB_ZIP.replace(/'/g, "''")}' -Force`,
  ].join('; ');
  execSync(`powershell.exe -Command "${psCmd}"`, { stdio: 'inherit' });
  console.log('Extracted.');
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x2019;/gi, '\u2019').replace(/&#x2014;/gi, '\u2014')
    .replace(/&#x2013;/gi, '\u2013').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function parseVerseRange(divId: string) {
  const ref = divId.replace(/^Bible_/, '');
  const m = ref.match(/^\w+\.\d+\.(\d+)(?:-\w+\.\d+\.(\d+))?$/);
  if (!m) return { verse_start: null as number | null, verse_end: null as number | null };
  return { verse_start: parseInt(m[1]), verse_end: m[2] ? parseInt(m[2]) : parseInt(m[1]) };
}

interface CommentaryRow {
  source: string; book: string; chapter: number;
  verse_start: number | null; verse_end: number | null;
  section_title: string | null; body: string;
  is_vault_featured: boolean; meta: Record<string, unknown> | null;
}

function parseChapterFile(html: string, bookName: string): CommentaryRow[] {
  const rows: CommentaryRow[] = [];
  const chapterMatch = html.match(/<h2[^>]*>Chapter\s+(\d+)<\/h2>/i);
  if (!chapterMatch) return rows;
  const chapter = parseInt(chapterMatch[1]);

  const divPattern = /<div[^>]+class="Commentary"[^>]+id="([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]+class="Commentary"|<\/body>)/g;
  let match: RegExpExecArray | null;
  while ((match = divPattern.exec(html)) !== null) {
    const divId = match[1];
    const divContent = match[2];
    const h3Match = divContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const section_title = h3Match ? stripTags(h3Match[1]) : null;
    const pTexts: string[] = [];
    const pPat = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = pPat.exec(divContent)) !== null) {
      const t = stripTags(pm[1]);
      if (t.length > 10) pTexts.push(t);
    }
    const body = pTexts.join('\n\n');
    if (!body) continue;
    const { verse_start, verse_end } = parseVerseRange(divId);
    rows.push({ source: SOURCE, book: bookName, chapter, verse_start, verse_end,
      section_title, body, is_vault_featured: true, meta: { ccel_id: divId } });
  }
  return rows;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('Starting Matthew Henry Concise Commentary seed...');

  const checkpoint = await getCheckpoint();
  if (checkpoint === -1) {
    console.log('Already complete. Delete seed_checkpoints row to re-seed.');
    return;
  }
  const startFileIndex = checkpoint ?? 0;

  await ensureExtracted();

  // Build book name map from single-Roman-numeral files
  const isRoman = (s: string) => /^[ivxlcdm]+$/i.test(s);
  const allFiles = fs.readdirSync(EXTRACT_DIR);
  const bookNameMap: Record<string, string> = {};

  for (const f of allFiles) {
    if (!f.startsWith('mhcc.') || !f.endsWith('.html')) continue;
    const base = f.slice('mhcc.'.length, -'.html'.length);
    const parts = base.split('.');
    if (parts.length === 1 && isRoman(parts[0])) {
      const html = fs.readFileSync(path.join(EXTRACT_DIR, f), 'utf-8');
      const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (m) bookNameMap[parts[0]] = m[1].replace(/&amp;/g, '&').trim();
    }
  }
  console.log(`  ${Object.keys(bookNameMap).length} books mapped`);

  // Collect and sort chapter files
  const chapterFiles = allFiles
    .filter(f => {
      if (!f.startsWith('mhcc.') || !f.endsWith('.html')) return false;
      const base = f.slice('mhcc.'.length, -'.html'.length);
      const parts = base.split('.');
      return parts.length === 2 && isRoman(parts[0]) && isRoman(parts[1]);
    })
    .sort();

  console.log(`  ${chapterFiles.length} chapter files`);

  // Check existing MH rows to avoid re-seeding
  const { count: existingRows } = await supabase
    .from('commentary_entries').select('*', { count: 'exact', head: true })
    .eq('source', SOURCE);
  if ((existingRows ?? 0) > 1000) {
    console.log(`  Already seeded (${existingRows} rows). Marking complete.`);
    await markComplete(existingRows ?? 0);
    return;
  }

  if (startFileIndex > 0) console.log(`  Resuming from file ${startFileIndex}`);

  let totalInserted = 0;
  let batch: CommentaryRow[] = [];

  const flush = async () => {
    if (!batch.length) return;
    const { error } = await supabase.from('commentary_entries').insert(batch);
    if (error && error.code !== '23505') throw new Error(`Insert error: ${error.message}`);
    if (!error) totalInserted += batch.length;
    batch = [];
    await sleep(DELAY_MS);
  };

  for (let i = startFileIndex; i < chapterFiles.length; i++) {
    const f = chapterFiles[i];
    const base = f.slice('mhcc.'.length, -'.html'.length);
    const bookRoman = base.split('.')[0];
    const bookName = bookNameMap[bookRoman];
    if (!bookName) continue;

    const html = fs.readFileSync(path.join(EXTRACT_DIR, f), 'utf-8');
    batch.push(...parseChapterFile(html, bookName));

    if (batch.length >= BATCH_SIZE) await flush();

    if (i % 100 === 0 && i > 0) {
      await saveCheckpoint(i, totalInserted);
      console.log(`  [${i}/${chapterFiles.length}] ${bookName} — ${totalInserted} rows`);
    }
  }

  await flush();
  await markComplete(totalInserted);
  console.log(`\nMHCC seed complete. ${totalInserted} entries inserted.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

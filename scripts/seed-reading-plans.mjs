/**
 * Seed reading plans into Supabase.
 * Run: node scripts/seed-reading-plans.mjs
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dir, "../.env.local") });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Bible book list (USFM code, chapter count) ──────────────────────────────
const OT_BOOKS = [
  ["GEN", 50], ["EXO", 40], ["LEV", 27], ["NUM", 36], ["DEU", 34],
  ["JOS", 24], ["JDG", 21], ["RUT", 4],  ["1SA", 31], ["2SA", 24],
  ["1KI", 22], ["2KI", 25], ["1CH", 29], ["2CH", 36], ["EZR", 10],
  ["NEH", 13], ["EST", 10], ["JOB", 42], ["PSA", 150], ["PRO", 31],
  ["ECC", 12], ["SNG", 8],  ["ISA", 66], ["JER", 52], ["LAM", 5],
  ["EZK", 48], ["DAN", 12], ["HOS", 14], ["JOL", 3],  ["AMO", 9],
  ["OBA", 1],  ["JON", 4],  ["MIC", 7],  ["NAM", 3],  ["HAB", 3],
  ["ZEP", 3],  ["HAG", 2],  ["ZEC", 14], ["MAL", 4],
];
const NT_BOOKS = [
  ["MAT", 28], ["MRK", 16], ["LUK", 24], ["JHN", 21], ["ACT", 28],
  ["ROM", 16], ["1CO", 16], ["2CO", 13], ["GAL", 6],  ["EPH", 6],
  ["PHP", 4],  ["COL", 4],  ["1TH", 5],  ["2TH", 3],  ["1TI", 6],
  ["2TI", 4],  ["TIT", 3],  ["PHM", 1],  ["HEB", 13], ["JAS", 5],
  ["1PE", 5],  ["2PE", 3],  ["1JO", 5],  ["2JO", 1],  ["3JO", 1],
  ["JUD", 1],  ["REV", 22],
];
const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS];

/** Expand book list into flat [{book, chapter}] array */
function flatChapters(books) {
  const out = [];
  for (const [book, count] of books) {
    for (let ch = 1; ch <= count; ch++) out.push({ book, chapter: ch });
  }
  return out;
}

/** Distribute chapters into N days, as evenly as possible */
function distributeIntoDays(chapters, numDays) {
  const days = [];
  const perDay = chapters.length / numDays;
  let idx = 0;
  for (let day = 1; day <= numDays; day++) {
    const start = Math.round((day - 1) * perDay);
    const end = Math.round(day * perDay);
    const dayChaps = chapters.slice(start, end);
    days.push({ day, chapters: dayChaps });
    idx = end;
  }
  return days;
}

// ── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Bible in a Year",
    type: "sequential",
    description: "Read through the entire Bible in 365 days — Old Testament first, then the New Testament.",
    is_default: true,
    is_system: true,
    chapters: distributeIntoDays(flatChapters(ALL_BOOKS), 365),
  },
  {
    name: "New Testament in 90 Days",
    type: "sequential",
    description: "Read the complete New Testament — from Matthew to Revelation — in just 90 days.",
    is_default: false,
    is_system: true,
    chapters: distributeIntoDays(flatChapters(NT_BOOKS), 90),
  },
  {
    name: "Gospel of John in 21 Days",
    type: "single_book",
    description: "One chapter of John per day for 21 days. Perfect for new readers or a focused devotional.",
    is_default: false,
    is_system: true,
    chapters: flatChapters([["JHN", 21]]).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
  {
    name: "Psalms in 30 Days",
    type: "topical",
    description: "Five psalms each day for 30 days — covering all 150 psalms for worship and reflection.",
    is_default: false,
    is_system: true,
    chapters: distributeIntoDays(flatChapters([["PSA", 150]]), 30),
  },
  {
    name: "Sermon on the Mount to Revelation",
    type: "sequential",
    description: "The complete New Testament at a relaxed pace — 2 chapters a day over 4 months.",
    is_default: false,
    is_system: true,
    chapters: distributeIntoDays(flatChapters(NT_BOOKS), 130),
  },
];

async function insertBatch(table, rows, batchSize = 200) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await sb.from(table).insert(batch);
    if (error) throw new Error(`[${table}] batch ${i}: ${error.message}`);
    inserted += batch.length;
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
  }
  console.log();
}

async function main() {
  console.log("Seeding reading plans…\n");

  // Clear existing system plans + their chapters
  const { data: existing } = await sb
    .from("reading_plans")
    .select("id")
    .eq("is_system", true);
  if (existing?.length) {
    const ids = existing.map((r) => r.id);
    await sb.from("plan_chapters").delete().in("plan_id", ids);
    await sb.from("reading_plans").delete().in("id", ids);
    console.log(`Cleared ${ids.length} existing system plan(s).`);
  }

  for (const plan of PLANS) {
    const { chapters, ...planMeta } = plan;
    const totalDays = chapters.length;
    const totalChapters = chapters.reduce((s, d) => s + d.chapters.length, 0);

    console.log(`\n→ "${plan.name}" — ${totalDays} days, ${totalChapters} chapters`);

    // Insert the plan row
    const { data: planRow, error: planErr } = await sb
      .from("reading_plans")
      .insert({ ...planMeta, meta: {} })
      .select("id")
      .single();
    if (planErr) throw new Error(`Plan insert: ${planErr.message}`);
    const planId = planRow.id;

    // Build plan_chapters rows
    const chapterRows = [];
    for (const { day, chapters: dayChaps } of chapters) {
      for (const { book, chapter } of dayChaps) {
        chapterRows.push({
          plan_id: planId,
          day_number: day,
          book,
          chapter,
          section_label: null,
        });
      }
    }

    await insertBatch("plan_chapters", chapterRows);
    console.log(`  ✓ Plan ID: ${planId}`);
  }

  console.log("\n✅ Reading plans seeded successfully.");
}

main().catch((e) => { console.error(e); process.exit(1); });

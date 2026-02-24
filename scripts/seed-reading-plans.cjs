/* eslint-disable */
/**
 * Seed reading plans into Supabase.
 * Run: node scripts/seed-reading-plans.cjs
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });

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

// ── Plan definitions (1 chapter per day — unique constraint on plan_id+day_number) ──
const PLANS = [
  {
    name: "Bible Cover to Cover",
    type: "sequential",
    description: "Every chapter of the Bible in order — Genesis to Revelation. One chapter a day for 3 years and 3 months.",
    is_default: true,
    is_system: true,
    // All 1,189 chapters, 1 per day
    days: flatChapters(ALL_BOOKS).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
  {
    name: "New Testament in a Year",
    type: "sequential",
    description: "Read the entire New Testament — Matthew to Revelation — at one chapter a day. Done in 260 days.",
    is_default: false,
    is_system: true,
    days: flatChapters(NT_BOOKS).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
  {
    name: "Gospel of John",
    type: "single_book",
    description: "The Gospel of John at one chapter a day — 21 days. Ideal for a first-time reader or focused study.",
    is_default: false,
    is_system: true,
    days: flatChapters([["JHN", 21]]).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
  {
    name: "Psalms",
    type: "topical",
    description: "All 150 psalms at one a day — five months of morning devotion and evening reflection.",
    is_default: false,
    is_system: true,
    days: flatChapters([["PSA", 150]]).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
  {
    name: "Proverbs in a Month",
    type: "topical",
    description: "One chapter of Proverbs each day for 31 days — wisdom literature for daily life.",
    is_default: false,
    is_system: true,
    days: flatChapters([["PRO", 31]]).map((c, i) => ({ day: i + 1, chapters: [c] })),
  },
];

async function insertBatch(table, rows, batchSize = 300) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await sb.from(table).insert(batch);
    if (error) throw new Error(`[${table}] batch ${i}: ${error.message}`);
    inserted += batch.length;
    process.stdout.write(`\r  inserted ${inserted}/${rows.length} rows`);
  }
  console.log();
}

async function main() {
  console.log("Seeding reading plans…\n");

  // Clear existing system plans
  const { data: existing } = await sb.from("reading_plans").select("id").eq("is_system", true);
  if (existing && existing.length > 0) {
    const ids = existing.map((r) => r.id);
    await sb.from("plan_chapters").delete().in("plan_id", ids);
    await sb.from("reading_plans").delete().in("id", ids);
    console.log(`Cleared ${ids.length} existing system plan(s).`);
  }

  for (const plan of PLANS) {
    const { days, ...planMeta } = plan;
    const totalChapters = days.reduce((s, d) => s + d.chapters.length, 0);
    console.log(`\n→ "${plan.name}" — ${days.length} days, ${totalChapters} chapters`);

    const { data: planRow, error: planErr } = await sb
      .from("reading_plans")
      .insert({ ...planMeta, meta: { total_days: days.length } })
      .select("id")
      .single();
    if (planErr) throw new Error(`Plan insert failed: ${planErr.message}`);
    const planId = planRow.id;

    const chapterRows = [];
    for (const { day, chapters } of days) {
      for (const { book, chapter } of chapters) {
        chapterRows.push({ plan_id: planId, day_number: day, book, chapter, section_label: null });
      }
    }

    await insertBatch("plan_chapters", chapterRows);
    console.log(`  ✓ Plan ID: ${planId}`);
  }

  console.log("\n✅ Reading plans seeded successfully.");
}

main().catch((e) => { console.error(e.message); process.exit(1); });

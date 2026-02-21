#!/usr/bin/env ts-node
/**
 * extract-migrations.ts
 *
 * Reads each sql/*.md file, extracts all SQL code blocks,
 * and writes them as executable .sql files in supabase/migrations/.
 *
 * The .md files are the source of truth.
 * The .sql files are generated artifacts — do not edit them directly.
 *
 * Usage:
 *   npx ts-node scripts/extract-migrations.ts
 *
 * Options:
 *   --dry-run    Print SQL to stdout instead of writing files
 *   --file=01    Only regenerate a specific file number
 */

import fs from 'fs';
import path from 'path';

const SQL_DIR = path.join(__dirname, '..', 'sql');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Maps file number → migration timestamp + description
// Timestamps are intentionally ordered but spaced apart for clarity.
const FILE_MAP: Record<string, { timestamp: string; description: string }> = {
  '01': { timestamp: '20260101000001', description: 'core_auth_profiles' },
  '02': { timestamp: '20260101000002', description: 'reading_plans' },
  '03': { timestamp: '20260101000003', description: 'bible_content' },
  '04': { timestamp: '20260101000004', description: 'journal' },
  '05': { timestamp: '20260101000005', description: 'highlights_bookmarks' },
  '06': { timestamp: '20260101000006', description: 'progress_gamification' },
  '07': { timestamp: '20260101000007', description: 'source_data' },
  '08': { timestamp: '20260101000008', description: 'word_study' },
  '09': { timestamp: '20260101000009', description: 'geography_archaeology' },
  '10': { timestamp: '20260101000010', description: 'notifications_settings' },
  '11': { timestamp: '20260101000011', description: 'extensibility' },
  '12': { timestamp: '20260101000012', description: 'community' },
  '13': { timestamp: '20260101000013', description: 'operations' },
};

const isDryRun = process.argv.includes('--dry-run');
const fileFilter = process.argv.find((a) => a.startsWith('--file='))?.split('=')[1];

function extractSqlFromMarkdown(markdown: string): string {
  // Match all ```sql ... ``` code blocks, capturing content
  const SQL_BLOCK_RE = /```sql\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = SQL_BLOCK_RE.exec(markdown)) !== null) {
    blocks.push(match[1].trimEnd());
  }

  return blocks.join('\n\n');
}

function processFile(fileNum: string): void {
  const mapping = FILE_MAP[fileNum];
  if (!mapping) {
    console.error(`Unknown file number: ${fileNum}`);
    return;
  }

  // Find the source .md file
  const sourceFiles = fs.readdirSync(SQL_DIR).filter((f) => f.startsWith(fileNum + '-'));
  if (sourceFiles.length === 0) {
    console.warn(`No source file found for number ${fileNum} in ${SQL_DIR}`);
    return;
  }
  const sourcePath = path.join(SQL_DIR, sourceFiles[0]);
  const markdown = fs.readFileSync(sourcePath, 'utf-8');

  // Extract SQL
  const sql = extractSqlFromMarkdown(markdown);
  if (!sql.trim()) {
    console.warn(`No SQL blocks found in ${sourceFiles[0]}`);
    return;
  }

  // Build output
  const outputFileName = `${mapping.timestamp}_${mapping.description}.sql`;
  const header = [
    `-- Migration: ${outputFileName}`,
    `-- Source:    sql/${sourceFiles[0]}`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- WARNING:   This file is auto-generated. Edit the source .md file, not this file.`,
    '',
    '',
  ].join('\n');

  const output = header + sql + '\n';

  if (isDryRun) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`FILE: ${outputFileName}`);
    console.log('='.repeat(60));
    console.log(output);
  } else {
    const outputPath = path.join(MIGRATIONS_DIR, outputFileName);
    fs.writeFileSync(outputPath, output, 'utf-8');
    console.log(`✓ ${outputFileName}`);
  }
}

// Main
if (!isDryRun) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
}

const filesToProcess = fileFilter ? [fileFilter] : Object.keys(FILE_MAP);

for (const fileNum of filesToProcess) {
  processFile(fileNum);
}

if (!isDryRun) {
  console.log(`\nDone. Migration files written to: ${MIGRATIONS_DIR}`);
  console.log('Run: supabase db push');
}

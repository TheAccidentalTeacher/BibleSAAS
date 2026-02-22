/**
 * build-data-export.ts
 *
 * Utilities for generating a user's data as JSON or CSV.
 */

export interface DataExportPayload {
  profile: Record<string, unknown>;
  readingProgress: Record<string, unknown>[];
  highlights: Record<string, unknown>[];
  journalEntries: Record<string, unknown>[];
  bookmarks: Record<string, unknown>[];
  memoryVerses: Record<string, unknown>[];
  chatSessions: Record<string, unknown>[];
  exportedAt: string;
}

export function buildDataJson(data: DataExportPayload): string {
  return JSON.stringify(data, null, 2);
}

export function buildJournalCsv(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return "book,chapter,question_key,answer,created_at\n";

  const header = "book,chapter,question_key,answer,created_at";
  const rows = entries.map((e) => {
    const book = csvEscape(String(e.book ?? ""));
    const chapter = String(e.chapter ?? "");
    const qKey = csvEscape(String(e.question_key ?? "general"));
    const note = csvEscape(String(e.note ?? ""));
    const date = String(e.created_at ?? "");
    return `${book},${chapter},${qKey},${note},${date}`;
  });
  return [header, ...rows].join("\r\n");
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

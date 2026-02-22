/**
 * src/lib/offline/db.ts — Dexie.js offline database schema
 *
 * Two tables:
 *   offlineChapters — caches WEB/KJV chapter text for offline reading
 *   pendingSync     — queue of mutations made while offline
 *
 * Auto-populated: when user reads a WEB or KJV chapter online, the chapter
 * JSON is stored here so it's available offline.
 */

import Dexie, { type Table } from "dexie";

export interface OfflineChapterRecord {
  id?: number;          // auto-increment
  book: string;         // e.g. "GEN"
  chapter: number;      // e.g. 1
  translation: string;  // "WEB" | "KJV" (public domain only)
  textJson: string;     // JSON.stringify of verse array [{verse, text}]
  cachedAt: number;     // Date.now() timestamp
}

export interface PendingSyncRecord {
  id?: number;          // auto-increment
  tableName: string;    // e.g. "highlights", "journal_entries", "bookmarks"
  operation: "insert" | "update" | "delete";
  payload: string;      // JSON.stringify of the mutation payload
  userId: string;
  createdAt: number;    // Date.now()
}

class OfflineDatabase extends Dexie {
  offlineChapters!: Table<OfflineChapterRecord, number>;
  pendingSync!: Table<PendingSyncRecord, number>;

  constructor() {
    super("BibleStudyOffline");

    this.version(1).stores({
      // Compound index for fast lookups by book+chapter+translation
      offlineChapters: "++id, [book+chapter+translation], cachedAt",
      // Index by creation order (process in FIFO order)
      pendingSync: "++id, tableName, createdAt",
    });
  }
}

// Singleton — safe to call in any client module
let _db: OfflineDatabase | null = null;

export function getOfflineDb(): OfflineDatabase {
  if (typeof window === "undefined") {
    throw new Error("OfflineDatabase is client-only (IndexedDB not available on server)");
  }
  if (!_db) {
    _db = new OfflineDatabase();
  }
  return _db;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Save a chapter to offline cache (only WEB/KJV) */
export async function cacheChapter(
  book: string,
  chapter: number,
  translation: string,
  verses: Array<{ verse: number; text: string }>
): Promise<void> {
  const ALLOWED = ["WEB", "KJV"];
  if (!ALLOWED.includes(translation.toUpperCase())) return;

  const db = getOfflineDb();
  // Remove any existing record first
  await db.offlineChapters
    .where("[book+chapter+translation]")
    .equals([book, chapter, translation.toUpperCase()])
    .delete();

  await db.offlineChapters.add({
    book,
    chapter,
    translation: translation.toUpperCase(),
    textJson: JSON.stringify(verses),
    cachedAt: Date.now(),
  });
}

/** Retrieve a cached chapter (returns null if not found) */
export async function getCachedChapter(
  book: string,
  chapter: number,
  translation: string
): Promise<Array<{ verse: number; text: string }> | null> {
  const db = getOfflineDb();
  const record = await db.offlineChapters
    .where("[book+chapter+translation]")
    .equals([book, chapter, translation.toUpperCase()])
    .first();

  if (!record) return null;
  return JSON.parse(record.textJson) as Array<{ verse: number; text: string }>;
}

/** Queue a mutation for background sync */
export async function queueSync(
  tableName: string,
  operation: PendingSyncRecord["operation"],
  payload: unknown,
  userId: string
): Promise<void> {
  const db = getOfflineDb();
  await db.pendingSync.add({
    tableName,
    operation,
    payload: JSON.stringify(payload),
    userId,
    createdAt: Date.now(),
  });
}

/** Get all pending sync records (oldest first) */
export async function getPendingSyncRecords(): Promise<PendingSyncRecord[]> {
  const db = getOfflineDb();
  return db.pendingSync.orderBy("createdAt").toArray();
}

/** Delete a processed sync record */
export async function deleteSyncRecord(id: number): Promise<void> {
  const db = getOfflineDb();
  await db.pendingSync.delete(id);
}

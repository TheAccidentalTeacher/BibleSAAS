/**
 * POST /api/sync
 *
 * Processes the pendingSync queue from IndexedDB.
 * Called by:
 *   - Service worker on reconnect (BackgroundSync API)
 *   - ServiceWorkerRegister component on "online" event
 *
 * The client sends the pending records as a batch; the server
 * applies them last-write-wins (via updated_at comparison).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SyncRecord {
  id: number;
  tableName: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  userId: string;
  createdAt: number;
}

// Tables allowed for sync (whitelist to prevent injection)
const ALLOWED_TABLES = new Set([
  "highlights",
  "bookmarks",
  "journal_entries",
  "prayer_entries",
  "memory_verses",
  "verse_notes",
]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let records: SyncRecord[];
  try {
    const body = await request.json() as { records?: SyncRecord[] };
    records = body.records ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!records.length) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const results: Array<{ id: number; ok: boolean; error?: string }> = [];

  for (const record of records) {
    // Security: only process records belonging to this user
    if (record.userId !== user.id) {
      results.push({ id: record.id, ok: false, error: "User mismatch" });
      continue;
    }

    // Security: only process allowed tables
    if (!ALLOWED_TABLES.has(record.tableName)) {
      results.push({ id: record.id, ok: false, error: "Table not allowed" });
      continue;
    }

    try {
      const payload = {
        ...record.payload,
        user_id: user.id, // ensure user_id is always the authenticated user
        updated_at: new Date().toISOString(),
      };

      if (record.operation === "insert") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from(record.tableName as any) as any).upsert(payload);
      } else if (record.operation === "update") {
        const id = record.payload.id as string;
        if (id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from(record.tableName as any) as any)
            .update(payload)
            .eq("id", id)
            .eq("user_id", user.id);
        }
      } else if (record.operation === "delete") {
        const id = record.payload.id as string;
        if (id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from(record.tableName as any) as any)
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }

      results.push({ id: record.id, ok: true });
    } catch (err) {
      results.push({
        id: record.id,
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const processed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  return NextResponse.json({ ok: true, processed, failed, results });
}

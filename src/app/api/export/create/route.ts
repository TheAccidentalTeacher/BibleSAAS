/**
 * POST /api/export/create
 *
 * Creates an export job and immediately processes it. For HTML/data exports
 * this is fast enough to run synchronously within the Vercel 60-second limit.
 * Once done it emails the user a signed download URL.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import PdfReadyEmail from "@/lib/emails/pdf-ready";
import {
  buildYourBibleHtml,
  type StudiedChapter,
  type HighlightRow,
} from "@/lib/export/build-your-bible-html";
import { buildDataJson, buildJournalCsv } from "@/lib/export/build-data-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

type ExportType = "your_bible_pdf" | "data_json" | "data_csv";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { jobType?: ExportType };
  const jobType: ExportType = body.jobType ?? "your_bible_pdf";

  const adminClient = createAdminClient();

  // Create export_jobs row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobRow, error: jobInsertError } = await (adminClient as any)
    .from("export_jobs")
    .insert({
      user_id: user.id,
      job_type: jobType,
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (jobInsertError || !jobRow) {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  const jobId = jobRow.id as string;

  try {
    // ── Fetch user data ──────────────────────────────────────────────────────
    const [
      { data: profile },
      { data: highlights },
      { data: journal },
      { data: progress },
      { data: bookmarks },
      { data: memoryVerses },
      { data: chatSessions },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, subscription_tier, active_companion_id")
        .eq("id", user.id)
        .single(),
      supabase
        .from("verse_highlights")
        .select("book, chapter, verse, color_hex, created_at")
        .eq("user_id", user.id)
        .order("book")
        .order("chapter"),
      supabase
        .from("journal_entries")
        .select("book, chapter, question_key, note, created_at")
        .eq("user_id", user.id)
        .order("created_at"),
      supabase
        .from("reading_progress")
        .select("book_code, chapter_number, completed_at")
        .eq("user_id", user.id)
        .order("completed_at"),
      supabase
        .from("bookmarks")
        .select("book, chapter, verse, label, created_at")
        .eq("user_id", user.id),
      supabase
        .from("memory_verses")
        .select("verse_ref, mastered, created_at")
        .eq("user_id", user.id),
      supabase
        .from("chat_sessions")
        .select("id, title, book, chapter, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? user.email ?? "Friend";

    // Resolve active companion name
    let companionName = "Charles";
    const activeCompanionId = (profile as { active_companion_id?: string | null } | null)?.active_companion_id;
    if (activeCompanionId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: comp } = await (supabase as any)
        .from("companion_definitions")
        .select("display_name")
        .eq("id", activeCompanionId)
        .single();
      if (comp?.display_name) companionName = comp.display_name as string;
    }

    // ── Build content ────────────────────────────────────────────────────────
    let fileContent: string;
    let fileName: string;
    let contentType: string;

    if (jobType === "data_csv") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fileContent = buildJournalCsv((journal ?? []) as Record<string, unknown>[]);
      fileName = `bible-study-journal-${isoDateSlug()}.csv`;
      contentType = "text/csv";
    } else if (jobType === "data_json") {
      fileContent = buildDataJson({
        profile: (profile ?? {}) as Record<string, unknown>,
        readingProgress: (progress ?? []) as Record<string, unknown>[],
        highlights: (highlights ?? []) as Record<string, unknown>[],
        journalEntries: (journal ?? []) as Record<string, unknown>[],
        bookmarks: (bookmarks ?? []) as Record<string, unknown>[],
        memoryVerses: (memoryVerses ?? []) as Record<string, unknown>[],
        chatSessions: (chatSessions ?? []) as Record<string, unknown>[],
        exportedAt: new Date().toISOString(),
      });
      fileName = `bible-study-data-${isoDateSlug()}.json`;
      contentType = "application/json";
    } else {
      // your_bible_pdf — generate HTML for print-to-PDF
      // Build per-chapter data (progress drives the list)
      const progressRows = (progress ?? []) as {
        book_code: string;
        chapter_number: number;
        completed_at: string;
      }[];

      // Group highlights by book+chapter
      type HlRow = { book: string; chapter: number; verse: number; color_hex: string };
      const hlMap = new Map<string, HighlightRow[]>();
      for (const h of (highlights ?? []) as HlRow[]) {
        const key = `${h.book}:${h.chapter}`;
        const existing = hlMap.get(key) ?? [];
        existing.push({ verse: h.verse, text: "", color: h.color_hex ?? "#C4A040" });
        hlMap.set(key, existing);
      }

      // Group journal notes by book+chapter (last note wins for simplicity)
      type JRow = { book: string; chapter: number; note: string | null };
      const noteMap = new Map<string, string | null>();
      for (const j of (journal ?? []) as JRow[]) {
        const key = `${j.book}:${j.chapter}`;
        if (j.note) noteMap.set(key, j.note);
      }

      // Book code → readable name (simple mapping from bible lib)
      const { getBook } = await import("@/lib/bible");

      const chapters: StudiedChapter[] = progressRows.map((p) => ({
        book: p.book_code,
        bookName: getBook(p.book_code)?.name ?? p.book_code,
        chapter: p.chapter_number,
        completedAt: p.completed_at,
        highlights: hlMap.get(`${p.book_code}:${p.chapter_number}`) ?? [],
        journalNote: noteMap.get(`${p.book_code}:${p.chapter_number}`) ?? null,
      }));

      fileContent = buildYourBibleHtml({
        userName: displayName,
        companionName,
        generatedAt: new Date().toISOString(),
        chapters,
      });
      fileName = `your-bible-${isoDateSlug()}.html`;
      contentType = "text/html";
    }

    // ── Upload to Supabase Storage ───────────────────────────────────────────
    const storagePath = `${user.id}/${fileName}`;
    const fileBytes = new TextEncoder().encode(fileContent);

    const { error: uploadError } = await adminClient.storage
      .from("exports")
      .upload(storagePath, fileBytes, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Signed URL valid for 7 days
    const { data: signedData, error: signedError } = await adminClient.storage
      .from("exports")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    if (signedError || !signedData?.signedUrl) {
      throw new Error("Failed to create signed URL");
    }

    const downloadUrl = signedData.signedUrl;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // ── Update job record ────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from("export_jobs")
      .update({
        status: "complete",
        storage_path: storagePath,
        download_url: downloadUrl,
        expires_at: expiresAt,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // ── Send email ───────────────────────────────────────────────────────────
    if (user.email) {
      const emailHtml = await render(
        PdfReadyEmail({
          recipientName: (profile as { display_name?: string | null } | null)?.display_name ?? null,
          fileName,
          downloadUrl,
          expiresHours: 168, // 7 days
        })
      );
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
        to: user.email,
        subject: "Your Bible export is ready",
        html: emailHtml,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from("export_jobs")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", jobId);
    }

    return NextResponse.json({ jobId, downloadUrl, fileName, status: "complete" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from("export_jobs")
      .update({ status: "failed", error_message: msg })
      .eq("id", jobId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function isoDateSlug(): string {
  return new Date().toISOString().split("T")[0]!;
}

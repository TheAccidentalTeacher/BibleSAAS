import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";

/**
 * GET /api/audio/esv?book=GEN&chapter=1
 *
 * Server-side proxy for the ESV Audio API (/v3/passage/audio/).
 * The ESV endpoint returns a 302 redirect to the actual MP3 hosted on
 * audio.esv.org.  We follow the redirect and return the final URL so
 * the client can play it directly with the HTML5 <audio> element.
 *
 * Auth-gated — user must be signed in.
 */
export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate params
  const book = req.nextUrl.searchParams.get("book");
  const chapterParam = req.nextUrl.searchParams.get("chapter");
  if (!book || !chapterParam) {
    return NextResponse.json({ error: "Missing book or chapter" }, { status: 400 });
  }
  const chapter = Number(chapterParam);
  if (!Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: "Invalid chapter" }, { status: 400 });
  }

  // Resolve book name from USFM code (e.g. "GEN" → "Genesis")
  const bookData = getBook(book.toUpperCase() as Parameters<typeof getBook>[0]);
  if (!bookData) {
    return NextResponse.json({ error: `Unknown book code: ${book}` }, { status: 400 });
  }

  const apiKey = process.env.ESV_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "ESV audio not configured" }, { status: 503 });
  }

  // Call ESV audio endpoint; it redirects to the MP3
  const q = `${bookData.name} ${chapter}`;
  const esvUrl = `https://api.esv.org/v3/passage/audio/?q=${encodeURIComponent(q)}`;

  let audioUrl: string;
  try {
    const res = await fetch(esvUrl, {
      headers: { Authorization: `Token ${apiKey}` },
      redirect: "manual", // capture the Location header instead of following
    });

    if (res.status === 302 || res.status === 301) {
      const location = res.headers.get("location");
      if (!location) {
        return NextResponse.json({ error: "ESV returned redirect with no location" }, { status: 502 });
      }
      audioUrl = location;
    } else if (res.ok) {
      // Some environments may auto-follow; use the final URL
      audioUrl = res.url;
    } else {
      const body = await res.text().catch(() => "");
      console.error("[esv-audio] ESV API error", res.status, body);
      return NextResponse.json(
        { error: `ESV API returned ${res.status}` },
        { status: res.status === 403 ? 403 : 502 },
      );
    }
  } catch (err) {
    console.error("[esv-audio] fetch error", err);
    return NextResponse.json({ error: "Failed to reach ESV API" }, { status: 502 });
  }

  return NextResponse.json({ audioUrl });
}

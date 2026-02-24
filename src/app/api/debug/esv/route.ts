/**
 * GET /api/debug/esv
 * Temporary diagnostic route — remove after ESV is confirmed working.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Key presence
  const apiKeyRaw = process.env.ESV_API_KEY ?? "";
  const apiKey = apiKeyRaw.trim();
  results.key_present = !!apiKey;
  results.key_raw_length = apiKeyRaw.length;
  results.key_trimmed_length = apiKey.length;
  results.key_has_whitespace = apiKeyRaw !== apiKey;
  results.key_starts_with_quote = apiKeyRaw.startsWith('"') || apiKeyRaw.startsWith("'");
  results.key_ends_with_quote = apiKeyRaw.endsWith('"') || apiKeyRaw.endsWith("'");
  results.key_first_char_code = apiKeyRaw.length > 0 ? apiKeyRaw.charCodeAt(0) : null;
  results.key_last_char_code = apiKeyRaw.length > 0 ? apiKeyRaw.charCodeAt(apiKeyRaw.length - 1) : null;
  results.key_preview = apiKey ? apiKey.slice(0, 8) + "..." : null;

  // 2. Direct ESV API call
  if (apiKey) {
    try {
      const url = new URL("https://api.esv.org/v3/passage/text/");
      url.searchParams.set("q", "John 11:35");
      url.searchParams.set("include-verse-numbers", "true");
      url.searchParams.set("include-footnotes", "false");
      url.searchParams.set("include-headings", "false");
      url.searchParams.set("include-short-copyright", "false");
      url.searchParams.set("include-copyright", "false");
      url.searchParams.set("include-passage-references", "false");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Token ${apiKey}`, Accept: "application/json" },
        cache: "no-store",
      });
      results.auth_header_sent = `Token ${apiKey.slice(0, 8)}...`;

      results.esv_status = res.status;
      results.esv_ok = res.ok;

      if (res.ok) {
        const json = await res.json() as { passages?: string[] };
        results.esv_passages_count = json.passages?.length ?? 0;
        results.esv_first_passage_preview = json.passages?.[0]?.slice(0, 80) ?? null;
      } else {
        const body = await res.text().catch(() => "");
        results.esv_error_body = body.slice(0, 300);
      }
    } catch (err) {
      results.esv_fetch_error = String(err);
    }
  }

  // 3. Supabase connection check
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    results.supabase_user = user?.id ?? "no session (expected for direct API hit)";

    // Use service role equivalent — just count chapters table rows
    const { count, error: dbError } = await supabase
      .from("chapters")
      .select("*", { count: "exact", head: true })
      .eq("translation", "ESV");

    results.esv_cached_chapters = count ?? 0;
    if (dbError) results.supabase_error = dbError.message;
  } catch (err) {
    results.supabase_error = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}

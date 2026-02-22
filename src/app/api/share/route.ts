import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/share
// Body: { content_type, payload, expires_hours? }
// Returns: { share_token, url }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    content_type: string;
    source_id?: string;
    payload: Record<string, unknown>;
    expires_hours?: number;
  };

  const { content_type, source_id, payload, expires_hours } = body;
  const expires_at = expires_hours
    ? new Date(Date.now() + expires_hours * 3600_000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("shared_content")
    .insert({
      user_id: user.id,
      content_type: content_type as "verse" | "highlight" | "journal_answer" | "trail" | "streak",
      source_id: source_id ?? null,
      payload,
      expires_at,
    })
    .select("share_token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const origin = req.headers.get("origin") ?? "";
  return NextResponse.json({ share_token: data.share_token, url: `${origin}/share/${data.share_token}` });
}

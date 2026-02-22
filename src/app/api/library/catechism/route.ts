import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/library/catechism?cat=WSC  (WSC | WLC | HC)
// GET /api/library/catechism?cat=WSC&q=justification  (search)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cat = (searchParams.get("cat") ?? "WSC").toUpperCase();
  const q = (searchParams.get("q") ?? "").trim();

  let query = supabase
    .from("catechism_entries")
    .select("id, catechism, question_number, lord_day, section, question_text, answer_text, scripture_refs, keywords, charles_note")
    .eq("catechism", cat as "WSC" | "WLC" | "HC")
    .order("question_number");

  if (q) {
    query = query.or(`question_text.ilike.%${q}%,answer_text.ilike.%${q}%,keywords.cs.{${q}}`);
  }

  const { data: entries, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: entries ?? [] });
}

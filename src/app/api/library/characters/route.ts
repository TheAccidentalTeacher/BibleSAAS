import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/library/characters?role=prophet&rarity=mighty&q=elijah&limit=40&offset=0
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const rarity = searchParams.get("rarity");
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? "40"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");

  let query = supabase
    .from("bible_characters")
    .select("id, name, alternate_names, primary_role, era, first_mention_book, description, rarity, is_athlete_of_faith, is_in_hebrews_11")
    .order("name")
    .range(offset, offset + limit - 1);

  if (role) query = query.eq("primary_role", role);
  if (rarity) query = query.eq("rarity", rarity as "faithful" | "renowned" | "mighty" | "eternal" | "the_word");
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: characters, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ characters: characters ?? [] });
}

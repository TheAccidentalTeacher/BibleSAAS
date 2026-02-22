import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DailyTrailRow } from "@/types/database";

// GET /api/trails/daily — today's morning + evening trails
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);

  const { data: rawTrails } = await supabase
    .from("daily_trails")
    .select("*")
    .eq("trail_date", today);

  const trails = (rawTrails ?? []) as unknown as DailyTrailRow[];

  const morning = trails.find((t) => t.slot === "morning") ?? null;
  const evening = trails.find((t) => t.slot === "evening") ?? null;

  // Check if user has already started these trails today
  const dailyIdArr = [morning?.id, evening?.id].filter(Boolean) as string[];
  const userTrailMap: Record<string, string> = {};
  if (dailyIdArr.length > 0) {
    const { data: userTrails } = await supabase
      .from("cross_reference_trails")
      .select("id, daily_trail_id")
      .eq("user_id", user.id)
      .in("daily_trail_id", dailyIdArr);
    if (userTrails) {
      for (const t of userTrails as unknown as { id: string; daily_trail_id: string }[]) {
        userTrailMap[t.daily_trail_id] = t.id;
      }
    }
  }

  return NextResponse.json({
    today,
    morning: morning ? { ...morning, user_trail_id: userTrailMap[morning.id] ?? null } : null,
    evening: evening ? { ...evening, user_trail_id: userTrailMap[evening.id] ?? null } : null,
  });
}

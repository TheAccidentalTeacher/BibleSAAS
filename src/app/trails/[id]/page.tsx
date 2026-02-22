import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import TrailConstellation from "@/components/trails/trail-constellation";
import type { CrossReferenceTrailRow, TrailStepRow } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Trail — Bible Study App" };

export default async function TrailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch trail
  const { data: rawTrail, error } = await supabase
    .from("cross_reference_trails")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !rawTrail) notFound();
  const trail = rawTrail as unknown as CrossReferenceTrailRow;

  // Access check: owner or public
  if (trail.user_id !== user.id && !trail.is_public) {
    redirect("/trails");
  }

  // Fetch steps
  const { data: rawSteps } = await supabase
    .from("trail_steps")
    .select("*")
    .eq("trail_id", id)
    .order("step_order");

  const steps = (rawSteps ?? []) as unknown as TrailStepRow[];

  const isOwner = trail.user_id === user.id;

  return (
    <>
      <main
        className="min-h-screen flex flex-col pb-20"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        <Link
          href="/trails"
          className="flex items-center gap-1.5 px-5 pt-5 pb-2 text-sm w-fit"
          style={{ color: "var(--color-text-3)" }}
        >
          ← Trails
        </Link>
        <div className="flex-1 flex flex-col">
          <TrailConstellation
            trail={{
              id: trail.id,
              name: trail.name,
              trail_type: trail.trail_type,
              origin_book: trail.origin_book,
              origin_chapter: trail.origin_chapter,
              origin_verse: trail.origin_verse,
              step_count: trail.step_count,
              share_token: trail.share_token,
              is_public: trail.is_public,
              created_at: trail.created_at,
              completed_at: trail.completed_at,
            }}
            steps={steps.map((s) => ({
              id: s.id,
              step_order: s.step_order,
              book: s.book,
              chapter: s.chapter,
              verse: s.verse,
              note: s.note,
            }))}
            isOwner={isOwner}
          />
        </div>
      </main>
      <BottomNav />
    </>
  );
}

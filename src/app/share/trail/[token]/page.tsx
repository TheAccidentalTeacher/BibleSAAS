import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TrailConstellation from "@/components/trails/trail-constellation";
import type { CrossReferenceTrailRow, TrailStepRow } from "@/types/database";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: rawTrail } = await supabase
    .from("cross_reference_trails")
    .select("name, origin_book, origin_chapter, origin_verse")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();

  if (!rawTrail) return { title: "Trail — Bible Study App" };
  const trail = rawTrail as unknown as Pick<CrossReferenceTrailRow, "name" | "origin_book" | "origin_chapter" | "origin_verse">;
  const title = trail.name ?? `Trail from ${trail.origin_book} ${trail.origin_chapter}:${trail.origin_verse}`;
  return { title: `${title} — Bible Study App` };
}

export default async function PublicTrailPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: rawTrail, error } = await supabase
    .from("cross_reference_trails")
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();

  if (error || !rawTrail) notFound();
  const trail = rawTrail as unknown as CrossReferenceTrailRow;

  const { data: rawSteps } = await supabase
    .from("trail_steps")
    .select("*")
    .eq("trail_id", trail.id)
    .order("step_order");

  const steps = (rawSteps ?? []) as unknown as TrailStepRow[];

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
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
          isOwner={false}
        />
      </div>
    </main>
  );
}

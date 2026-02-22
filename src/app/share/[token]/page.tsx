import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { SharedContentRow } from "@/types/database";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("shared_content")
    .select("payload, content_type")
    .eq("share_token", token)
    .eq("is_active", true)
    .single();

  if (!data) return { title: "Shared Verse" };

  const typedData = data as unknown as { payload: Record<string, string>; content_type: string };
  const payload = typedData.payload;
  const title = payload.bookName && payload.chapter && payload.verse
    ? `${payload.bookName} ${payload.chapter}:${payload.verse}`
    : "Shared Verse";

  return {
    title,
    description: payload.text ? `"${payload.text}"` : "A verse from the Bible Study App",
    openGraph: {
      title,
      description: payload.text ? `"${payload.text}"` : undefined,
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: shared } = await supabase
    .from("shared_content")
    .select("*")
    .eq("share_token", token)
    .eq("is_active", true)
    .single();

  if (!shared) notFound();

  const typed = shared as unknown as SharedContentRow;

  // Increment view count
  await supabase
    .from("shared_content")
    .update({ view_count: ((typed.view_count as number) ?? 0) + 1 })
    .eq("id", typed.id);

  const payload = typed.payload as Record<string, unknown>;
  const contentType = typed.content_type as string;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-8 shadow-lg"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-text-3)" }}>
          Shared via Bible Study App
        </p>

        {contentType === "verse" && (
          <>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-2)" }}>
              {String(payload.bookName)} {String(payload.chapter)}:{String(payload.verse)}
              {payload.translation ? ` (${String(payload.translation)})` : ""}
            </p>
            <blockquote
              className="text-lg leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-1)" }}
            >
              &ldquo;{String(payload.text)}&rdquo;
            </blockquote>
            {payload.note && (
              <div
                className="mt-4 p-4 rounded-xl border text-sm"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-3)" }}>Note</p>
                <p>{String(payload.note)}</p>
              </div>
            )}
          </>
        )}

        {contentType === "highlight" && (
          <>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-2)" }}>
              Highlighted in {String(payload.bookName)} {String(payload.chapter)}:{String(payload.verse)}
            </p>
            <blockquote
              className="text-lg leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-text-1)" }}
            >
              &ldquo;{String(payload.text)}&rdquo;
            </blockquote>
          </>
        )}

        {contentType !== "verse" && contentType !== "highlight" && (
          <pre className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-text-2)" }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        )}

        {/* CTA */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
          <Link
            href="/"
            className="block text-center text-sm font-semibold py-3 px-6 rounded-full transition-colors"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            Open Bible Study App
          </Link>
        </div>
      </div>
    </div>
  );
}

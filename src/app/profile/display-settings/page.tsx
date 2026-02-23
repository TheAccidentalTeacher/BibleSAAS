import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import DisplaySettingsForm from "./display-settings-form";

export const metadata = { title: "Display & Theme" };

export default async function DisplaySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: raw } = await supabase
    .from("user_display_settings")
    .select("visual_theme, theme, bible_reading_font, font_size, translation, catechism_layer_enabled, show_cross_refs, show_verse_numbers, meta")
    .eq("user_id", user.id)
    .maybeSingle();

  const ds = raw as {
    visual_theme?: string;
    theme?: string;
    bible_reading_font?: string;
    font_size?: string;
    translation?: string;
    catechism_layer_enabled?: boolean;
    show_cross_refs?: boolean;
    show_verse_numbers?: boolean;
    meta?: Record<string, unknown>;
  } | null;

  const initial = {
    visual_theme:            ds?.visual_theme            ?? "default",
    theme:                   ds?.theme                   ?? "dark",
    bible_reading_font:      ds?.bible_reading_font      ?? "eb_garamond",
    font_size:               ds?.font_size               ?? "medium",
    translation:             ds?.translation             ?? "WEB",
    catechism_layer_enabled: ds?.catechism_layer_enabled ?? false,
    show_cross_refs:         ds?.show_cross_refs         ?? true,
    show_verse_numbers:      ds?.show_verse_numbers      ?? true,
    spurgeon_enabled:        ds?.meta?.spurgeon_enabled  !== false,
    tts_voice_id:            (ds?.meta?.tts_voice_id as string) ?? "en-US-Neural2-D",
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 border-b" style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}>
        <Link href="/profile" className="text-sm" style={{ color: "var(--color-text-2)" }}>‹ Profile</Link>
        <h1 className="text-base font-semibold" style={{ color: "var(--color-text-1)" }}>Display &amp; Theme</h1>
      </div>

      {saved && (
        <div className="mx-5 mt-4 rounded-xl px-4 py-3 text-sm font-medium" style={{ background: "color-mix(in srgb, var(--color-accent) 15%, transparent)", color: "var(--color-accent)" }}>
          Settings saved successfully.
        </div>
      )}

      <DisplaySettingsForm initial={initial} />

      <BottomNav />
    </div>
  );
}

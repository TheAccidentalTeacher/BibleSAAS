"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveDisplaySettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const visual_theme = formData.get("visual_theme") as string || "default";
  const theme = formData.get("theme") as string || "dark";
  const bible_reading_font = formData.get("bible_reading_font") as string || "eb_garamond";
  const font_size = formData.get("font_size") as string || "medium";
  const translation = formData.get("translation") as string || "WEB";
  const catechism_layer_enabled = formData.get("catechism_layer_enabled") === "on";
  const show_cross_refs = formData.get("show_cross_refs") === "on";
  const show_verse_numbers = formData.get("show_verse_numbers") === "on";

  // Spurgeon toggle stored in meta since there's no dedicated column
  const spurgeon_enabled = formData.get("spurgeon_enabled") === "on";
  const tts_voice_id = (formData.get("tts_voice_id") as string) || "en-US-Neural2-D";

  // Read existing meta to merge
  const { data: existing } = await supabase
    .from("user_display_settings")
    .select("meta")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingMeta = (existing?.meta as Record<string, unknown>) ?? {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_display_settings")
    .upsert(
      {
        user_id: user.id,
        visual_theme,
        theme,
        bible_reading_font,
        font_size,
        translation,
        catechism_layer_enabled,
        show_cross_refs,
        show_verse_numbers,
        meta: { ...existingMeta, spurgeon_enabled, tts_voice_id },
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[display-settings] Save error:", error.message);
  }

  revalidatePath("/", "layout");
  redirect("/profile/display-settings?saved=1");
}

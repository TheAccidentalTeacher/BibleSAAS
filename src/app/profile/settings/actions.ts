"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateNotificationSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const updates = {
    email_digest: formData.get("email_digest") === "on",
    email_verse_thread: formData.get("email_verse_thread") === "on",
    email_system: formData.get("email_system") === "on",
    push_enabled: formData.get("push_enabled") === "on",
  };

  // Upsert (create row if missing)
  await supabase
    .from("notification_settings")
    .upsert(
      { user_id: user.id, ...updates },
      { onConflict: "user_id" }
    );

  revalidatePath("/profile/settings");
}

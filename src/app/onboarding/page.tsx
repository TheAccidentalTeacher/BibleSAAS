import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingChat } from "./onboarding-chat";

export const metadata = { title: "Getting Started" };

/**
 * /onboarding — Conversational onboarding page (Phase 2).
 *
 * Full-screen chat with Charles. No nav bar.
 * Redirects to /dashboard once onboarding_complete = true.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, gifted_by, gifted_message, display_name")
    .eq("id", user.id)
    .single();

  // Already completed onboarding
  if (profile?.onboarding_complete) {
    redirect("/dashboard");
  }

  const isGifted = !!profile?.gifted_by;

  return (
    <OnboardingChat
      isGifted={isGifted}
    />
  );
}

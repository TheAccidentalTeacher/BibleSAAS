import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Getting Started" };

/**
 * /onboarding — placeholder until Phase 2 (Conversational Onboarding).
 *
 * Phase 2 will replace this with the full Charles-led chat UI:
 *   - Full-screen chat, no nav bar
 *   - "Before we get started — tell me a little about yourself."
 *   - Profile extraction → sets visual theme, interests, faith stage
 *   - Gifted account detection + special greeting
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-lg text-center">
        <p className="label mb-6">Getting started</p>

        <h1
          className="mb-6 text-5xl font-bold text-[var(--color-text-1)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Welcome.
        </h1>

        <p className="mb-2 text-lg text-[var(--color-text-2)] leading-relaxed">
          &ldquo;Before we get started — tell me a little about yourself.
          I want to make sure this Bible feels like yours.&rdquo;
        </p>
        <p className="mb-10 text-[14px] text-[var(--color-text-3)]">— Charles</p>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 text-left">
          <p className="label mb-2">Phase 2 — Coming soon</p>
          <p className="text-[14px] text-[var(--color-text-2)]">
            The conversational onboarding experience (Ask Charles chat UI,
            profile extraction, and archetype-based theme selection) will be
            built in Phase 2.
          </p>
        </div>

        <div className="mt-8">
          <a
            href="/dashboard"
            className="text-[14px] text-[var(--color-accent)] hover:underline"
          >
            Continue to dashboard →
          </a>
        </div>
      </div>
    </main>
  );
}

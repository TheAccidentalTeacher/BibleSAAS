import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

/**
 * /dashboard — placeholder until Phase 5 (Dashboard Screen).
 *
 * Phase 5 will add:
 *  - Quick-resume card (last read chapter, progress bar)
 *  - Daily trail pair (Morning + Evening trail cards)
 *  - Streak + character card teasers
 *  - Ask Charles shortcut
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, subscription_tier, onboarding_complete")
    .eq("id", user.id)
    .single();

  // Redirect to onboarding if not complete
  if (profile && !profile.onboarding_complete) {
    redirect("/onboarding");
  }

  const displayName = profile?.display_name ?? user.email ?? "Friend";
  const tier = profile?.subscription_tier ?? "free";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-lg text-center">
        {/* Eyebrow */}
        <p className="label mb-4">Dashboard</p>

        {/* Greeting */}
        <h1
          className="mb-4 text-5xl font-bold text-[var(--color-text-1)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Welcome back,<br />
          <span className="text-[var(--color-accent)]">
            {displayName.split(" ")[0]}
          </span>
        </h1>

        <p className="mb-8 text-[15px] text-[var(--color-text-2)]">
          The full dashboard is coming in Phase 5. For now — you&apos;re
          authenticated and your account is set up.
        </p>

        {/* Tier badge */}
        <span
          className="inline-block rounded-full border border-[var(--color-border)] px-4 py-1 text-[12px] uppercase tracking-widest text-[var(--color-text-3)]"
        >
          {tier} tier
        </span>

        {/* Links */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href="/profile"
            className="text-[14px] text-[var(--color-accent)] hover:underline"
          >
            View profile →
          </a>
          <a
            href="/read/GEN/1"
            className="text-[14px] text-[var(--color-text-2)] hover:text-[var(--color-text-1)] transition-colors"
          >
            Start reading (Genesis 1) →
          </a>
        </div>
      </div>
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profile" };

/**
 * /profile — basic profile page (Phase 1).
 *
 * Phase 6 (Personalization) will expand this with:
 *  - Font / theme picker
 *  - Notification preferences
 *  - Subscription management (Stripe portal)
 *  - Data export trigger
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, subscription_tier, created_at")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? null;
  const email = profile?.email ?? user.email ?? "—";
  const tier = profile?.subscription_tier ?? "free";
  const joined = profile?.created_at
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(profile.created_at))
    : "—";

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        {/* Back link */}
        <a
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-1 text-[13px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
        >
          ← Dashboard
        </a>

        {/* Header */}
        <div className="mb-8">
          <p className="label mb-2">Account</p>
          <h1
            className="text-4xl font-bold text-[var(--color-text-1)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {displayName ?? "Your Profile"}
          </h1>
        </div>

        {/* Info card */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {/* Display name */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="label mb-0.5">Display name</p>
              <p className="text-[15px] text-[var(--color-text-1)]">
                {displayName ?? <span className="text-[var(--color-text-3)]">Not set</span>}
              </p>
            </div>
            {/* Edit display name — Phase 6 */}
            <span className="text-[12px] text-[var(--color-text-3)]">edit (coming soon)</span>
          </div>

          {/* Email */}
          <div className="px-5 py-4">
            <p className="label mb-0.5">Email</p>
            <p className="text-[15px] text-[var(--color-text-1)]">{email}</p>
          </div>

          {/* Tier */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="label mb-0.5">Subscription tier</p>
              <p className="text-[15px] text-[var(--color-text-1)] capitalize">{tier}</p>
            </div>
            {tier === "free" && (
              <a
                href="/upgrade"
                className="text-[13px] text-[var(--color-accent)] hover:underline"
              >
                Upgrade ↗
              </a>
            )}
          </div>

          {/* Joined */}
          <div className="px-5 py-4">
            <p className="label mb-0.5">Member since</p>
            <p className="text-[15px] text-[var(--color-text-1)]">{joined}</p>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-8">
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </div>

        {/* Danger zone — Phase 6 */}
        <div className="mt-6 rounded-[var(--radius-card)] border border-red-500/20 bg-red-500/5 px-5 py-4">
          <p className="label text-red-400 mb-1">Danger zone</p>
          <p className="text-[13px] text-[var(--color-text-3)]">
            Account deletion and data export will be available in a future update.
          </p>
        </div>
      </div>
    </main>
  );
}

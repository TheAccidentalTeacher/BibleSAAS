import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the magic link / OAuth redirect from Supabase.
 * 1. Exchanges the `code` query param for a session.
 * 2. Auto-creates a `profiles` row for brand-new users (if the trigger
 *    hasn't done it — belt-and-suspenders approach).
 * 3. Redirects to `/onboarding` if the profile isn't complete,
 *    otherwise to `next` (default `/dashboard`).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    // No code — invalid callback; send to login with an error hint.
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("error", "invalid_callback");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("error", "session_exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  const user = data.user;

  // ── Profile auto-creation ─────────────────────────────────────────────────
  // The database trigger handles this at the SQL level, but we do it here too
  // as a safety net for cases where the trigger isn't yet deployed.
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    // Create the profile row with safe defaults.
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      subscription_tier: "free",
      onboarding_complete: false,
    });

    // Create user_display_settings row.
    await supabase.from("user_display_settings").insert({
      user_id: user.id,
    });

    // Create notification_settings row.
    await supabase.from("notification_settings").insert({
      user_id: user.id,
    });

    // New user — send to onboarding.
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  // Existing user: redirect to onboarding if not done yet.
  if (!existingProfile.onboarding_complete) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}

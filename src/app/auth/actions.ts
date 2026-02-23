"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Minimum age to comply with COPPA. */
const MINIMUM_AGE = 13;

// ─── Magic Link ────────────────────────────────────────────────────────────────

/**
 * Send a magic link to the provided email address.
 * Returns an error string on failure; null on success.
 */
export async function signInWithMagicLink(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email")?.toString().trim();

  if (!email) return "Please enter your email address.";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return error.message;

  redirect("/auth/verify");
}

// ─── Password Sign-In ──────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Returns an error string on failure; redirects on success.
 */
export async function signInWithPassword(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email) return "Please enter your email address.";
  if (!password) return "Please enter your password.";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return error.message;

  redirect("/dashboard");
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

/**
 * Create a new account with email + password.
 * Enforces minimum age (COPPA). Returns error string or null.
 */
export async function signUpWithPassword(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const ageConfirmed = formData.get("age_confirmed")?.toString();

  if (!email) return "Please enter your email address.";
  if (!password) return "Please enter a password.";
  if (password.length < 8) return "Password must be at least 8 characters.";

  // COPPA age confirmation — required checkbox
  if (ageConfirmed !== "yes") {
    return `You must confirm you are at least ${MINIMUM_AGE} years old to use this app.`;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return error.message;

  redirect("/auth/verify");
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Sign out the current user and redirect to the login page.
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

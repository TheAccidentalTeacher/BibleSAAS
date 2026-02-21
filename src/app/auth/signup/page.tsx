"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpWithPassword, signInWithMagicLink } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-feedback";

export default function SignupPage() {
  const [showBirthYear, setShowBirthYear] = useState(false);

  const [signupError, signupAction, signupPending] = useActionState(
    signUpWithPassword,
    null
  );
  const [magicError, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    null
  );

  const currentYear = new Date().getFullYear();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--color-text-1)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bible Study
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-text-3)] uppercase tracking-widest">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
          <form action={signupAction} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
            />

            {/* Age gate toggle */}
            <button
              type="button"
              onClick={() => setShowBirthYear(!showBirthYear)}
              className="text-left text-[13px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
            >
              {showBirthYear ? "▲ Hide age confirmation" : "▼ I am under 18 — confirm age"}
            </button>

            {showBirthYear && (
              <Input
                id="birth_year"
                name="birth_year"
                type="number"
                label={`Birth year (must be ${currentYear - 13} or earlier)`}
                placeholder={String(currentYear - 13)}
                min={currentYear - 120}
                max={currentYear - 13}
              />
            )}

            <FormError message={signupError} />

            <Button type="submit" size="lg" loading={signupPending} className="w-full">
              Create account
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[12px] text-[var(--color-text-3)] uppercase tracking-widest">
              or
            </span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          {/* Magic link option */}
          <form action={magicAction}>
            <input type="hidden" name="email" id="magic-email-hidden" />
            <p className="mb-3 text-[13px] text-[var(--color-text-2)]">
              Prefer a password-free experience?
            </p>
            <div className="flex gap-2">
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                className="h-10 flex-1 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-[14px] text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <Button type="submit" variant="outline" size="sm" loading={magicPending}>
                Send link
              </Button>
            </div>
            <FormError message={magicError} />
          </form>
        </div>

        {/* Terms note */}
        <p className="mt-4 text-center text-[12px] text-[var(--color-text-3)]">
          By signing up you agree to our{" "}
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Footer */}
        <p className="mt-4 text-center text-[13px] text-[var(--color-text-3)]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--color-accent)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

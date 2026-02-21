"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInWithMagicLink, signInWithPassword } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-feedback";

export default function LoginPage() {
  const [usePassword, setUsePassword] = useState(false);

  const [magicError, magicAction, magicPending] = useActionState(
    signInWithMagicLink,
    null
  );
  const [passError, passAction, passPending] = useActionState(
    signInWithPassword,
    null
  );

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
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
          {!usePassword ? (
            /* ── Magic link form ── */
            <form action={magicAction} className="flex flex-col gap-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <FormError message={magicError} />
              <Button type="submit" size="lg" loading={magicPending} className="w-full">
                Send magic link
              </Button>
              <button
                type="button"
                onClick={() => setUsePassword(true)}
                className="mt-1 text-center text-[13px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
              >
                Use password instead
              </button>
            </form>
          ) : (
            /* ── Password form ── */
            <form action={passAction} className="flex flex-col gap-4">
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
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <FormError message={passError} />
              <Button type="submit" size="lg" loading={passPending} className="w-full">
                Sign in
              </Button>
              <button
                type="button"
                onClick={() => setUsePassword(false)}
                className="mt-1 text-center text-[13px] text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
              >
                Use magic link instead
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[13px] text-[var(--color-text-3)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[var(--color-accent)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

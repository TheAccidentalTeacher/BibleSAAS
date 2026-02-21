import Link from "next/link";

export const metadata = { title: "Check Your Email" };

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        {/* Heading */}
        <h1
          className="mb-3 text-3xl font-bold text-[var(--color-text-1)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Check your email
        </h1>

        <p className="mb-8 text-[15px] text-[var(--color-text-2)] leading-relaxed">
          We sent a sign-in link to your email address. Click it to continue —
          the link expires in 1 hour.
        </p>

        <p className="text-[13px] text-[var(--color-text-3)]">
          Wrong address?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--color-accent)] hover:underline"
          >
            Go back
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { submitGiftSetup } from "./actions";
import { Button } from "@/components/ui/button";
import { FormError, FormSuccess } from "@/components/ui/form-feedback";

/**
 * /gift/setup/[token] — Gift giver setup flow (Phase 2.4)
 *
 * A gift giver uses this page to:
 *   1. Describe the person they're gifting this to (freeform)
 *   2. Optionally write a birthday letter (stored for future delivery)
 *
 * The token maps to a profile with `gifted_by` set during account creation.
 */
export default function GiftSetupPage() {
  const [state, action, isPending] = useActionState(submitGiftSetup, null);

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="mx-auto w-full max-w-lg px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="label mb-3">Gift setup</p>
          <h1
            className="mb-4 text-4xl font-bold text-[var(--color-text-1)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tell me about them.
          </h1>
          <p className="text-[15px] text-[var(--color-text-2)] leading-relaxed">
            The more you share, the more personal their Bible experience will
            be. Charles will use this to shape how he speaks to them — their
            reading themes, their study connections, everything.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-6">
          {/* Description field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="label">
              Tell us about the person you&apos;re gifting this to
            </label>
            <p className="text-[13px] text-[var(--color-text-3)] mb-1">
              Their name, age, what they&apos;re like, where they are in their
              faith, what matters to them. No word limit — more is better.
            </p>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="My daughter Emma is 28, works in nursing, and has been curious about faith since college but never found a church that felt real to her. She loves poetry and hiking. She's not skeptical exactly — more like cautious..."
              required
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[15px] text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors resize-y min-h-[160px]"
            />
          </div>

          {/* Birthday letter — optional */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthday_letter" className="label">
              Birthday letter{" "}
              <span className="text-[var(--color-text-3)] normal-case font-normal">— optional</span>
            </label>
            <p className="text-[13px] text-[var(--color-text-3)] mb-1">
              Write a letter that will appear woven into their reading on their
              birthday. This is kept private until that day.
            </p>
            <textarea
              id="birthday_letter"
              name="birthday_letter"
              rows={5}
              placeholder="Write whatever you want them to read on their birthday..."
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[15px] text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] transition-colors resize-y min-h-[120px]"
            />
          </div>

          <FormError message={state?.error} />
          <FormSuccess message={state?.success} />

          <Button
            type="submit"
            size="lg"
            loading={isPending}
            className="w-full"
          >
            Set up this gift
          </Button>
        </form>

        {/* Privacy note */}
        <p className="mt-6 text-center text-[12px] text-[var(--color-text-3)]">
          This description is used only to personalize their Bible experience
          and is never shared or sold.
        </p>
      </div>
    </main>
  );
}

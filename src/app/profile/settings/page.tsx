import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import { updateNotificationSettings } from "./actions";
import type { NotificationSettingsRow } from "@/types/database";

export const metadata = { title: "Notification Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawSettings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const settings = rawSettings as NotificationSettingsRow | null;

  const emailDigest = settings?.email_digest ?? true;
  const emailVerseThread = settings?.email_verse_thread ?? true;
  const emailSystem = settings?.email_system ?? true;
  const pushEnabled = settings?.push_enabled ?? false;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 border-b"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <Link
          href="/profile"
          className="text-sm"
          style={{ color: "var(--color-text-2)" }}
        >
          ‹ Profile
        </Link>
        <h1
          className="text-base font-semibold"
          style={{ color: "var(--color-text-1)" }}
        >
          Notification Settings
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Email Notifications section */}
        <form action={updateNotificationSettings} className="space-y-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            Email Notifications
          </p>

          <ToggleRow
            name="email_digest"
            label="Daily Reading & Digest"
            description="Morning email with today's passage and a few questions"
            defaultChecked={emailDigest}
          />
          <ToggleRow
            name="email_verse_thread"
            label="Verse Thread Replies"
            description="When someone leaves a note on a verse you're watching"
            defaultChecked={emailVerseThread}
          />
          <ToggleRow
            name="email_system"
            label="System & Account"
            description="Subscription updates, PDF ready, important alerts"
            defaultChecked={emailSystem}
          />

          <p
            className="text-xs font-semibold uppercase tracking-widest mt-6 mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            Push Notifications
          </p>

          <ToggleRow
            name="push_enabled"
            label="Push Notifications"
            description="Browser / device push (requires permission)"
            defaultChecked={pushEnabled}
          />

          <button
            type="submit"
            className="mt-6 w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
            }}
          >
            Save preferences
          </button>
        </form>

        <p
          className="text-xs text-center"
          style={{ color: "var(--color-text-3)" }}
        >
          You&apos;ll always receive account security emails regardless of these
          settings.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      className="flex items-start gap-4 py-4 border-b cursor-pointer"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex-1 pr-2">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
          {description}
        </p>
      </div>
      {/* Checkbox rendered as a toggle */}
      <div className="relative flex items-center mt-0.5">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div
          className="w-10 h-6 rounded-full transition-colors peer-checked:bg-[var(--color-accent)] bg-[var(--color-surface-2)]"
          style={{}}
        />
        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditNameForm({ currentName }: { currentName: string }) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 50;

  async function handleSave() {
    if (!valid) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile/update-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Failed to save");
          return;
        }
        setSaved(true);
        setTimeout(() => router.push("/profile"), 800);
      } catch {
        setError("Network error — try again");
      }
    });
  }

  return (
    <div className="px-5 py-6 max-w-md mx-auto">
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-3)" }}>
        Display name
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setSaved(false); }}
        maxLength={50}
        placeholder="Your name"
        className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors focus:ring-2"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-1)",
        }}
      />
      <p className="text-xs mt-2" style={{ color: "var(--color-text-3)" }}>
        {trimmed.length}/50 — visible to family & group members
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {saved && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-accent)" }}>
          Saved! Redirecting…
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!valid || isPending || saved}
        className="mt-6 w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--color-accent)", color: "#fff" }}
      >
        {isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

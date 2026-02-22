"use client";

/**
 * FamilyClient — Family unit management screen.
 *
 * States:
 * 1. No family unit — show Create / Join options
 * 2. In a family unit — show unit info, invite code, member list
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, Users, Plus, LogIn, Trash2 } from "lucide-react";

interface Member {
  user_id: string;
  role: string;
  display_name: string;
  avatar_url: string | null;
  is_me: boolean;
}

interface FamilyClientProps {
  unit: { id: string; name: string; accent_color: string } | null;
  members: Member[];
  myRole: string | null;
}

export default function FamilyClient({ unit, members }: FamilyClientProps) {
  const router = useRouter();
  const [view, setView] = useState<"overview" | "create" | "join">("overview");
  const [unitName, setUnitName] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!unitName.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: unitName.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const j = await res.json() as { error?: string };
      setError(j.error ?? "Failed to create");
    }
  }

  async function handleJoin() {
    if (!inviteInput.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/family/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: inviteInput.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const j = await res.json() as { error?: string };
      setError(j.error ?? "Invalid invite code");
    }
  }

  async function handleGetInviteCode() {
    const res = await fetch("/api/family/invite");
    if (res.ok) {
      const { invite_code } = await res.json() as { invite_code: string };
      setInviteCode(invite_code);
    }
  }

  async function handleLeave() {
    if (!confirm("Leave this family unit?")) return;
    await fetch("/api/family", { method: "DELETE" });
    router.refresh();
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-3 px-4 h-[52px] border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: "var(--color-text-2)" }}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="flex-1 text-sm font-semibold" style={{ color: "var(--color-text-1)" }}>
          Family Unit
        </h1>
      </header>

      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* ── No unit — options ── */}
        {!unit && view === "overview" && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl border p-6 text-center"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <Users size={36} className="mx-auto mb-3" style={{ color: "var(--color-text-3)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--color-text-1)" }}>No family unit yet</p>
              <p className="text-sm" style={{ color: "var(--color-text-2)" }}>
                Create a family unit or join one with an invite code.
              </p>
            </div>
            <button
              onClick={() => setView("create")}
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              <Plus size={16} /> Create a family unit
            </button>
            <button
              onClick={() => setView("join")}
              className="flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-1)", background: "var(--color-surface-2)" }}
            >
              <LogIn size={16} /> Join with invite code
            </button>
          </div>
        )}

        {/* ── Create form ── */}
        {!unit && view === "create" && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setView("overview")} className="text-sm" style={{ color: "var(--color-text-2)" }}>
              ← Back
            </button>
            <h2 className="font-semibold text-lg" style={{ color: "var(--color-text-1)" }}>Create a family unit</h2>
            <input
              className="rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text-1)" }}
              placeholder="Unit name (e.g., The Smith Family)"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              maxLength={60}
            />
            <button
              onClick={() => void handleCreate()}
              disabled={loading || !unitName.trim()}
              className="rounded-xl py-3 font-semibold text-sm disabled:opacity-50"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        )}

        {/* ── Join form ── */}
        {!unit && view === "join" && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setView("overview")} className="text-sm" style={{ color: "var(--color-text-2)" }}>
              ← Back
            </button>
            <h2 className="font-semibold text-lg" style={{ color: "var(--color-text-1)" }}>Join with invite code</h2>
            <input
              className="rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text-1)" }}
              placeholder="Paste invite code…"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
            <button
              onClick={() => void handleJoin()}
              disabled={loading || !inviteInput.trim()}
              className="rounded-xl py-3 font-semibold text-sm disabled:opacity-50"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
            >
              {loading ? "Joining…" : "Join"}
            </button>
          </div>
        )}

        {/* ── Unit overview ── */}
        {unit && (
          <div className="flex flex-col gap-5">
            {/* Unit card */}
            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: unit.accent_color }}
                >
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--color-text-1)" }}>{unit.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-3)" }}>{members.length} member{members.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Invite code */}
              <div>
                {inviteCode ? (
                  <div
                    className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
                    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                  >
                    <span className="font-mono text-xs truncate" style={{ color: "var(--color-text-2)" }}>
                      {inviteCode}
                    </span>
                    <button
                      onClick={() => copyCode(inviteCode)}
                      aria-label="Copy invite code"
                      style={{ color: "var(--color-text-2)" }}
                    >
                      {copiedCode ? <Check size={14} style={{ color: "var(--color-accent)" }} /> : <Copy size={14} />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => void handleGetInviteCode()}
                    className="w-full rounded-xl border py-2.5 text-sm font-medium"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)", background: "var(--color-surface-2)" }}
                  >
                    Show invite code
                  </button>
                )}
              </div>
            </div>

            {/* Members list */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-3)" }}>
                Members
              </p>
              <div className="flex flex-col gap-2">
                {members.map((m) => (
                  <div
                    key={m.user_id}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                      style={{ background: unit.accent_color, color: "#fff" }}
                    >
                      {m.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>
                        {m.display_name}
                        {m.is_me && <span className="ml-1.5 text-[10px] opacity-60">(you)</span>}
                      </p>
                      <p className="text-xs capitalize" style={{ color: "var(--color-text-3)" }}>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave */}
            <button
              onClick={() => void handleLeave()}
              className="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
            >
              <Trash2 size={14} /> Leave family unit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

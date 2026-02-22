"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, FileText, Database, Trash2 } from "lucide-react";

interface ExportJob {
  id: string;
  job_type: string;
  status: string;
  download_url: string | null;
  created_at: string;
  expires_at: string | null;
}

interface ExportClientProps {
  jobs: ExportJob[];
  deletionRequestedAt: string | null;
  tier: string;
}

type ExportJobType = "your_bible_pdf" | "data_json" | "data_csv";

export default function ExportClient({ jobs: initialJobs, deletionRequestedAt, tier }: ExportClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [jobs, setJobs] = useState(initialJobs);
  const [generating, setGenerating] = useState<ExportJobType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Account deletion state
  const [deletionPending, setDeletionPending] = useState(deletionRequestedAt !== null);
  const [deletionDate] = useState(() =>
    deletionRequestedAt
      ? new Date(new Date(deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" }
        )
      : null
  );

  const isYourEdition = tier === "your_edition";

  async function handleExport(jobType: ExportJobType) {
    if (generating) return;
    setGenerating(jobType);
    setError(null);
    try {
      const res = await fetch("/api/export/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType }),
      });
      const data = await res.json() as { downloadUrl?: string; fileName?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Export failed");
      } else if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setGenerating(null);
    }
  }

  async function handleRequestDeletion() {
    if (!confirm("Request account deletion? You'll have 30 days to cancel before your data is permanently removed.")) return;
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      setDeletionPending(true);
      router.refresh();
    }
  }

  function handleCancelDeletion() {
    startTransition(async () => {
      const res = await fetch("/api/account/cancel-deletion", { method: "POST" });
      if (res.ok) {
        setDeletionPending(false);
        router.refresh();
      }
    });
  }

  const labelMap: Record<string, string> = {
    your_bible_pdf: "Your Bible (HTML/PDF)",
    data_json: "Full Data Export (JSON)",
    data_csv: "Journal Export (CSV)",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D0D0D]/95 backdrop-blur border-b border-[#1A1A1A] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/profile" className="text-[#6B6056] hover:text-[#E8E0D4]">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[#E8E0D4] font-semibold text-sm">Export & Data</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* "Your Bible" export */}
        <section className="rounded-2xl border border-[#2C2C2C] bg-[#141414] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1A1A1A]">
            <h2 className="text-[#E8E0D4] font-semibold text-sm">Your Bible Export</h2>
            <p className="text-[#6B6056] text-xs mt-1">
              A printable HTML document of all your studied chapters with highlights and journal notes.
              Open the link in your browser and press <kbd className="bg-[#222] px-1 rounded text-xs">Ctrl+P</kbd> → Save as PDF.
            </p>
          </div>
          <div className="px-5 py-4">
            {!isYourEdition ? (
              <div className="flex items-center justify-between">
                <p className="text-[#6B6056] text-xs">Available on <span className="text-[#C4A040]">Living Bible</span> plan.</p>
                <Link
                  href="/profile/upgrade"
                  className="text-xs text-[#C4A040] border border-[#C4A040]/40 px-3 py-1.5 rounded-full hover:bg-[#C4A040]/10 transition-colors"
                >
                  Upgrade
                </Link>
              </div>
            ) : (
              <button
                onClick={() => handleExport("your_bible_pdf")}
                disabled={generating !== null}
                className="flex items-center gap-2 text-sm font-medium text-[#E8E0D4] bg-[#C4A040] px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {generating === "your_bible_pdf" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                Generate Your Bible
              </button>
            )}
          </div>
        </section>

        {/* Data exports */}
        <section className="rounded-2xl border border-[#2C2C2C] bg-[#141414] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1A1A1A]">
            <h2 className="text-[#E8E0D4] font-semibold text-sm">Data Export</h2>
            <p className="text-[#6B6056] text-xs mt-1">
              Download all your study data — available on all plans.
            </p>
          </div>
          <div className="px-5 py-4 flex gap-3 flex-wrap">
            {(["data_json", "data_csv"] as ExportJobType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                disabled={generating !== null}
                className="flex items-center gap-2 text-xs text-[#B8AFA4] border border-[#2C2C2C] px-3 py-2 rounded-lg hover:border-[#C4A040] hover:text-[#C4A040] transition-all disabled:opacity-50"
              >
                {generating === type ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Database size={12} />
                )}
                {type === "data_json" ? "JSON" : "CSV (Journal)"}
              </button>
            ))}
          </div>
        </section>

        {/* Export history */}
        {jobs.length > 0 && (
          <section>
            <h2 className="text-[#6B6056] text-xs uppercase tracking-widest mb-3">Export History</h2>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-xl border border-[#2C2C2C] bg-[#141414] px-4 py-3"
                >
                  <div>
                    <p className="text-[#B8AFA4] text-xs font-medium">{labelMap[job.job_type] ?? job.job_type}</p>
                    <p className="text-[#4A4040] text-xs mt-0.5">
                      {job.status === "complete" ? "Ready" : job.status} ·{" "}
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  {job.download_url && job.status === "complete" && (
                    <a
                      href={job.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C4A040] hover:opacity-80"
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Account deletion */}
        <section className="rounded-2xl border border-red-900/30 bg-[#141414] overflow-hidden">
          <div className="px-5 py-4 border-b border-red-900/20">
            <h2 className="text-red-400 font-semibold text-sm">Delete Account</h2>
          </div>
          <div className="px-5 py-4">
            {deletionPending ? (
              <div className="space-y-3">
                <p className="text-[#B8AFA4] text-sm">
                  Your account is scheduled for deletion on{" "}
                  <span className="text-red-400 font-medium">{deletionDate}</span>. All your data will be
                  permanently removed.
                </p>
                <button
                  onClick={handleCancelDeletion}
                  disabled={isPending}
                  className="flex items-center gap-2 text-xs text-[#B8AFA4] border border-[#2C2C2C] px-3 py-2 rounded-lg hover:border-[#C4A040] transition-all"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  Cancel Deletion
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[#6B6056] text-xs">
                  Permanently delete your account and all associated data. You'll have 30 days to cancel.
                </p>
                <button
                  onClick={handleRequestDeletion}
                  className="flex items-center gap-2 text-xs text-red-400 border border-red-900/40 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={12} />
                  Request Account Deletion
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

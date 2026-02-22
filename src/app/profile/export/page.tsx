import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ExportClient from "./export-client";

export const metadata = { title: "Export & Data | Bible Study" };

export default async function ExportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, deletion_requested_at")
    .eq("id", user.id)
    .single();

  const tier = (profile as { subscription_tier?: string } | null)?.subscription_tier ?? "free";
  const deletionRequestedAt =
    (profile as { deletion_requested_at?: string | null } | null)?.deletion_requested_at ?? null;

  // Fetch past export jobs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobRows } = await (supabase as any)
    .from("export_jobs")
    .select("id, job_type, status, download_url, created_at, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobs = (jobRows ?? []).map((j: any) => ({
    id: j.id as string,
    job_type: j.job_type as string,
    status: j.status as string,
    download_url: j.download_url as string | null,
    created_at: j.created_at as string,
    expires_at: j.expires_at as string | null,
  }));

  // Filter out expired jobs
  const now = new Date();
  const validJobs = jobs.filter(
    (j: { status: string; expires_at: string | null }) =>
      j.status !== "complete" || !j.expires_at || new Date(j.expires_at) > now
  );

  return (
    <ExportClient
      jobs={validJobs}
      deletionRequestedAt={deletionRequestedAt}
      tier={tier}
    />
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import YearInReviewClient from "./year-in-review-client";

export const metadata = { title: "Year in Review" };

export default async function YearInReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch profile for tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier = profile?.subscription_tier ?? "free";

  // Fetch year in review records, newest first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: years } = await (supabase as any)
    .from("year_in_review")
    .select("year, charles_reflection, content_json, email_sent_at")
    .eq("user_id", user.id)
    .order("year", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold text-stone-800">Year in Review</h1>
      <YearInReviewClient years={years ?? []} tier={tier} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpgradeClient from "./upgrade-client";
import type { SubscriptionTier } from "@/lib/tier";

export const metadata = {
  title: "Upgrade | Bible Study",
};

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const currentTier: SubscriptionTier =
    (profile?.subscription_tier as SubscriptionTier | null) ?? "free";

  return <UpgradeClient currentTier={currentTier} />;
}

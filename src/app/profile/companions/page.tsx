import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CompanionsClient from "./companions-client";

export const metadata = {
  title: "Companions | Bible Study",
};

export default async function CompanionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, active_companion_id")
    .eq("id", user.id)
    .single();

  const currentTier = (profile?.subscription_tier as string | null) ?? "free";
  const activeCompanionId = (profile?.active_companion_id as string | null) ?? null;

  // Load all active companion definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allCompanions } = await (supabase as any)
    .from("companion_definitions")
    .select("id, slug, display_name, tagline, tradition, price_usd, is_default, is_custom")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Load user's purchased companions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userCompanions } = await (supabase as any)
    .from("user_companions")
    .select("companion_id")
    .eq("user_id", user.id);

  const ownedIds = new Set<string>(
    (userCompanions ?? []).map((uc: { companion_id: string }) => uc.companion_id)
  );

  // Only show non-custom defs in the store (custom ones are user-specific)
  type CompanionRow = {
    id: string; slug: string; display_name: string; tagline: string | null;
    tradition: string | null; price_usd: number; is_default: boolean; is_custom: boolean;
  };
  const filteredCompanions = ((allCompanions ?? []) as CompanionRow[]).filter(
    (c) => !c.is_custom || ownedIds.has(c.id)
  );

  return (
    <CompanionsClient
      companions={filteredCompanions.map((c) => ({
        id: c.id as string,
        slug: c.slug as string,
        display_name: c.display_name as string,
        tagline: (c.tagline as string | null) ?? null,
        tradition: (c.tradition as string | null) ?? null,
        price_usd: (c.price_usd as number) ?? 0,
        is_default: (c.is_default as boolean) ?? false,
        is_custom: (c.is_custom as boolean) ?? false,
      }))}
      ownedIds={ownedIds}
      currentTier={currentTier}
      activeCompanionId={activeCompanionId}
    />
  );
}

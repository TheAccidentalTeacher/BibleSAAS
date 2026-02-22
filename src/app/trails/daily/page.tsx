import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import DailyTrailsClient from "./daily-client";

export const metadata = { title: "Daily Trails — Bible Study App" };

export default async function DailyTrailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <>
      <DailyTrailsClient />
      <BottomNav />
    </>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import ThreadTheNeedleClient from "./thread-client";

export const metadata = { title: "Thread the Needle — Bible Study App" };

export default async function NewTrailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <>
      <ThreadTheNeedleClient />
      <BottomNav />
    </>
  );
}

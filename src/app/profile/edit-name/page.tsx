import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/bottom-nav";
import EditNameForm from "./edit-name-form";

export const metadata = { title: "Edit Display Name" };

export default async function EditNamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 border-b"
        style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
      >
        <Link href="/profile" className="text-sm" style={{ color: "var(--color-text-2)" }}>‹ Profile</Link>
        <h1 className="text-base font-semibold" style={{ color: "var(--color-text-1)" }}>Edit Display Name</h1>
      </header>

      <EditNameForm currentName={profile?.display_name ?? ""} />

      <BottomNav />
    </div>
  );
}

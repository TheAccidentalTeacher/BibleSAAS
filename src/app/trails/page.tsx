import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import { GitFork } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Trails — Bible Study App" };

export default async function TrailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center pb-20 px-6 text-center"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        <GitFork size={48} style={{ color: "var(--color-text-3)", marginBottom: "1rem" }} />
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Trails
        </h1>
        <p className="text-sm max-w-xs" style={{ color: "var(--color-text-3)" }}>
          Cross-reference trails that surface the hidden connections in Scripture.
          Coming in Phase 10.
        </p>
      </main>
      <BottomNav />
    </>
  );
}

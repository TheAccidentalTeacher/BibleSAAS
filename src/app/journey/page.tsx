import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/bottom-nav";
import { MapTrifold } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Journey — Bible Study App" };

export default async function JourneyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <>
      <main
        className="min-h-screen flex flex-col items-center justify-center pb-20 px-6 text-center"
        style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
      >
        <MapTrifold size={48} style={{ color: "var(--color-text-3)", marginBottom: "1rem" }} />
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Journey
        </h1>
        <p className="text-sm max-w-xs" style={{ color: "var(--color-text-3)" }}>
          Your spiritual journey map — characters, geography, and the arc of Scripture.
          Coming in Phase 9.
        </p>
      </main>
      <BottomNav />
    </>
  );
}

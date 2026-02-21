import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root route — redirects to /dashboard (authenticated) or /auth/login.
 * The middleware handles session refreshing; this just decides the destination.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}

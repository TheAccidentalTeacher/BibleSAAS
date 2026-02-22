import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ChatSessionRow, ChatMessageRow } from "@/types/database";
import ChatView from "./chat-view";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Load session
  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (sessionError || !session) redirect("/profile/chats");

  // Load messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, suggested_questions, created_at")
    .eq("session_id", sessionId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true });

  return (
    <ChatView
      session={session as ChatSessionRow}
      initialMessages={(messages ?? []) as ChatMessageRow[]}
    />
  );
}

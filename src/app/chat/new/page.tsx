import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  searchParams: Promise<{ book?: string; chapter?: string }>;
}

/**
 * /chat/new
 * Creates a new chat session (optionally anchored to a passage) and redirects
 * to the chat view.
 */
export default async function NewChatPage({ searchParams }: Props) {
  const { book, chapter } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      anchor_book: book ?? null,
      anchor_chapter: chapter ? parseInt(chapter, 10) : null,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/profile/chats");

  redirect(`/chat/${data.id as string}`);
}

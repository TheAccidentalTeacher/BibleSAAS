import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ book: string; chapter: string }>;
}

/**
 * /read/[book]/[chapter]/chat
 *
 * Creates a chat session anchored to the given chapter and immediately
 * redirects to the chat view. This is the entry point from the reading
 * screen "Chat with Charles" button.
 */
export default async function ReadingChatPage({ params }: Props) {
  const { book, chapter } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum)) redirect(`/read/${book}/1`);

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      anchor_book: book,
      anchor_chapter: chapterNum,
    })
    .select("id")
    .single();

  if (error || !data) redirect(`/read/${book}/${chapter}`);

  redirect(`/chat/${data.id as string}`);
}

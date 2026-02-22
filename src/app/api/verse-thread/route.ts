import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// GET /api/verse-thread?book=&chapter=&verse=
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");
  const chapter = Number(searchParams.get("chapter") ?? "0");
  const verse = Number(searchParams.get("verse") ?? "0");

  // Find family membership
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ messages: [], has_threads: [] });

  if (book && chapter && verse) {
    // Full thread for a specific verse
    const { data: messages } = await supabase
      .from("verse_thread_messages")
      .select("id, sender_id, book, chapter, verse, body, parent_id, read_by, created_at, meta")
      .eq("family_unit_id", membership.family_unit_id)
      .eq("book", book)
      .eq("chapter", chapter)
      .eq("verse", verse)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    // Enrich with sender display names
    const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
    const { data: profiles } = senderIds.length
      ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", senderIds)
      : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    const enriched = (messages ?? []).map((m) => ({
      ...m,
      sender_name: profileMap[m.sender_id]?.display_name ?? "Member",
      sender_avatar: profileMap[m.sender_id]?.avatar_url ?? null,
      is_mine: m.sender_id === user.id,
    }));

    return NextResponse.json({ messages: enriched });
  }

  if (book && chapter) {
    // Which verses have threads for this chapter?
    const { data: rows } = await supabase
      .from("verse_thread_messages")
      .select("verse")
      .eq("family_unit_id", membership.family_unit_id)
      .eq("book", book)
      .eq("chapter", chapter)
      .is("deleted_at", null);

    const verses = [...new Set((rows ?? []).map((r) => r.verse))];
    return NextResponse.json({ has_threads: verses });
  }

  return NextResponse.json({ messages: [], has_threads: [] });
}

// POST /api/verse-thread
// Body: { book, chapter, verse, body, parent_id? }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id")
    .eq("user_id", user.id)
    .single();
  if (!membership) return NextResponse.json({ error: "Not in a family unit" }, { status: 400 });

  const body = await req.json() as {
    book: string;
    chapter: number;
    verse: number;
    body: string;
    parent_id?: string;
  };

  const { data: message, error } = await supabase
    .from("verse_thread_messages")
    .insert({
      family_unit_id: membership.family_unit_id,
      sender_id: user.id,
      book: body.book,
      chapter: body.chapter,
      verse: body.verse,
      body: body.body.slice(0, 1000),
      parent_id: body.parent_id ?? null,
    })
    .select("id, sender_id, book, chapter, verse, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email notification to other family members
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@localhost";

    // Get sender name
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    const senderName = senderProfile?.display_name ?? "Someone";

    // Get other members' emails
    const { data: otherMembers } = await supabase
      .from("family_members")
      .select("user_id")
      .eq("family_unit_id", membership.family_unit_id)
      .neq("user_id", user.id);

    if (otherMembers && otherMembers.length > 0) {
      const otherIds = otherMembers.map((m) => m.user_id);
      const { data: otherProfiles } = await supabase
        .from("profiles")
        .select("email, display_name")
        .in("id", otherIds);

      for (const profile of otherProfiles ?? []) {
        if (!profile.email) continue;
        const deepLink = `/read/${body.book}/${body.chapter}?verse=${body.verse}&thread=open`;
        await resend.emails.send({
          from: fromEmail,
          to: profile.email,
          subject: `${senderName} left you a note on ${body.book} ${body.chapter}:${body.verse}`,
          html: `
            <p>Hi ${profile.display_name ?? "friend"},</p>
            <p><strong>${senderName}</strong> sent you a verse note:</p>
            <blockquote style="border-left:4px solid #ccc; padding-left:12px; color:#555;">${body.body}</blockquote>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}${deepLink}">Open in Bible Study App →</a></p>
          `,
        });
      }
    }
  } catch {
    // Email failure is non-fatal in dev
  }

  return NextResponse.json({ message });
}

// PATCH /api/verse-thread — mark messages as read
// Body: { message_ids: string[] }
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message_ids } = await req.json() as { message_ids: string[] };
  if (!message_ids?.length) return NextResponse.json({ ok: true });

  const now = new Date().toISOString();
  for (const id of message_ids) {
    // Fetch current read_by, then update with this user's timestamp
    const { data: msg } = await supabase
      .from("verse_thread_messages")
      .select("read_by")
      .eq("id", id)
      .single();
    if (msg) {
      const readBy = (msg.read_by as Record<string, string> | null) ?? {};
      if (!readBy[user.id]) {
        readBy[user.id] = now;
        await supabase
          .from("verse_thread_messages")
          .update({ read_by: readBy })
          .eq("id", id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

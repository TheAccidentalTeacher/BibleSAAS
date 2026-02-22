"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Copy, Check, MessageSquare, Hand,
  Loader2, Send, LogOut, Settings
} from "lucide-react";
import {
  postGroupThreadMessage,
  addGroupPrayer,
  markPrayerAnswered,
  leaveGroup,
  updateMemberSettings,
} from "../actions";

interface ThreadMessage {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  display_name: string;
}

interface Thread {
  id: string;
  verse_ref: string;
  book: string;
  chapter: number;
  verse: number | null;
  messages: ThreadMessage[];
}

interface PrayerRequest {
  id: string;
  user_id: string;
  body: string;
  verse_ref: string | null;
  is_answered: boolean;
  created_at: string;
  display_name: string;
}

interface Member {
  user_id: string;
  display_name: string;
  role: string;
  highlights_visible: boolean;
  prayer_visible: boolean;
}

interface GroupDetailClientProps {
  groupId: string;
  groupName: string;
  inviteCode: string;
  groupType: string;
  threads: Thread[];
  prayers: PrayerRequest[];
  members: Member[];
  currentUserId: string;
  myRole: string;
  myHighlightsVisible: boolean;
  myPrayerVisible: boolean;
}

type TabType = "threads" | "prayer";

export default function GroupDetailClient({
  groupId,
  groupName,
  inviteCode,
  groupType,
  threads,
  prayers,
  members,
  currentUserId,
  myHighlightsVisible,
  myPrayerVisible,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabType>("threads");
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Thread reply
  const [replyingThread, setReplyingThread] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  // Prayer form
  const [prayerBody, setPrayerBody] = useState("");
  const [prayerVerse, setPrayerVerse] = useState("");
  const [showPrayerForm, setShowPrayerForm] = useState(false);

  // Settings state
  const [highlightsVisible, setHighlightsVisible] = useState(myHighlightsVisible);
  const [prayerVisible, setPrayerVisible] = useState(myPrayerVisible);

  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingThread && replyRef.current) replyRef.current.focus();
  }, [replyingThread]);

  function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReply(threadId: string, verseRef: string) {
    if (!replyBody.trim()) return;
    const [bookChapter, verseStr] = verseRef.split(":");
    const parts = bookChapter!.trim().split(" ");
    const verseNum = parseInt(verseStr ?? "1", 10);
    const chapter = parseInt(parts[parts.length - 1] ?? "1", 10);
    const book = parts.slice(0, -1).join(" ");

    startTransition(async () => {
      await postGroupThreadMessage({
        groupId,
        book,
        chapter,
        verse: verseNum,
        body: replyBody,
      });
      setReplyBody("");
      setReplyingThread(null);
      router.refresh();
    });
  }

  function handlePrayer() {
    if (!prayerBody.trim()) return;
    startTransition(async () => {
      await addGroupPrayer({
        groupId,
        body: prayerBody.trim(),
        verseRef: prayerVerse.trim() || undefined,
      });
      setPrayerBody("");
      setPrayerVerse("");
      setShowPrayerForm(false);
      router.refresh();
    });
  }

  function handleMarkAnswered(prayerId: string) {
    startTransition(async () => {
      await markPrayerAnswered(prayerId);
      router.refresh();
    });
  }

  function handleLeave() {
    if (!confirm("Leave this group?")) return;
    startTransition(async () => {
      await leaveGroup(groupId);
      router.push("/profile/groups");
    });
  }

  function handleSaveSettings() {
    startTransition(async () => {
      await updateMemberSettings({
        groupId,
        highlightsVisible,
        prayerVisible,
      });
      setShowSettings(false);
      router.refresh();
    });
  }

  const activePrayers = prayers.filter((p) => !p.is_answered);
  const answeredPrayers = prayers.filter((p) => p.is_answered);

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D0D0D]/95 backdrop-blur border-b border-[#1A1A1A] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile/groups" className="text-[#6B6056] hover:text-[#E8E0D4]">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-[#E8E0D4] font-semibold text-sm leading-tight">{groupName}</h1>
              <p className="text-[#4A4040] text-xs capitalize">{groupType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1.5 text-xs text-[#8A7F72] border border-[#2C2C2C] px-2.5 py-1 rounded-full hover:border-[#C4A040] transition-all"
            >
              {copied ? <Check size={11} className="text-[#C4A040]" /> : <Copy size={11} />}
              {inviteCode}
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="text-[#6B6056] hover:text-[#E8E0D4] p-1"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Settings panel */}
        {showSettings && (
          <div className="mb-4 rounded-xl border border-[#2C2C2C] bg-[#141414] p-4 space-y-3">
            <h3 className="text-[#E8E0D4] font-medium text-sm">My Privacy Settings</h3>

            {[
              { id: "hl", value: highlightsVisible, set: setHighlightsVisible, label: "Share my highlights with the group" },
              { id: "pr", value: prayerVisible, set: setPrayerVisible, label: "Allow group to see my prayer requests" },
            ].map(({ id, value, set, label }) => (
              <label key={id} className="flex items-center justify-between cursor-pointer">
                <span className="text-[#B8AFA4] text-xs">{label}</span>
                <span className="relative inline-block w-9 h-5 ml-3 shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                  />
                  <span className="block bg-[#2C2C2C] rounded-full h-5 w-9 peer-checked:bg-[#C4A040] transition-colors" />
                  <span className="absolute left-0.5 top-0.5 bg-white rounded-full w-4 h-4 transition-transform peer-checked:translate-x-4" />
                </span>
              </label>
            ))}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveSettings}
                disabled={isPending}
                className="flex-1 py-1.5 text-xs bg-[#C4A040] text-[#0D0D0D] font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Save
              </button>
              <button
                onClick={handleLeave}
                className="px-3 py-1.5 text-xs text-red-400 border border-red-900/40 rounded-lg hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
              >
                <LogOut size={11} />
                Leave
              </button>
            </div>
          </div>
        )}

        {/* Members pill */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {members.map((m) => (
            <span
              key={m.user_id}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                m.user_id === currentUserId
                  ? "border-[#C4A040] text-[#C4A040]"
                  : "border-[#2C2C2C] text-[#6B6056]"
              }`}
            >
              {m.display_name}
              {m.role === "leader" && <span className="ml-1 opacity-60">✦</span>}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-[#141414] border border-[#2C2C2C] rounded-full p-1">
          {(["threads", "prayer"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-full capitalize transition-all ${
                tab === t ? "bg-[#C4A040] text-[#0D0D0D]" : "text-[#8A7F72]"
              }`}
            >
              {t === "threads" ? `Verse Threads (${threads.length})` : `Prayer (${activePrayers.length})`}
            </button>
          ))}
        </div>

        {/* ── Verse Threads ── */}
        {tab === "threads" && (
          <div className="space-y-4">
            {threads.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="text-[#2C2C2C] mx-auto mb-3" size={36} strokeWidth={1.5} />
                <p className="text-[#6B6056] text-sm">No verse threads yet.</p>
                <p className="text-[#4A4040] text-xs mt-1">
                  Start a thread from the reading screen — tap a verse and choose &ldquo;Group Thread.&rdquo;
                </p>
              </div>
            )}
            {threads.map((thread) => (
              <div key={thread.id} className="rounded-xl border border-[#2C2C2C] bg-[#141414]">
                {/* Thread header */}
                <div className="px-4 py-3 border-b border-[#1A1A1A]">
                  <Link
                    href={`/read/${thread.book}/${thread.chapter}`}
                    className="text-[#C4A040] text-xs font-medium hover:underline"
                  >
                    {thread.verse_ref}
                  </Link>
                </div>

                {/* Messages */}
                <div className="divide-y divide-[#1A1A1A]">
                  {thread.messages.map((msg) => (
                    <div key={msg.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium ${
                            msg.user_id === currentUserId ? "text-[#C4A040]" : "text-[#8A7F72]"
                          }`}
                        >
                          {msg.display_name}
                        </span>
                        <span className="text-[#3A3A3A] text-xs">
                          {new Date(msg.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-[#B8AFA4] text-sm leading-relaxed">{msg.body}</p>
                    </div>
                  ))}
                </div>

                {/* Reply area */}
                {replyingThread === thread.id ? (
                  <div className="px-4 py-3 border-t border-[#1A1A1A]">
                    <textarea
                      ref={replyRef}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Add to the thread…"
                      rows={2}
                      className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040] resize-none mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReplyingThread(null); setReplyBody(""); }}
                        className="flex-1 py-1.5 text-xs text-[#6B6056] border border-[#2C2C2C] rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(thread.id, thread.verse_ref)}
                        disabled={isPending || !replyBody.trim()}
                        className="flex-1 py-1.5 text-xs bg-[#C4A040] text-[#0D0D0D] font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isPending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingThread(thread.id)}
                    className="w-full px-4 py-2.5 text-left text-xs text-[#6B6056] hover:text-[#C4A040] border-t border-[#1A1A1A] transition-colors"
                  >
                    + Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Prayer ── */}
        {tab === "prayer" && (
          <div className="space-y-4">
            {/* Add prayer */}
            {!showPrayerForm ? (
              <button
                onClick={() => setShowPrayerForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#2C2C2C] text-[#6B6056] text-xs hover:border-[#C4A040] hover:text-[#C4A040] transition-all"
              >
                <Hand size={13} />
                Add Prayer Request
              </button>
            ) : (
              <div className="rounded-xl border border-[#2C2C2C] bg-[#141414] p-4 space-y-3">
                <textarea
                  value={prayerBody}
                  onChange={(e) => setPrayerBody(e.target.value)}
                  placeholder="What would you like the group to pray about?"
                  rows={3}
                  autoFocus
                  className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040] resize-none"
                />
                <input
                  type="text"
                  value={prayerVerse}
                  onChange={(e) => setPrayerVerse(e.target.value)}
                  placeholder="Verse ref (optional, e.g. Psalm 23:1)"
                  className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-xs text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrayerForm(false)}
                    className="flex-1 py-1.5 text-xs text-[#6B6056] border border-[#2C2C2C] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePrayer}
                    disabled={isPending || !prayerBody.trim()}
                    className="flex-1 py-1.5 text-xs bg-[#C4A040] text-[#0D0D0D] font-semibold rounded-lg disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Active prayers */}
            {activePrayers.length === 0 && (
              <div className="text-center py-10">
                <Hand className="text-[#2C2C2C] mx-auto mb-3" size={36} strokeWidth={1.5} />
                <p className="text-[#6B6056] text-sm">No active prayer requests.</p>
              </div>
            )}
            {activePrayers.map((p) => (
              <div key={p.id} className="rounded-xl border border-[#2C2C2C] bg-[#141414] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium mb-1 ${
                        p.user_id === currentUserId ? "text-[#C4A040]" : "text-[#8A7F72]"
                      }`}
                    >
                      {p.display_name}
                    </p>
                    <p className="text-[#B8AFA4] text-sm leading-relaxed">{p.body}</p>
                    {p.verse_ref && (
                      <p className="text-[#6B6056] text-xs mt-1.5">{p.verse_ref}</p>
                    )}
                  </div>
                  {p.user_id === currentUserId && (
                    <button
                      onClick={() => handleMarkAnswered(p.id)}
                      disabled={isPending}
                      className="shrink-0 text-xs text-[#6B6056] border border-[#2C2C2C] px-2.5 py-1 rounded-full hover:border-[#C4A040] hover:text-[#C4A040] transition-all"
                    >
                      ✓ Answered
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Answered prayers */}
            {answeredPrayers.length > 0 && (
              <details className="mt-4">
                <summary className="text-[#4A4040] text-xs cursor-pointer select-none">
                  {answeredPrayers.length} answered prayer{answeredPrayers.length !== 1 ? "s" : ""}
                </summary>
                <div className="mt-2 space-y-2">
                  {answeredPrayers.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] p-3 opacity-60"
                    >
                      <p className="text-[#6B6056] text-xs font-medium mb-0.5">{p.display_name}</p>
                      <p className="text-[#8A7F72] text-xs leading-relaxed line-through">{p.body}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

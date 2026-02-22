"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, LogIn, Users, Loader2 } from "lucide-react";
import { createGroup, joinGroup, type GroupType } from "./actions";

interface GroupSummary {
  id: string;
  name: string;
  invite_code: string;
  group_type: string;
  memberCount: number;
  myRole: string;
}

interface GroupsClientProps {
  groups: GroupSummary[];
  displayName: string | null;
}

export default function GroupsClient({ groups, displayName }: GroupsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"create" | "join" | null>(null);

  // Create form
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<GroupType>("friends");
  const [myDisplayName, setMyDisplayName] = useState(displayName ?? "");

  // Join form
  const [inviteCode, setInviteCode] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState(displayName ?? "");

  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!groupName.trim()) { setError("Group name is required"); return; }
    if (!myDisplayName.trim()) { setError("Your display name is required"); return; }
    setError(null);
    startTransition(async () => {
      try {
        const result = await createGroup({
          name: groupName,
          groupType,
          displayName: myDisplayName,
        });
        router.push(`/profile/groups/${result.groupId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create group");
      }
    });
  }

  function handleJoin() {
    if (!inviteCode.trim()) { setError("Enter an invite code"); return; }
    if (!joinDisplayName.trim()) { setError("Your display name is required"); return; }
    setError(null);
    startTransition(async () => {
      try {
        const result = await joinGroup({ inviteCode, displayName: joinDisplayName });
        router.push(`/profile/groups/${result.groupId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to join group");
      }
    });
  }

  const GROUP_TYPE_LABELS: Record<string, string> = {
    family: "Family",
    church: "Church",
    friends: "Friends",
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#E8E0D4]">Study Groups</h1>
          <p className="text-[#6B6056] text-sm mt-1">
            Share Scripture with the people you do life with.
          </p>
        </div>

        {/* My groups */}
        {groups.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[#8A7F72] text-xs font-semibold uppercase tracking-widest mb-3">
              Your Groups
            </h2>
            <div className="space-y-2">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/profile/groups/${g.id}`}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-[#2C2C2C] bg-[#141414] hover:border-[#C4A040]/40 transition-all"
                >
                  <div>
                    <p className="text-[#E8E0D4] font-medium text-sm">{g.name}</p>
                    <p className="text-[#6B6056] text-xs mt-0.5">
                      {GROUP_TYPE_LABELS[g.group_type] ?? g.group_type} ·{" "}
                      {g.memberCount} {g.memberCount === 1 ? "member" : "members"}
                      {g.myRole === "leader" && " · Leader"}
                    </p>
                  </div>
                  <span className="text-[#6B6056]">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Action buttons */}
        {mode === null && (
          <div className="flex gap-3">
            <button
              onClick={() => setMode("create")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2C2C2C] bg-[#141414] text-[#E8E0D4] text-sm font-medium hover:border-[#C4A040] transition-all"
            >
              <Plus size={15} />
              Create Group
            </button>
            <button
              onClick={() => setMode("join")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#2C2C2C] bg-[#141414] text-[#E8E0D4] text-sm font-medium hover:border-[#C4A040] transition-all"
            >
              <LogIn size={15} />
              Join with Code
            </button>
          </div>
        )}

        {/* Create form */}
        {mode === "create" && (
          <div className="rounded-xl border border-[#2C2C2C] bg-[#141414] p-5 space-y-4">
            <h3 className="text-[#E8E0D4] font-semibold text-sm flex items-center gap-2">
              <Users size={14} />
              New Study Group
            </h3>

            <div>
              <label className="text-[#8A7F72] text-xs block mb-1">Group name</label>
              <input
                type="text"
                placeholder="e.g. Wednesday Morning Group"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040]"
              />
            </div>

            <div>
              <label className="text-[#8A7F72] text-xs block mb-1">Group type</label>
              <div className="flex gap-2">
                {(["friends", "family", "church"] as GroupType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGroupType(t)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all capitalize ${
                      groupType === t
                        ? "border-[#C4A040] text-[#C4A040] bg-[#C4A040]/10"
                        : "border-[#2C2C2C] text-[#8A7F72] hover:border-[#3C3C3C]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#8A7F72] text-xs block mb-1">
                Your display name in this group
              </label>
              <input
                type="text"
                value={myDisplayName}
                onChange={(e) => setMyDisplayName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040]"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMode(null); setError(null); }}
                className="flex-1 py-2 text-xs text-[#8A7F72] border border-[#2C2C2C] rounded-lg hover:text-[#E8E0D4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex-1 py-2 text-xs bg-[#C4A040] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#D4B050] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        )}

        {/* Join form */}
        {mode === "join" && (
          <div className="rounded-xl border border-[#2C2C2C] bg-[#141414] p-5 space-y-4">
            <h3 className="text-[#E8E0D4] font-semibold text-sm flex items-center gap-2">
              <LogIn size={14} />
              Join a Group
            </h3>

            <div>
              <label className="text-[#8A7F72] text-xs block mb-1">Invite code</label>
              <input
                type="text"
                placeholder="6-character code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040] tracking-widest font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-[#8A7F72] text-xs block mb-1">
                Your display name in this group
              </label>
              <input
                type="text"
                value={joinDisplayName}
                onChange={(e) => setJoinDisplayName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-2 text-sm text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040]"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setMode(null); setError(null); }}
                className="flex-1 py-2 text-xs text-[#8A7F72] border border-[#2C2C2C] rounded-lg hover:text-[#E8E0D4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={isPending}
                className="flex-1 py-2 text-xs bg-[#C4A040] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#D4B050] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Join
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {groups.length === 0 && mode === null && (
          <div className="mt-12 text-center">
            <Users className="text-[#2C2C2C] mx-auto mb-3" size={40} strokeWidth={1.5} />
            <p className="text-[#6B6056] text-sm">No groups yet.</p>
            <p className="text-[#4A4040] text-xs mt-1">
              Create one or ask someone for their invite code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

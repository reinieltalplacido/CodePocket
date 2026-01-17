// app/dashboard/groups/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiUsers, FiCalendar } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import CreateGroupModal from "@/components/CreateGroupModal";
import LoadingState from "@/components/LoadingState";
import type { GroupWithMembers } from "@/lib/types/groups";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/groups", {
        credentials: "include",
        headers: {
          ...(session?.access_token && {
            "Authorization": `Bearer ${session.access_token}`
          })
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 md:text-2xl">
            Your Groups
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {groups.length} group{groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          Create Group
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <LoadingState message="Loading groups..." />
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
          <FiUsers className="mb-3 h-12 w-12 text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-300">
            No groups yet
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Create your first group to start collaborating
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => router.push(`/dashboard/groups/${group.id}`)}
              className="group cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all hover:border-emerald-500/30 hover:bg-white/10"
            >
              {/* Group Icon & Badge */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <FiUsers className="h-6 w-6" />
                </div>
                {group.is_owner && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                    Owner
                  </span>
                )}
              </div>

              {/* Group Info */}
              <h3 className="mb-1 font-semibold text-slate-100 line-clamp-1">
                {group.name}
              </h3>
              {group.description && (
                <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                  {group.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <FiUsers className="h-3.5 w-3.5" />
                  <span>
                    {group.member_count || 0} member{group.member_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(group.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
}

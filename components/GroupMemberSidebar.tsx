// components/GroupMemberSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiX, FiUserMinus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import MemberProfileCard from "./MemberProfileCard";
import type { GroupMember } from "@/lib/types/groups";

type GroupMemberSidebarProps = {
  groupId: string;
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
  onRemoveMember?: () => void;
};

export default function GroupMemberSidebar({
  groupId,
  ownerId,
  currentUserId,
  isOwner,
  onRemoveMember,
}: GroupMemberSidebarProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Detect mobile and collapse sidebar by default
  useEffect(() => {
    const checkMobile = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/groups/${groupId}/members`, {
        credentials: "include",
        headers: {
          ...(session?.access_token && {
            "Authorization": `Bearer ${session.access_token}`
          })
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setMembers(members.filter((m) => m.user_id !== userId));
        onRemoveMember?.();
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const getInitials = (email: string, metadata?: any) => {
    const fullName = metadata?.full_name;
    if (fullName) {
      const parts = fullName.split(" ");
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : fullName.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (email: string, metadata?: any) => {
    return metadata?.full_name || email.split("@")[0];
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    
    // Simple hash function to get consistent color for user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col border-l border-white/10 bg-black">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex h-12 items-center justify-center border-b border-white/10 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          title="Show members"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
          <FiUsers className="h-5 w-5 text-slate-400" />
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            {members.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-l border-white/10 bg-black">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <FiUsers className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            Members ({members.length})
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          title="Hide members"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-slate-500">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-slate-500">No members yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {members.map((member) => {
              const user = member.users;
              const profile = member.profiles;
              const isCurrentUser = member.user_id === currentUserId;
              const isMemberOwner = member.user_id === ownerId;
              
              // Get display name from profile data
              const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "User";
              
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.user_id)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                >
                  {/* Avatar */}
                  <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {displayName.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {displayName}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button (only for owner, can't remove self or other owner) */}
                  {isOwner && !isMemberOwner && !isCurrentUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(member.user_id);
                      }}
                      className="opacity-0 rounded p-1 text-red-400 transition-all hover:bg-red-500/20 group-hover:opacity-100"
                      title="Remove member"
                    >
                      <FiUserMinus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Profile Card */}
      <MemberProfileCard
        isOpen={!!selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        userId={selectedMemberId || ""}
        onEditProfile={selectedMemberId === currentUserId ? () => {
          setSelectedMemberId(null);
          // You can add a callback here to open the profile settings modal
        } : undefined}
      />
    </div>
  );
}

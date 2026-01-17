// components/NotificationsDropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiBell, FiMail, FiCheck, FiX, FiUsers } from "react-icons/fi";

type Invitation = {
  id: string;
  group_id: string;
  email: string;
  created_at: string;
  expires_at: string;
  groups: {
    id: string;
    name: string;
    description: string | null;
  };
};

export default function NotificationsDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/invitations", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (invitationId: string, action: "accept" | "decline") => {
    try {
      setActionLoading(invitationId);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Not authenticated");
        return;
      }

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ invitation_id: invitationId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove invitation from list
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
        
        // If accepted, redirect to the group
        if (action === "accept" && data.group_id) {
          router.push(`/dashboard/groups/${data.group_id}`);
          setIsOpen(false);
        }
      } else {
        alert(data.error || "Failed to process invitation");
      }
    } catch (error) {
      console.error("Error processing invitation:", error);
      alert("Failed to process invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
        title="Notifications"
      >
        <FiBell className="h-5 w-5" />
        {invitations.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">
            {invitations.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-white/10 bg-zinc-950 shadow-2xl">
            {/* Header */}
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">
                  Notifications
                </h3>
                {invitations.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {invitations.length} pending
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">Loading...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="p-8 text-center">
                  <FiBell className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                  <p className="text-sm text-slate-400">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-4 transition-colors hover:bg-white/5"
                    >
                      <div className="mb-2 flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <FiUsers className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100">
                            Group Invitation
                          </p>
                          <p className="text-sm text-slate-300">
                            You've been invited to join{" "}
                            <span className="font-semibold">
                              {invitation.groups.name}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(invitation.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(invitation.id, "accept")}
                          disabled={actionLoading === invitation.id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                        >
                          <FiCheck className="h-3.5 w-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(invitation.id, "decline")}
                          disabled={actionLoading === invitation.id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-50"
                        >
                          <FiX className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

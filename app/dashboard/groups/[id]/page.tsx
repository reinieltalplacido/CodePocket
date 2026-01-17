// app/dashboard/groups/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { FiSettings, FiUserPlus, FiArrowLeft, FiCode, FiShare2, FiPlus, FiActivity } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import GroupMemberSidebar from "@/components/GroupMemberSidebar";
import GroupSettingsModal from "@/components/GroupSettingsModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import CreateGroupSnippetModal from "@/components/CreateGroupSnippetModal";
import ActivityFeed from "@/components/ActivityFeed";
import Toast from "@/components/Toast";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { getErrorMessage } from "@/lib/errors";
import type { Group, GroupSnippet } from "@/lib/types/groups";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function GroupPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createSnippetModalOpen, setCreateSnippetModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"snippets" | "activity">("snippets");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchGroupData();
    getCurrentUser();
  }, [resolvedParams.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        ...(session?.access_token && {
          "Authorization": `Bearer ${session.access_token}`
        })
      };

      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${resolvedParams.id}`, {
        credentials: "include",
        headers
      });
      const groupData = await groupResponse.json();
      
      if (groupResponse.ok) {
        setGroup(groupData.group);
        setIsOwner(groupData.group.is_owner);
      } else {
        throw new Error(groupData.error);
      }

      // Fetch group snippets
      const snippetsResponse = await fetch(`/api/groups/${resolvedParams.id}/snippets`, {
        credentials: "include",
        headers
      });
      const snippetsData = await snippetsResponse.json();
      
      if (snippetsResponse.ok) {
        setSnippets(snippetsData.snippets || []);
      }
    } catch (error: any) {
      console.error("Error fetching group:", error);
      setToast({
        show: true,
        message: error.message || "Failed to load group",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGroupUpdate = () => {
    fetchGroupData();
    setToast({
      show: true,
      message: "Group updated successfully",
      type: "success",
    });
  };

  const handleGroupDelete = () => {
    setToast({
      show: true,
      message: "Group deleted successfully",
      type: "success",
    });
    setTimeout(() => {
      router.push("/dashboard/groups");
    }, 1000);
  };

  const handleInviteSuccess = () => {
    setToast({
      show: true,
      message: "Invitation sent successfully",
      type: "success",
    });
  };

  const handleSnippetCreated = () => {
    fetchGroupData();
    setToast({
      show: true,
      message: "Snippet created and shared successfully",
      type: "success",
    });
  };

  const prettyLanguage = (id: string | undefined): string => {
    if (!id) return "Unknown";
    
    switch (id) {
      case "javascript":
        return "JavaScript";
      case "typescript":
        return "TypeScript";
      case "javascriptreact":
        return "JSX";
      case "typescriptreact":
        return "TSX";
      case "json":
        return "JSON";
      case "plaintext":
        return "Plain text";
      default:
        return id.charAt(0).toUpperCase() + id.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading group...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="mb-4 text-sm text-slate-400">Group not found</p>
        <button
          onClick={() => router.push("/dashboard/groups")}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/groups")}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-0.5 text-sm text-slate-400">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              <FiUserPlus className="h-4 w-4" />
              Invite
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <FiSettings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Snippets Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4 sm:p-6">
          {/* Tabs */}
          <div className="mb-6 flex items-center gap-1 border-b border-white/10">
            <button
              onClick={() => setActiveTab("snippets")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "snippets"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <FiCode className="h-4 w-4" />
              Snippets
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                {snippets.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "activity"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <FiActivity className="h-4 w-4" />
              Activity
            </button>
          </div>

          {/* Snippets Tab */}
          {activeTab === "snippets" && (
            <>
              {/* Header with Actions */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-100">
                  Shared Snippets
                </h2>
                <button
                  onClick={() => setCreateSnippetModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
                >
                  <FiPlus className="h-4 w-4" />
                  Create Snippet
                </button>
              </div>

              {snippets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
                  <FiCode className="mb-3 h-12 w-12 text-slate-600" />
                  <h3 className="mb-1 text-lg font-semibold text-slate-300">
                    No snippets shared yet
                  </h3>
                  <p className="mb-4 text-sm text-slate-500">
                    Create your first snippet for this group
                  </p>
                  <button
                    onClick={() => setCreateSnippetModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
                  >
                    <FiPlus className="h-4 w-4" />
                    Create Snippet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {snippets.map((groupSnippet) => {
                    const snippet = groupSnippet.snippets;
                    if (!snippet) return null;

                    return (
                      <div
                        key={groupSnippet.id}
                        onClick={() => router.push(`/dashboard/snippet/${snippet.id}`)}
                        className="group cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4 transition-all hover:border-emerald-500/30 hover:bg-white/10"
                      >
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-slate-100 line-clamp-1">
                            {snippet.title}
                          </h3>
                          <span className="flex-shrink-0 rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                            {prettyLanguage(snippet.language)}
                          </span>
                        </div>

                        {snippet.description && (
                          <p className="mb-2 text-sm text-slate-400 line-clamp-2">
                            {snippet.description}
                          </p>
                        )}

                        <div className="mb-2">
                          <CodeBlock
                            code={snippet.code}
                            language={snippet.language}
                            showLineNumbers={false}
                            maxHeight="150px"
                            className="text-xs sm:text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <FiShare2 className="h-3 w-3" />
                            <span>
                              {new Date(groupSnippet.shared_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <ActivityFeed groupId={resolvedParams.id} />
          )}
          </div>
        </div>

        {/* Discord-style Member Sidebar */}
        <GroupMemberSidebar
          groupId={resolvedParams.id}
          ownerId={group.owner_id}
          currentUserId={currentUserId}
          isOwner={isOwner}
          onRemoveMember={fetchGroupData}
        />
      </div>

      {/* Modals */}
      <GroupSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        group={group}
        isOwner={isOwner}
        onUpdate={handleGroupUpdate}
        onDelete={handleGroupDelete}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        groupId={resolvedParams.id}
        groupName={group.name}
        onSuccess={handleInviteSuccess}
      />

      <CreateGroupSnippetModal
        isOpen={createSnippetModalOpen}
        onClose={() => setCreateSnippetModalOpen(false)}
        groupId={resolvedParams.id}
        groupName={group.name}
        onSuccess={handleSnippetCreated}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}

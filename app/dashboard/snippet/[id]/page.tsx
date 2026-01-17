"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { FiArrowLeft, FiCopy, FiTrash2, FiEdit2, FiCheck, FiStar, FiUsers } from "react-icons/fi";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  created_at: string;
  is_favorite?: boolean;
  group_snippets?: Array<{
    group_id: string;
    groups: {
      id: string;
      name: string;
    };
  }>;
};

export default function SnippetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [sharingToGroup, setSharingToGroup] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSnippet();
    fetchGroups();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("snippets")
      .select(`
        *,
        group_snippets (
          group_id,
          groups (
            id,
            name
          )
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setSnippet(data);
    }
    setLoading(false);
  };

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("group_members")
      .select(`
        groups (
          id,
          name
        )
      `)
      .eq("user_id", user.id);

    if (data) {
      setGroups(data.map((item: any) => item.groups).filter(Boolean));
    }
  };

  const handleShareToGroup = async (groupId: string) => {
    setSharingToGroup(groupId);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`/api/groups/${groupId}/snippets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ snippet_id: id }),
    });

    setSharingToGroup(null);

    if (response.ok) {
      setToast({
        show: true,
        message: "Snippet shared to group successfully!",
        type: "success",
      });
      setShowShareModal(false);
      fetchSnippet(); // Refresh to update group_snippets
    } else {
      const error = await response.json();
      setToast({
        show: true,
        message: error.error || "Failed to share snippet",
        type: "error",
      });
    }
  };

  const handleCopy = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setToast({
        show: true,
        message: "Code copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);

    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
      return;
    }

    setToast({
      show: true,
      message: "Snippet deleted successfully!",
      type: "success",
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const toggleFavorite = async () => {
    if (!snippet) return;

    const newFavoriteState = !snippet.is_favorite;

    // Optimistic update
    setSnippet({ ...snippet, is_favorite: newFavoriteState });

    const { error } = await supabase
      .from("snippets")
      .update({ is_favorite: newFavoriteState })
      .eq("id", id);

    if (error) {
      // Revert on error
      setSnippet({ ...snippet, is_favorite: !newFavoriteState });
      setToast({
        show: true,
        message: "Failed to update favorite",
        type: "error",
      });
    } else {
      setToast({
        show: true,
        message: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        type: "success",
      });
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  if (loading) {
    return <LoadingState message="Loading snippet..." />;
  }

  if (!snippet) {
    return (
      <ErrorState
        title="Snippet Not Found"
        message="The snippet you're looking for doesn't exist or has been deleted."
        actionLabel="Back to Dashboard"
        onAction={() => router.push("/dashboard")}
      />
    );
  }

  const lines = snippet.code.split("\n").length;

  return (
    <>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">
                {snippet.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Created {new Date(snippet.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiStar
                className={`h-4 w-4 ${
                  snippet.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
              {snippet.is_favorite ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              {copied ? (
                <>
                  <FiCheck className="h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              <FiUsers className="h-4 w-4" />
              Share to Group
            </button>
            <button
              onClick={() => router.push(`/dashboard/snippet/${id}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 sm:px-4"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Language badge */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
              {snippet.language}
            </span>
            
            {snippet.group_snippets && snippet.group_snippets.length > 0 && (
              <span 
                className="flex items-center gap-1.5 rounded bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300"
                title={`Shared to ${snippet.group_snippets.length} group${snippet.group_snippets.length > 1 ? 's' : ''}: ${snippet.group_snippets.map(gs => gs.groups.name).join(', ')}`}
              >
                <FiUsers className="h-3.5 w-3.5" />
                Shared to {snippet.group_snippets.length} group{snippet.group_snippets.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Description */}
          {snippet.description && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-300">
                Description
              </h2>
              <p className="text-sm text-slate-400">{snippet.description}</p>
            </div>
          )}

          {/* Code */}
          <div>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Code</h2>
            <CodeBlock
              code={snippet.code}
              language={snippet.language}
              showLineNumbers={true}
              maxHeight="500px"
            />
          </div>

          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-300">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Snippet"
        message="Are you sure you want to delete this snippet? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Share to Group Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowShareModal(false)}
          />
          <div 
            className="relative w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Share to Group</h2>
            
            {groups.length === 0 ? (
              <p className="text-sm text-slate-400">You are not a member of any groups yet.</p>
            ) : (
              <div className="space-y-2">
                {groups.map((group: any) => (
                  <button
                    key={group.id}
                    onClick={() => handleShareToGroup(group.id)}
                    disabled={sharingToGroup === group.id}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    {sharingToGroup === group.id ? "Sharing..." : group.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 w-full rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

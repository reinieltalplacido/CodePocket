"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import ConfirmModal from "@/components/ConfirmModal";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { useVault } from "@/contexts/VaultContext";
import { useToast } from "@/contexts/ToastContext";
import { prettyLanguage } from "@/lib/languages";
import { FiArrowLeft, FiCopy, FiTrash2, FiEdit2, FiCheck, FiStar, FiFolder } from "react-icons/fi";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  created_at: string;
  is_favorite?: boolean;
  folder_id: string | null;
};

export default function SnippetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  const { folders, notifyMutation } = useVault();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [movingFolder, setMovingFolder] = useState(false);

  useEffect(() => {
    void fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setSnippet(data);
    }
    setLoading(false);
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    setMovingFolder(true);
    const { error } = await supabase
      .from("snippets")
      .update({ folder_id: folderId })
      .eq("id", id);

    setMovingFolder(false);
    setShowFolderDropdown(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setSnippet(prev => prev ? { ...prev, folder_id: folderId } : null);
    notifyMutation("snippets");
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : "No folder";
    showToast(`Moved to ${folderName || "No folder"}`, "success");
  };

  const handleCopy = () => {
    if (snippet) {
      void navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      showToast("Code copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);

    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    notifyMutation("snippets");
    showToast("Snippet moved to Archive", "success");
    router.push("/dashboard");
  };

  const toggleFavorite = async () => {
    if (!snippet) return;

    const newFavoriteState = !snippet.is_favorite;

    setSnippet({ ...snippet, is_favorite: newFavoriteState });

    const { error } = await supabase
      .from("snippets")
      .update({ is_favorite: newFavoriteState })
      .eq("id", id);

    if (error) {
      setSnippet({ ...snippet, is_favorite: !newFavoriteState });
      showToast("Failed to update favorite", "error");
    } else {
      notifyMutation("snippets");
      showToast(newFavoriteState ? "Added to favorites" : "Removed from favorites", "success");
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0D1015] text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100"
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold text-slate-100 sm:text-2xl">
                {snippet.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-400">
                Created {new Date(snippet.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleFavorite}
              className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0D1015] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
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
              type="button"
              onClick={handleCopy}
              className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0D1015] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                disabled={movingFolder}
                className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/[0.1] bg-[#0D1015] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
              >
                <FiFolder className="h-4 w-4" />
                {movingFolder ? "Moving..." : "Folder"}
              </button>
              {showFolderDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFolderDropdown(false)} />
                  <div className="cp-dropdown-in absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]">
                    <div className="custom-scrollbar max-h-64 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => handleMoveToFolder(null)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.06] ${
                          !snippet.folder_id ? "text-emerald-400" : "text-slate-300"
                        }`}
                      >
                        {!snippet.folder_id && "✓ "}<span className="text-slate-400">No Folder</span>
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => handleMoveToFolder(folder.id)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.06] ${
                            snippet.folder_id === folder.id ? "text-emerald-400" : "text-slate-300"
                          }`}
                        >
                          {snippet.folder_id === folder.id && "✓ "}{folder.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/snippet/${id}/edit`)}
              className="flex min-h-[38px] items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-[#050608] transition-colors hover:bg-emerald-400"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Archive snippet"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Language badge */}
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-emerald-300">
              {prettyLanguage(snippet.language)}
            </span>
            {snippet.folder_id && folders.find(f => f.id === snippet.folder_id) && (
              <span className="rounded bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
                <FiFolder className="mr-1 inline h-3 w-3" />
                {folders.find(f => f.id === snippet.folder_id)?.name}
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
        title="Archive Snippet"
        message={`Move "${snippet.title}" to Archive? You can restore it anytime.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

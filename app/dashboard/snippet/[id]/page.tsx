"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
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

type Folder = {
  id: string;
  name: string;
  color: string;
};

export default function SnippetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [movingFolder, setMovingFolder] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSnippet();
    fetchFolders();
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

  const fetchFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (data) setFolders(data);
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
      setToast({ show: true, message: error.message, type: "error" });
      return;
    }

    setSnippet(prev => prev ? { ...prev, folder_id: folderId } : null);
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : "No folder";
    setToast({ show: true, message: `Moved to ${folderName || "No folder"}`, type: "success" });
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
            <div className="relative">
              <button
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                disabled={movingFolder}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                <FiFolder className="h-4 w-4" />
                {movingFolder ? "Moving..." : "Move to Folder"}
              </button>
              {showFolderDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFolderDropdown(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
                    <div className="max-h-64 overflow-y-auto py-1">
                      <button
                        onClick={() => handleMoveToFolder(null)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                          !snippet.folder_id ? "text-emerald-400" : "text-slate-300"
                        }`}
                      >
                        {!snippet.folder_id && "✓ "}<span className="text-slate-500">No Folder</span>
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => handleMoveToFolder(folder.id)}
                          className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
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
        title="Delete Snippet"
        message="Are you sure you want to delete this snippet? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

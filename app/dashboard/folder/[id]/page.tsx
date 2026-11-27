"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiFolder, FiPlus, FiTrash2 } from "react-icons/fi";
import { useVault, type SnippetRecord } from "@/contexts/VaultContext";
import SnippetCard from "@/components/SnippetCard";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingState from "@/components/LoadingState";
import { useToast } from "@/contexts/ToastContext";

const FOLDER_DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.id as string;
  const { showToast } = useToast();
  const {
    folders,
    snippets,
    loading,
    preferences,
    toggleFavorite,
    moveSnippetToFolder,
    archiveSnippet,
    deleteFolder,
  } = useVault();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<SnippetRecord | null>(null);

  const folder = useMemo(
    () => folders.find((f) => f.id === folderId) ?? null,
    [folderId, folders]
  );

  const folderSnippets = useMemo(
    () => snippets.filter((s) => s.folder_id === folderId),
    [folderId, snippets]
  );

  const handleDeleteFolder = async () => {
    setShowDeleteConfirm(false);
    const res = await deleteFolder(folderId);
    if (!res.ok) {
      showToast(res.error || "Failed to delete folder", "error");
      return;
    }
    router.push("/dashboard");
  };

  const confirmArchiveSnippet = async () => {
    if (!snippetToDelete) return;
    const target = snippetToDelete;
    setSnippetToDelete(null);
    await archiveSnippet(target);
  };

  if (loading && !folder) {
    return <LoadingState message="Loading folder..." />;
  }

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0D12] px-6 py-16 text-center">
        <FiFolder className="mb-3 h-8 w-8 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-200">Folder not found</h2>
        <p className="mt-1 text-sm text-slate-400">
          This folder may have been deleted.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-4 min-h-[40px] rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] hover:bg-emerald-400"
        >
          Back to All Snippets
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to snippets"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0D1015] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`h-3 w-3 rounded-full ${
                  FOLDER_DOT_COLORS[folder.color] || FOLDER_DOT_COLORS.emerald
                }`}
              />
              <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold text-slate-100 md:text-2xl">
                {folder.name}
              </h2>
            </div>
            {folder.description && (
              <p className="mt-1 text-sm text-slate-400">{folder.description}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              {folderSnippets.length}{" "}
              {folderSnippets.length === 1 ? "snippet" : "snippets"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/new")}
            className="flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            New Snippet
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete folder"
            title="Delete folder"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {folderSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0D12] px-6 py-16 text-center">
          <p className="text-sm text-slate-400">No snippets in this folder yet.</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/new")}
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] hover:bg-emerald-400"
          >
            <FiPlus className="h-4 w-4" />
            Create Snippet
          </button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${
            preferences.density === "compact" ? "gap-3" : "gap-4"
          }`}
        >
          {folderSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              density={preferences.density}
              folders={folders}
              onToggleFavorite={(s) => void toggleFavorite(s)}
              onMoveToFolder={(id, nextFolderId) =>
                void moveSnippetToFolder(id, nextFolderId)
              }
              onRequestDelete={setSnippetToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete folder"
        message={`Delete "${folder.name}"? Snippets inside will remain in your vault without a folder.`}
        confirmText="Delete Folder"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => void handleDeleteFolder()}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={Boolean(snippetToDelete)}
        title="Archive snippet"
        message={
          snippetToDelete
            ? `Move "${snippetToDelete.title}" to Archive? You can restore it anytime.`
            : ""
        }
        confirmText="Archive"
        cancelText="Cancel"
        variant="warning"
        onConfirm={() => void confirmArchiveSnippet()}
        onCancel={() => setSnippetToDelete(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { useVault, type SnippetRecord } from "@/contexts/VaultContext";
import SnippetCard from "@/components/SnippetCard";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingState from "@/components/LoadingState";

export default function ArchivePage() {
  const {
    archivedSnippets,
    archiveLoading,
    preferences,
    refreshArchive,
    toggleFavorite,
    restoreSnippet,
    purgeSnippet,
  } = useVault();

  const [snippetToRestore, setSnippetToRestore] = useState<SnippetRecord | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<SnippetRecord | null>(null);

  useEffect(() => {
    void refreshArchive();
  }, [refreshArchive]);

  const confirmRestore = async () => {
    if (!snippetToRestore) return;
    const target = snippetToRestore;
    setSnippetToRestore(null);
    await restoreSnippet(target);
  };

  const confirmPermanentDelete = async () => {
    if (!snippetToDelete) return;
    const target = snippetToDelete;
    setSnippetToDelete(null);
    await purgeSnippet(target);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
          Archive
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {archivedSnippets.length} archived snippet
          {archivedSnippets.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
        <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="text-sm text-slate-300">
          <p className="font-medium text-amber-300">Archived snippets</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Items here stay recoverable until permanently deleted.
          </p>
        </div>
      </div>

      {archiveLoading && archivedSnippets.length === 0 ? (
        <LoadingState message="Loading archived snippets..." />
      ) : archivedSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0D12] px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0D1015]">
            <FiTrash2 className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">Archive is empty</h3>
          <p className="mt-1 text-sm text-slate-400">
            Deleted snippets appear here for safe recovery.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${
            preferences.density === "compact" ? "gap-3" : "gap-4"
          }`}
        >
          {archivedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              mode="archive"
              density={preferences.density}
              onToggleFavorite={(s) => void toggleFavorite(s)}
              onRestore={setSnippetToRestore}
              onPermanentDelete={setSnippetToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(snippetToRestore)}
        title="Restore snippet"
        message={
          snippetToRestore
            ? `Restore "${snippetToRestore.title}" back to your active vault?`
            : ""
        }
        confirmText="Restore"
        cancelText="Cancel"
        variant="info"
        onConfirm={() => void confirmRestore()}
        onCancel={() => setSnippetToRestore(null)}
      />

      <ConfirmModal
        isOpen={Boolean(snippetToDelete)}
        title="Delete snippet permanently"
        message={
          snippetToDelete
            ? `Permanently delete "${snippetToDelete.title}"? This cannot be undone.`
            : ""
        }
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => void confirmPermanentDelete()}
        onCancel={() => setSnippetToDelete(null)}
      />
    </div>
  );
}

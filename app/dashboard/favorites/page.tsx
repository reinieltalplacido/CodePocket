"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiSearch, FiStar, FiX } from "react-icons/fi";
import { useVault, type SnippetRecord } from "@/contexts/VaultContext";
import SnippetCard from "@/components/SnippetCard";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingState from "@/components/LoadingState";

export default function FavoritesPage() {
  const router = useRouter();
  const {
    snippets,
    folders,
    loading,
    preferences,
    toggleFavorite,
    moveSnippetToFolder,
    archiveSnippet,
  } = useVault();

  const [searchQuery, setSearchQuery] = useState("");
  const [snippetToDelete, setSnippetToDelete] = useState<SnippetRecord | null>(null);

  const favoriteSnippets = useMemo(
    () => snippets.filter((s) => Boolean(s.is_favorite)),
    [snippets]
  );

  const filteredSnippets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return favoriteSnippets;
    return favoriteSnippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q) ?? false)
    );
  }, [favoriteSnippets, searchQuery]);

  const confirmArchive = async () => {
    if (!snippetToDelete) return;
    const target = snippetToDelete;
    setSnippetToDelete(null);
    await archiveSnippet(target);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            Favorite Snippets
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {favoriteSnippets.length} favorite snippet
            {favoriteSnippets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/new")}
          className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          New Snippet
        </button>
      </div>

      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-h-[42px] w-full rounded-lg border border-white/[0.08] bg-[#090B0E] py-2 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search query"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-white/[0.08] hover:text-slate-100"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading favorites..." />
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0D12] px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0D1015]">
            <FiStar className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {searchQuery ? "No matching favorites" : "No favorites pinned yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {searchQuery
              ? "Try another search query."
              : "Click the star button on any snippet to pin it here for quick access."}
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${
            preferences.density === "compact" ? "gap-3" : "gap-4"
          }`}
        >
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              density={preferences.density}
              folders={folders}
              onToggleFavorite={(s) => void toggleFavorite(s)}
              onMoveToFolder={(id, folderId) => void moveSnippetToFolder(id, folderId)}
              onRequestDelete={setSnippetToDelete}
            />
          ))}
        </div>
      )}

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
        onConfirm={() => void confirmArchive()}
        onCancel={() => setSnippetToDelete(null)}
      />
    </div>
  );
}

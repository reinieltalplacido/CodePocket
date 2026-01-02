  "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiTrash2, FiRotateCcw, FiAlertCircle, FiStar } from "react-icons/fi";
import Toast from "@/components/Toast";
import CodeBlock from "@/components/CodeBlock";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  created_at: string;
  deleted_at: string;
  folder_id: string | null;
  is_favorite?: boolean;
  source?: string | null;
  folders?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

function prettyLanguage(id: string | undefined): string {
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
}

export default function ArchivePage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  
  // Restore confirmation state
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [snippetToRestore, setSnippetToRestore] = useState<Snippet | null>(null);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  useEffect(() => {
    fetchDeletedSnippets();
  }, []);

  const fetchDeletedSnippets = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("snippets")
      .select(`
        *,
        folders (
          id,
          name,
          color
        )
      `)
      .eq("user_id", user.id)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (!error && data) {
      setSnippets(data as Snippet[]);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const openRestoreConfirm = (snippet: Snippet) => {
    setSnippetToRestore(snippet);
    setConfirmRestoreOpen(true);
  };

  const closeRestoreConfirm = () => {
    setConfirmRestoreOpen(false);
    setSnippetToRestore(null);
  };

  const confirmRestore = async () => {
    if (!snippetToRestore) return;

    const { error } = await supabase
      .from("snippets")
      .update({ deleted_at: null })
      .eq("id", snippetToRestore.id);

    if (error) {
      showToast(`Failed to restore snippet: ${error.message}`, "error");
    } else {
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToRestore.id));
      showToast("Snippet restored successfully!", "success");
    }

    closeRestoreConfirm();
  };

  const openConfirm = (snippet: Snippet) => {
    setSnippetToDelete(snippet);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSnippetToDelete(null);
  };

  const confirmPermanentDelete = async () => {
    if (!snippetToDelete) return;

    const { error } = await supabase
      .from("snippets")
      .delete()
      .eq("id", snippetToDelete.id);

    if (error) {
      showToast(`Failed to delete snippet: ${error.message}`, "error");
    } else {
      setSnippets((prev) => prev.filter((s) => s.id !== snippetToDelete.id));
    }

    closeConfirm();
  };

  const toggleFavorite = async (snippet: Snippet) => {
    const newFavoriteState = !snippet.is_favorite;

    // Optimistic update
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === snippet.id ? { ...s, is_favorite: newFavoriteState } : s
      )
    );

    const { error } = await supabase
      .from("snippets")
      .update({ is_favorite: newFavoriteState })
      .eq("id", snippet.id);

    if (error) {
      // Revert on error
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippet.id ? { ...s, is_favorite: !newFavoriteState } : s
        )
      );
      showToast("Failed to update favorite", "error");
    } else {
      showToast(
        newFavoriteState ? "Added to favorites" : "Removed from favorites",
        "success"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Archive</h1>
          <p className="mt-1 text-sm text-slate-400">
            {snippets.length} archived snippet{snippets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <div className="text-sm text-slate-300">
          <p className="font-medium text-amber-400">Archived items</p>
          <p className="mt-1 text-slate-400">
            Archived snippets are stored here. You can restore them or permanently delete them.
          </p>
        </div>
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-400">Loading archived snippets...</p>
        </div>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
          <FiTrash2 className="mb-3 h-12 w-12 text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-300">
            Archive is empty
          </h3>
          <p className="text-sm text-slate-500">
            No archived snippets to show
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snippets.map((snippet) => (
            <ArchiveSnippetCard
              key={snippet.id}
              snippet={snippet}
              onRestore={openRestoreConfirm}
              onPermanentDelete={openConfirm}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Confirm restore modal */}
      {confirmRestoreOpen && snippetToRestore && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-100">
              Restore snippet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to restore{" "}
              <span className="font-semibold text-slate-100">
                {snippetToRestore.title}
              </span>
              ? It will be moved back to your snippets.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeRestoreConfirm}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm permanent delete modal */}
      {confirmOpen && snippetToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-100">
              Permanently delete snippet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-100">
                {snippetToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeConfirm}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmPermanentDelete}
                className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-red-400"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}

function ArchiveSnippetCard({
  snippet,
  onRestore,
  onPermanentDelete,
  onToggleFavorite,
}: {
  snippet: Snippet;
  onRestore: (snippet: Snippet) => void;
  onPermanentDelete: (snippet: Snippet) => void;
  onToggleFavorite: (snippet: Snippet) => void;
}) {
  const tags = Array.isArray(snippet.tags) ? snippet.tags : [];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(snippet);
  };

  return (
    <div className="relative group">
      {/* Action buttons */}
      <div className="absolute top-0 right-0 flex justify-end pr-4 z-10">
        <div className="mt-[-0.6rem] flex gap-1 rounded-full bg-black/80 px-1.5 py-1 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleFavoriteClick}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-black"
            title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiStar
              className={`h-3.5 w-3.5 ${
                snippet.is_favorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-100"
              }`}
            />
          </button>
          <button
            onClick={() => onRestore(snippet)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-emerald-400 hover:bg-emerald-500/20"
            title="Restore snippet"
          >
            <FiRotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPermanentDelete(snippet)}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-red-400 hover:bg-red-500/20"
            title="Delete permanently"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 pt-5 opacity-60 transition-all hover:opacity-100">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-medium text-slate-100 line-clamp-1">
              {snippet.title}
            </h3>

            {/* Folder + tags row */}
            <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
              {snippet.folders && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5">
                  <span className="text-xs">📁</span>
                  <span>{snippet.folders.name}</span>
                </span>
              )}

              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5"
                >
                  <span className="text-xs">🏷️</span>
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {prettyLanguage(snippet.language)}
            </span>

            {snippet.source && (
              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                {snippet.source === "vscode" ? "VS Code" : "Web"}
              </span>
            )}
          </div>
        </div>

        {snippet.description && (
          <p className="mb-3 line-clamp-2 text-xs text-slate-400">
            {snippet.description}
          </p>
        )}
        <div className="mb-3">
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            showLineNumbers={false}
            maxHeight="100px"
          />
        </div>
        <div className="text-xs text-slate-500">
          Archived {new Date(snippet.deleted_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

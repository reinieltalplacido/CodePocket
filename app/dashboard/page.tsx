// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiPlus, FiSearch, FiCode, FiCopy, FiTrash2, FiStar, FiUsers } from "react-icons/fi";
import Toast from "@/components/Toast";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { getErrorMessage } from "@/lib/errors";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  created_at: string;
  folder_id: string | null;
  is_favorite?: boolean;
  source?: string | null;
  folders?: {
    id: string;
    name: string;
    color: string;
  } | null;
  group_snippets?: Array<{
    group_id: string;
    groups: {
      id: string;
      name: string;
    };
  }>;
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

export default function DashboardPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchSnippets();
  }, []);

  // realtime inserts/deletes/updates
  useEffect(() => {
    const channel = supabase
      .channel("snippets-dashboard")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "snippets" },
        (payload) => {
          setSnippets((prev) => [
            payload.new as Snippet,
            ...prev.filter((s) => s.id !== (payload.new as any).id),
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "snippets" },
        (payload) => {
          // If snippet was soft deleted (deleted_at is not null), remove from list
          if ((payload.new as any).deleted_at !== null) {
            setSnippets((prev) =>
              prev.filter((s) => s.id !== (payload.new as any).id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "snippets" },
        (payload) => {
          setSnippets((prev) =>
            prev.filter((s) => s.id !== (payload.old as any).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("snippets")
        .select(`
          *,
          folders (
            id,
            name,
            color
          ),
          group_snippets (
            group_id,
            groups (
              id,
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setSnippets(data || []);
    } catch (err) {
      console.error("Error fetching snippets:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openConfirm = (snippet: Snippet) => {
    setSnippetToDelete(snippet);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSnippetToDelete(null);
  };

  const confirmDelete = async () => {
  if (!snippetToDelete) return;

  const snippetTitle = snippetToDelete.title;

  // Soft delete: set deleted_at to current timestamp
  const { error } = await supabase
    .from("snippets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", snippetToDelete.id);

  if (error) {
    console.error(error);
    setToast({
      show: true,
      message: "Failed to archive snippet",
      type: "error",
    });
  } else {
    setToast({
      show: true,
      message: `"${snippetTitle}" moved to Archive`,
      type: "success",
    });
  }

  closeConfirm(); // modal closes; realtime will update list
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 md:text-2xl">
            Your snippets
          </h1>
          <p className="mt-1 text-sm text-slate-400 whitespace-nowrap">
            {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/new")}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 sm:w-auto"
        >
          <FiPlus className="h-4 w-4" />
          New Snippet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
        />
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <LoadingState message="Loading your snippets..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSnippets} />
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
          <FiCode className="mb-3 h-12 w-12 text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-300">
            {searchQuery ? "No snippets found" : "No snippets yet"}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            {searchQuery
              ? "Try a different search term"
              : "Create your first snippet to get started"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push("/dashboard/new")}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              <FiPlus className="h-4 w-4" />
              New Snippet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onRequestDelete={openConfirm}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmOpen && snippetToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-100">
              Archive snippet
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to archive{" "}
              <span className="font-semibold text-slate-100">
                {snippetToDelete.title}
              </span>
              ? You can restore it from the Archive later.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeConfirm}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}

function SnippetCard({
  snippet,
  onRequestDelete,
  onToggleFavorite,
}: {
  snippet: Snippet;
  onRequestDelete: (snippet: Snippet) => void;
  onToggleFavorite: (snippet: Snippet) => void;
}) {
  const router = useRouter();
  const tags = Array.isArray(snippet.tags) ? snippet.tags : [];

  const handleOpen = () => {
    router.push(`/dashboard/snippet/${snippet.id}`);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(snippet.code);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(snippet);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestDelete(snippet);
  };

  return (
    <div className="relative group">
      {/* Icon actions pinned on top border, right side, only on hover */}
      <div className="pointer-events-none absolute top-0 right-0 flex justify-end pr-4">
        <div className="mt-[-0.6rem] flex gap-1 rounded-full bg-black/80 px-1.5 py-1 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleFavoriteClick}
            className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-black"
            title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FiStar className={`h-3.5 w-3.5 ${
              snippet.is_favorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-100"
            }`} />
          </button>
          <button
            onClick={handleCopy}
            className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-slate-100 hover:bg-black"
            title="Copy code"
          >
            <FiCopy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-red-400 hover:bg-red-500/20"
            title="Delete snippet"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        onClick={handleOpen}
        className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 pt-4 sm:p-4 sm:pt-5 transition-all hover:border-emerald-500/30 hover:bg-white/10 h-[380px] flex flex-col"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
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

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {prettyLanguage(snippet.language)}
            </span>

            {snippet.source && (
              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                {snippet.source === "vscode" ? "VS Code" : "Web"}
              </span>
            )}

            {snippet.group_snippets && snippet.group_snippets.length > 0 && (
              <span 
                className="flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-300"
                title={`Shared to ${snippet.group_snippets.length} group${snippet.group_snippets.length > 1 ? 's' : ''}`}
              >
                <FiUsers className="h-2.5 w-2.5" />
                {snippet.group_snippets.length}
              </span>
            )}
          </div>
        </div>

        {snippet.description && (
          <div className="mb-3">
            <p className="line-clamp-2 text-xs text-slate-400">
              {snippet.description}
            </p>
          </div>
        )}
        <div className="mb-3 h-[180px] sm:h-[240px]">
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            showLineNumbers={false}
            maxHeight="240px"
            className="text-xs sm:text-sm h-full"
          />
        </div>
        <div className="text-xs text-slate-500 mt-auto">
          {new Date(snippet.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

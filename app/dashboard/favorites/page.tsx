"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiSearch, FiCode, FiStar } from "react-icons/fi";
import Toast from "@/components/Toast";
import CodeBlock from "@/components/CodeBlock";
import LoadingState from "@/components/LoadingState";

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

export default function FavoritesPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("favorites-snippets")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "snippets" },
        (payload) => {
          const updated = payload.new as Snippet;
          if (updated.is_favorite) {
            // Add to favorites if not already there
            setSnippets((prev) => {
              const exists = prev.find((s) => s.id === updated.id);
              if (exists) {
                return prev.map((s) => (s.id === updated.id ? updated : s));
              }
              return [updated, ...prev];
            });
          } else {
            // Remove from favorites
            setSnippets((prev) => prev.filter((s) => s.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFavorites = async () => {
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
      .eq("is_favorite", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSnippets(data as Snippet[]);
    }
    setLoading(false);
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
        message: newFavoriteState
          ? "Added to favorites"
          : "Removed from favorites",
        type: "success",
      });
    }
  };

  const filteredSnippets = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Favorite Snippets
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {snippets.length} favorite snippet{snippets.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
        />
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <LoadingState message="Loading favorites..." />
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
          <FiStar className="mb-3 h-12 w-12 text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-300">
            {searchQuery ? "No favorites found" : "No favorites yet"}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            {searchQuery
              ? "Try a different search term"
              : "Star snippets to add them to your favorites"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onToggleFavorite={toggleFavorite}
            />
          ))}
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
  onToggleFavorite,
}: {
  snippet: Snippet;
  onToggleFavorite: (snippet: Snippet) => void;
}) {
  const router = useRouter();
  const tags = Array.isArray(snippet.tags) ? snippet.tags : [];

  const handleOpen = () => {
    router.push(`/dashboard/snippet/${snippet.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(snippet);
  };

  return (
    <div className="relative group">
      {/* Star button */}
      <div className="pointer-events-none absolute top-0 right-0 flex justify-end pr-4">
        <div className="mt-[-0.6rem] flex gap-1 rounded-full bg-black/80 px-1.5 py-1 shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleFavoriteClick}
            className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-black"
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
        </div>
      </div>

      <div
        onClick={handleOpen}
        className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 pt-5 transition-all hover:border-emerald-500/30 hover:bg-white/10"
      >
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
            maxHeight="120px"
            className="text-xs"
          />
        </div>
        <div className="text-xs text-slate-500">
          {new Date(snippet.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

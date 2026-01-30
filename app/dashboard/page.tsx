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
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchSnippets();
    
    // Load saved filter preferences from localStorage
    const savedLanguage = localStorage.getItem('dashboard_language_filter');
    const savedDateRange = localStorage.getItem('dashboard_date_filter');
    
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
    if (savedDateRange) {
      setSelectedDateRange(savedDateRange);
    }
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setLanguageDropdownOpen(false);
      setDateDropdownOpen(false);
    };
    
    if (languageDropdownOpen || dateDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [languageDropdownOpen, dateDropdownOpen]);

  // Save language filter preference to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_language_filter', selectedLanguage);
  }, [selectedLanguage]);

  // Save date range filter preference to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_date_filter', selectedDateRange);
  }, [selectedDateRange]);

  // Extract unique languages from snippets
  const uniqueLanguages = Array.from(
    new Set(snippets.map((s) => s.language))
  ).sort();

  // Date range options
  const dateRanges = [
    { value: "all", label: "All Time" },
    { value: "recently", label: "Recently Added" },
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "quarter", label: "Last 90 Days" },
  ];

  // Filter snippets by search, language, and date range
  const filteredSnippets = snippets
    .filter((s) => {
      // Search filter
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Language filter
      const matchesLanguage =
        selectedLanguage === "all" || s.language === selectedLanguage;
      
      // Date range filter
      let matchesDateRange = true;
      if (selectedDateRange !== "all") {
        const now = new Date();
        const snippetDate = new Date(s.created_at);
        const daysDiff = Math.floor(
          (now.getTime() - snippetDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (selectedDateRange) {
          case "today":
            matchesDateRange = daysDiff === 0;
            break;
          case "week":
            matchesDateRange = daysDiff <= 7;
            break;
          case "month":
            matchesDateRange = daysDiff <= 30;
            break;
          case "quarter":
            matchesDateRange = daysDiff <= 90;
            break;
          case "recently":
            // Recently added will be handled by sorting
            matchesDateRange = true;
            break;
        }
      }

      return matchesSearch && matchesLanguage && matchesDateRange;
    })
    .sort((a, b) => {
      // Sort by recently added if selected
      if (selectedDateRange === "recently") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Default sort (already sorted by created_at desc from query)
      return 0;
    });

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

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Filter */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLanguageDropdownOpen(!languageDropdownOpen);
                setDateDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition-all hover:border-emerald-500/30 hover:bg-white/10"
            >
              <FiCode className="h-4 w-4" />
              <span>
                {selectedLanguage === "all"
                  ? "All Languages"
                  : prettyLanguage(selectedLanguage)}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  languageDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {languageDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
                <div className="max-h-64 overflow-y-auto p-1">
                  <button
                    onClick={() => {
                      setSelectedLanguage("all");
                      setLanguageDropdownOpen(false);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      selectedLanguage === "all"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    All Languages
                    <span className="ml-2 text-xs text-slate-500">
                      ({snippets.length})
                    </span>
                  </button>
                  {uniqueLanguages.map((lang) => {
                    const count = snippets.filter((s) => s.language === lang).length;
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selectedLanguage === lang
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {prettyLanguage(lang)}
                        <span className="ml-2 text-xs text-slate-500">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateDropdownOpen(!dateDropdownOpen);
                setLanguageDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition-all hover:border-emerald-500/30 hover:bg-white/10"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {dateRanges.find((d) => d.value === selectedDateRange)?.label ||
                  "All Time"}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  dateDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dateDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
                <div className="p-1">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setSelectedDateRange(range.value);
                        setDateDropdownOpen(false);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        selectedDateRange === range.value
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {(selectedLanguage !== "all" || selectedDateRange !== "all") && (
            <button
              onClick={() => {
                setSelectedLanguage("all");
                setSelectedDateRange("all");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedLanguage !== "all" || selectedDateRange !== "all") && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Active filters:</span>
            {selectedLanguage !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                <FiCode className="h-3 w-3" />
                {prettyLanguage(selectedLanguage)}
                <button
                  onClick={() => setSelectedLanguage("all")}
                  className="ml-0.5 hover:text-emerald-300"
                >
                  ×
                </button>
              </span>
            )}
            {selectedDateRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-400">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {dateRanges.find((d) => d.value === selectedDateRange)?.label}
                <button
                  onClick={() => setSelectedDateRange("all")}
                  className="ml-0.5 hover:text-sky-300"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
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

// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiChevronDown, FiCode, FiLayers, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useVault, type SnippetRecord } from "@/contexts/VaultContext";
import { prettyLanguage } from "@/lib/languages";
import SnippetCard from "@/components/SnippetCard";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";

const DATE_RANGES = [
  { value: "all", label: "All Time" },
  { value: "recently", label: "Recently Added" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "quarter", label: "Last 90 Days" },
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    snippets,
    folders,
    loading,
    error,
    preferences,
    refreshAll,
    toggleFavorite,
    moveSnippetToFolder,
    archiveSnippet,
  } = useVault();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedSource, setSelectedSource] = useState<"all" | "vscode" | "web">("all");
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<SnippetRecord | null>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("dashboard_language_filter");
    const savedDateRange = localStorage.getItem("dashboard_date_filter");
    if (savedLanguage) setSelectedLanguage(savedLanguage);
    if (savedDateRange) setSelectedDateRange(savedDateRange);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard_language_filter", selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem("dashboard_date_filter", selectedDateRange);
  }, [selectedDateRange]);

  useEffect(() => {
    if (!languageDropdownOpen && !dateDropdownOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLanguageDropdownOpen(false);
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [languageDropdownOpen, dateDropdownOpen]);

  const uniqueLanguages = useMemo(
    () => Array.from(new Set(snippets.map((s) => s.language))).sort(),
    [snippets]
  );

  const hasActiveFilters =
    selectedLanguage !== "all" ||
    selectedDateRange !== "all" ||
    selectedSource !== "all" ||
    searchQuery.trim().length > 0;

  const filteredSnippets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const nowMs = Date.now();

    return snippets
      .filter((s) => {
        const matchesSearch =
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.description?.toLowerCase().includes(q) ?? false) ||
          (Array.isArray(s.tags) && s.tags.some((t) => t.toLowerCase().includes(q)));

        const matchesLanguage =
          selectedLanguage === "all" || s.language === selectedLanguage;

        const matchesSource =
          selectedSource === "all" ||
          (selectedSource === "vscode"
            ? s.source === "vscode"
            : s.source !== "vscode");

        let matchesDateRange = true;
        if (selectedDateRange !== "all" && selectedDateRange !== "recently") {
          const daysDiff = Math.floor(
            (nowMs - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (selectedDateRange === "today") matchesDateRange = daysDiff === 0;
          else if (selectedDateRange === "week") matchesDateRange = daysDiff <= 7;
          else if (selectedDateRange === "month") matchesDateRange = daysDiff <= 30;
          else if (selectedDateRange === "quarter") matchesDateRange = daysDiff <= 90;
        }

        return matchesSearch && matchesLanguage && matchesSource && matchesDateRange;
      })
      .sort((a, b) => {
        if (selectedDateRange === "recently") {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        return 0;
      });
  }, [searchQuery, selectedDateRange, selectedLanguage, selectedSource, snippets]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSelectedDateRange("all");
    setSelectedSource("all");
  };

  const confirmArchive = async () => {
    if (!snippetToDelete) return;
    const target = snippetToDelete;
    setSnippetToDelete(null);
    await archiveSnippet(target);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold tracking-tight text-slate-100 md:text-2xl">
            Your snippets
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {filteredSnippets.length} of {snippets.length} snippet
            {snippets.length !== 1 ? "s" : ""} shown
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

      {/* Search + Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#090B0E] p-3">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, code, description, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-[42px] w-full rounded-lg border border-white/[0.08] bg-[#050608] py-2 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLanguageDropdownOpen((v) => !v);
                setDateDropdownOpen(false);
              }}
              aria-expanded={languageDropdownOpen}
              className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/20"
            >
              <FiCode className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {selectedLanguage === "all"
                  ? "All Languages"
                  : prettyLanguage(selectedLanguage)}
              </span>
              <FiChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  languageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {languageDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLanguageDropdownOpen(false)}
                />
                <div className="cp-dropdown-in absolute left-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]">
                  <div className="custom-scrollbar max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLanguage("all");
                        setLanguageDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        selectedLanguage === "all"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "text-slate-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>All Languages</span>
                      <span className="font-mono text-slate-400">
                        {snippets.length}
                      </span>
                    </button>
                    {uniqueLanguages.map((lang) => {
                      const count = snippets.filter((s) => s.language === lang).length;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setLanguageDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                            selectedLanguage === lang
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "text-slate-300 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span>{prettyLanguage(lang)}</span>
                          <span className="font-mono text-slate-400">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDateDropdownOpen((v) => !v);
                setLanguageDropdownOpen(false);
              }}
              aria-expanded={dateDropdownOpen}
              className="flex min-h-[38px] items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/20"
            >
              <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {DATE_RANGES.find((d) => d.value === selectedDateRange)?.label ||
                  "All Time"}
              </span>
              <FiChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  dateDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDateDropdownOpen(false)}
                />
                <div className="cp-dropdown-in absolute left-0 top-full z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]">
                  {DATE_RANGES.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => {
                        setSelectedDateRange(range.value);
                        setDateDropdownOpen(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        selectedDateRange === range.value
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "text-slate-300 hover:bg-white/[0.06]"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Source Filter Pills */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0D1015] p-0.5">
            {(["all", "vscode", "web"] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSource(src)}
                className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedSource === src
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {src === "all" ? "All Sources" : src === "vscode" ? "VS Code" : "Web"}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-300"
            >
              <FiX className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Snippets Content */}
      {loading ? (
        <LoadingState message="Loading your snippets..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void refreshAll()} />
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0D12] px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0D1015]">
            <FiLayers className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {hasActiveFilters ? "No matching snippets" : "Your vault is ready"}
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            {hasActiveFilters
              ? "Try clearing your search query or filters to view all saved snippets."
              : "Create a snippet directly on the web or generate an API key in Profile Settings to sync from VS Code."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="min-h-[40px] rounded-lg border border-white/[0.1] bg-[#0D1015] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                Reset Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/dashboard/new")}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] hover:bg-emerald-400"
              >
                <FiPlus className="h-4 w-4" />
                Create First Snippet
              </button>
            )}
          </div>
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

      {/* Animated Archive Confirmation Modal */}
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

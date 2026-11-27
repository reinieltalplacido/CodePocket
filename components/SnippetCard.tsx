"use client";

import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheck,
  FiCopy,
  FiFolder,
  FiRotateCcw,
  FiStar,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import CodeBlock from "@/components/CodeBlock";
import { prettyLanguage } from "@/lib/languages";
import { useToast } from "@/contexts/ToastContext";
import type { FolderRecord, SnippetRecord } from "@/contexts/VaultContext";

type SnippetCardProps = {
  snippet: SnippetRecord;
  density?: "comfortable" | "compact";
  mode?: "default" | "archive";
  folders?: FolderRecord[];
  onToggleFavorite?: (snippet: SnippetRecord) => void;
  onMoveToFolder?: (snippetId: string, folderId: string | null) => void;
  onRequestDelete?: (snippet: SnippetRecord) => void;
  onRestore?: (snippet: SnippetRecord) => void;
  onPermanentDelete?: (snippet: SnippetRecord) => void;
};

const FOLDER_DOT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

function SnippetCardInner({
  snippet,
  density = "comfortable",
  mode = "default",
  folders = [],
  onToggleFavorite,
  onMoveToFolder,
  onRequestDelete,
  onRestore,
  onPermanentDelete,
}: SnippetCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  const tags = Array.isArray(snippet.tags) ? snippet.tags : [];
  const isCompact = density === "compact";
  const isArchive = mode === "archive";

  useEffect(() => {
    if (!folderMenuOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFolderMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [folderMenuOpen]);

  const handleOpen = () => {
    if (isArchive) return;
    router.push(`/dashboard/snippet/${snippet.id}`);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      showToast("Code copied to clipboard", "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Could not copy to clipboard", "error");
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isArchive) return;
    if (e.key === "Enter" && e.target === e.currentTarget) {
      handleOpen();
    }
  };

  return (
    <article
      onClick={handleOpen}
      onKeyDown={handleCardKeyDown}
      tabIndex={isArchive ? undefined : 0}
      className={`cp-card-render group relative flex min-w-0 flex-col rounded-xl border border-white/[0.08] bg-[#0D1015] transition-colors duration-150 ${
        isArchive
          ? "hover:border-amber-500/35"
          : "cursor-pointer hover:border-emerald-500/35 hover:bg-[#11151B]"
      } ${isCompact ? "p-3.5" : "p-4"}`}
    >
      {/* Card Header */}
      <div className="mb-2.5 flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-emerald-300">
              {snippet.title}
            </h3>
            {snippet.source === "vscode" && (
              <span className="shrink-0 rounded-md border border-sky-500/25 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                VS Code
              </span>
            )}
          </div>
          {snippet.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
              {snippet.description}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-300">
          {prettyLanguage(snippet.language)}
        </span>
      </div>

      {/* Snug Code Preview (zero void on short snippets) */}
      <div
        className="mb-3 min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CodeBlock
          code={snippet.code}
          language={snippet.language}
          showLineNumbers={false}
          maxHeight={isCompact ? "148px" : "200px"}
        />
      </div>

      {/* Folder + Tags + Actions Footer */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          {snippet.folders && (
            <span className="inline-flex max-w-[140px] items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#090B0E] px-2 py-0.5 text-slate-300">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  FOLDER_DOT_COLORS[snippet.folders.color] || "bg-emerald-500"
                }`}
              />
              <span className="truncate">{snippet.folders.name}</span>
            </span>
          )}

          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex max-w-[110px] items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-slate-400"
            >
              <FiTag className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{tag}</span>
            </span>
          ))}

          {!snippet.folders && tags.length === 0 && (
            <span className="font-mono text-[11px] text-slate-400">
              {isArchive && snippet.deleted_at
                ? `Archived ${new Date(snippet.deleted_at).toLocaleDateString()}`
                : new Date(snippet.created_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Accessible Touch-Friendly Action Controls */}
        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy snippet code"
            title="Copy code"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
          >
            {copied ? (
              <FiCheck className="h-4 w-4 text-emerald-400" />
            ) : (
              <FiCopy className="h-4 w-4" />
            )}
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(snippet)}
              aria-label={
                snippet.is_favorite ? "Remove from favorites" : "Add to favorites"
              }
              title={
                snippet.is_favorite ? "Remove from favorites" : "Add to favorites"
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
            >
              <FiStar
                className={`h-4 w-4 ${
                  snippet.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-400"
                }`}
              />
            </button>
          )}

          {!isArchive && onMoveToFolder && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setFolderMenuOpen((v) => !v)}
                aria-label="Move to folder"
                aria-expanded={folderMenuOpen}
                title="Move to folder"
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  folderMenuOpen
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:bg-white/[0.08] hover:text-slate-100"
                }`}
              >
                <FiFolder className="h-4 w-4" />
              </button>

              {folderMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFolderMenuOpen(false)}
                  />
                  <div className="cp-dropdown-in absolute bottom-full right-0 z-50 mb-2 w-52 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)]">
                    <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                      Move to folder
                    </div>
                    <div className="custom-scrollbar max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onMoveToFolder(snippet.id, null);
                          setFolderMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          !snippet.folder_id
                            ? "bg-emerald-500/12 text-emerald-400"
                            : "text-slate-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span>No folder</span>
                        {!snippet.folder_id && <FiCheck className="h-3.5 w-3.5" />}
                      </button>

                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => {
                            onMoveToFolder(snippet.id, folder.id);
                            setFolderMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                            snippet.folder_id === folder.id
                              ? "bg-emerald-500/12 text-emerald-400"
                              : "text-slate-300 hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                FOLDER_DOT_COLORS[folder.color] || "bg-emerald-500"
                              }`}
                            />
                            <span className="truncate">{folder.name}</span>
                          </span>
                          {snippet.folder_id === folder.id && (
                            <FiCheck className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {!isArchive && onRequestDelete && (
            <button
              type="button"
              onClick={() => onRequestDelete(snippet)}
              aria-label="Archive snippet"
              title="Move to archive"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/12 hover:text-red-400"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          )}

          {isArchive && onRestore && (
            <button
              type="button"
              onClick={() => onRestore(snippet)}
              aria-label="Restore snippet"
              title="Restore snippet"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/12"
            >
              <FiRotateCcw className="h-4 w-4" />
            </button>
          )}

          {isArchive && onPermanentDelete && (
            <button
              type="button"
              onClick={() => onPermanentDelete(snippet)}
              aria-label="Delete snippet forever"
              title="Delete permanently"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/12"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {(snippet.folders || tags.length > 0) && (
        <div className="mt-2 font-mono text-[11px] text-slate-400">
          {isArchive && snippet.deleted_at
            ? `Archived ${new Date(snippet.deleted_at).toLocaleDateString()}`
            : new Date(snippet.created_at).toLocaleDateString()}
        </div>
      )}
    </article>
  );
}

const SnippetCard = memo(SnippetCardInner);
export default SnippetCard;

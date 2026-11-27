import Image from "next/image";
import {
  FiCode,
  FiCopy,
  FiFolder,
  FiPlus,
  FiSearch,
  FiStar,
  FiTag,
  FiTrash2,
} from "react-icons/fi";

type PreviewFolder = {
  id: string;
  name: string;
  color: "emerald" | "blue" | "purple" | "orange";
  count: number;
};

type PreviewSnippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  folderName: string;
  tags: string[];
  source: "vscode" | "web";
  isFavorite: boolean;
  createdAt: string;
  code: string;
};

const FOLDERS: PreviewFolder[] = [
  { id: "hooks", name: "React Hooks", color: "emerald", count: 4 },
  { id: "api", name: "API & Auth", color: "blue", count: 3 },
  { id: "sql", name: "SQL Recipes", color: "orange", count: 2 },
  { id: "shell", name: "Shell & CI", color: "purple", count: 3 },
];

const PREVIEW_SNIPPETS: PreviewSnippet[] = [
  {
    id: "s1",
    title: "useDebounce.ts",
    description:
      "Delays state updates until typing pauses, keeping live filter queries fast.",
    language: "TypeScript",
    folderName: "React Hooks",
    tags: ["react", "hooks"],
    source: "vscode",
    isFavorite: true,
    createdAt: "Nov 18, 2026",
    code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}`,
  },
  {
    id: "s2",
    title: "verifyApiKey.ts",
    description:
      "Server-side API key lookup helper used by the CodePocket extension endpoints.",
    language: "TypeScript",
    folderName: "API & Auth",
    tags: ["auth", "prisma"],
    source: "vscode",
    isFavorite: true,
    createdAt: "Nov 16, 2026",
    code: `export async function requireApiUser(req: Request) {
  const key = req.headers.get("x-api-key");
  if (!key) return null;

  const record = await prisma.apiKey.findUnique({
    where: { apiKey: key },
    select: { userId: true },
  });

  return record?.userId ?? null;
}`,
  },
  {
    id: "s3",
    title: "snippet_search_index.sql",
    description:
      "Composite PostgreSQL index for fast per-user active snippet lookups.",
    language: "SQL",
    folderName: "SQL Recipes",
    tags: ["postgres", "indexing"],
    source: "web",
    isFavorite: false,
    createdAt: "Nov 12, 2026",
    code: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_snippets_active_user
ON snippets (user_id, created_at DESC)
WHERE deleted_at IS NULL;`,
  },
  {
    id: "s4",
    title: "probe_health.sh",
    description:
      "Deployment check script that verifies /api/keep-alive returns HTTP 200.",
    language: "Bash",
    folderName: "Shell & CI",
    tags: ["deploy", "curl"],
    source: "web",
    isFavorite: false,
    createdAt: "Nov 09, 2026",
    code: `#!/usr/bin/env bash
set -euo pipefail

curl -sf "https://code-pocket.vercel.app/api/keep-alive" | grep -q "healthy"
echo "Neon Postgres connection verified."`,
  },
];

const FOLDER_DOT: Record<PreviewFolder["color"], string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

export default function VaultPreview() {
  return (
    <figure
      className="select-none overflow-hidden rounded-xl border border-white/[0.14] bg-[#090B0E] text-slate-100 ring-1 ring-white/[0.04] shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9)]"
      aria-label="Static preview of the CodePocket snippet dashboard showing sidebar folders, search bar, and snippet cards"
    >
      <div className="flex flex-col lg:flex-row" aria-hidden="true">
        {/* Desktop Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.08] bg-[#07090C] lg:flex">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-4">
            <Image
              src="/Glossy Green Code Pocket Icon.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                CodePocket
              </div>
              <div className="truncate text-[11px] text-slate-400">
                Snippet Manager
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-1 p-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-500/15 px-2.5 py-2 text-xs font-medium text-emerald-300">
              <FiCode className="h-4 w-4 shrink-0" />
              <span className="flex-1">All Snippets</span>
              <span className="font-mono text-[11px] text-emerald-300/80">12</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300">
              <FiStar className="h-4 w-4 shrink-0" />
              <span className="flex-1">Favorites</span>
              <span className="font-mono text-[11px] text-slate-400">4</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300">
              <FiTrash2 className="h-4 w-4 shrink-0" />
              <span className="flex-1">Archive</span>
              <span className="font-mono text-[11px] text-slate-400">2</span>
            </div>

            <div className="pt-4">
              <div className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Folders
              </div>
              <div className="space-y-1">
                {FOLDERS.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${FOLDER_DOT[folder.color]}`}
                    />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {folder.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile / Tablet Summary Strip */}
        <div className="border-b border-white/[0.08] bg-[#07090C] p-3 lg:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300">
              All Snippets (12)
            </span>
            <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              Favorites (4)
            </span>
            {FOLDERS.slice(0, 3).map((folder) => (
              <span
                key={folder.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300"
              >
                <span className={`h-2 w-2 rounded-full ${FOLDER_DOT[folder.color]}`} />
                {folder.name}
              </span>
            ))}
          </div>
        </div>

        {/* Main Workspace Panel */}
        <div className="flex min-w-0 flex-1 flex-col bg-[#090B0E]">
          {/* Workspace Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-6">
            <div>
              <div className="text-base font-semibold text-white">All Snippets</div>
              <div className="text-xs text-slate-400">
                Sample dashboard view with folders, tags, and syntax blocks.
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950">
              <FiPlus className="h-3.5 w-3.5" />
              <span>New Snippet</span>
            </div>
          </div>

          {/* Search & Language Filters */}
          <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#12161E] px-3 py-2 text-xs text-slate-400">
              <FiSearch className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">Search titles, tags, or code...</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-emerald-500/20 px-2.5 py-1.5 text-xs font-medium text-emerald-300">
                All
              </span>
              <span className="rounded-md bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300">
                TypeScript
              </span>
              <span className="rounded-md bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300">
                SQL
              </span>
              <span className="rounded-md bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-300">
                Bash
              </span>
            </div>
          </div>

          {/* Static Snippet Cards Grid */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2">
            {PREVIEW_SNIPPETS.map((snippet) => (
              <div
                key={snippet.id}
                className="flex min-w-0 flex-col rounded-lg border border-white/10 bg-[#11151B] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {snippet.title}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-slate-400">
                    <FiStar
                      className={`h-3.5 w-3.5 ${
                        snippet.isFavorite
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-400"
                      }`}
                    />
                    <FiCopy className="h-3.5 w-3.5" />
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-300">
                    {snippet.language}
                  </span>
                  <span className="rounded bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-sky-300">
                    {snippet.source === "vscode" ? "VS Code" : "Web"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-2 py-0.5 text-[11px] text-slate-300">
                    <FiFolder className="h-3 w-3 text-slate-400" />
                    {snippet.folderName}
                  </span>
                  {snippet.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400"
                    >
                      <FiTag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-2 line-clamp-2 text-xs text-slate-300">
                  {snippet.description}
                </p>

                <div className="mt-3 overflow-hidden rounded-md border border-white/[0.06] bg-[#07090C] p-3 font-mono text-[11px] leading-5 text-slate-200">
                  <pre className="line-clamp-4 overflow-hidden whitespace-pre-wrap">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  {snippet.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

const VSCODE_COMMAND = `// 1. Install "CodePocket Snippets" in VS Code
// 2. Paste your personal cpk_ API key in Extension Settings
// 3. Press Ctrl+Shift+P -> >codepocket

{
  "codepocket.apiKey": "cpk_your_personal_token",
  "codepocket.endpoint": "https://code-pocket.vercel.app/api/snippets"
}`;

const CURL_COMMAND = `curl -X POST "https://code-pocket.vercel.app/api/snippets" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: cpk_your_personal_token" \\
  -d '{
    "title": "useDebounce.ts",
    "language": "TypeScript",
    "tags": ["react", "hooks"],
    "source": "vscode",
    "code": "export function useDebounce(v, ms = 250) { ... }"
  }'`;

export default function VsCodeSyncDemo() {
  const [tab, setTab] = useState<"vscode" | "api">("vscode");
  const [copied, setCopied] = useState(false);

  const activeText = tab === "vscode" ? VSCODE_COMMAND : CURL_COMMAND;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Static VS Code Command Palette Preview */}
      <figure
        className="select-none overflow-hidden rounded-xl border border-white/[0.14] bg-[#181A1F] p-2.5 text-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]"
        aria-label="VS Code Command Palette showing CodePocket: Insert Snippet and CodePocket: Save Selection as Snippet"
      >
        <div aria-hidden="true">
          <div className="flex items-center justify-between rounded border border-[#007FD4] bg-[#111317] px-3 py-2 font-mono text-xs text-slate-100">
            <span>&gt;codepocket</span>
            <span className="text-[11px] text-slate-400">Ctrl+Shift+P</span>
          </div>

          <div className="mt-1.5 overflow-hidden rounded border border-white/[0.06] bg-[#1D2025]">
            <div className="flex items-center justify-between gap-2 bg-[#2A2D2E] px-3 py-2 text-xs">
              <div className="truncate">
                <span className="font-semibold text-[#60A5FA]">CodePocket</span>
                <span className="text-slate-100">: Insert Snippet</span>
              </div>
              <span className="hidden shrink-0 font-mono text-[11px] text-slate-300 sm:inline">
                Insert at cursor
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
              <div className="truncate">
                <span className="font-semibold text-[#60A5FA]">CodePocket</span>
                <span className="text-slate-200">: Save Selection as Snippet</span>
              </div>
              <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 sm:inline">
                Push to vault
              </span>
            </div>
          </div>
        </div>
      </figure>

      {/* Configuration & API Endpoint Reference */}
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/[0.14] bg-[#050608] text-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0D1015] px-4 py-2.5">
          <div className="flex items-center gap-1" role="tablist" aria-label="Sync mode">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "vscode"}
              onClick={() => {
                setTab("vscode");
                setCopied(false);
              }}
              className={`min-h-[34px] rounded-md px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                tab === "vscode"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              settings.json
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "api"}
              onClick={() => {
                setTab("api");
                setCopied(false);
              }}
              className={`min-h-[34px] rounded-md px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                tab === "api"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              POST /api/snippets
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-white/15 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Copy sync example"
          >
            {copied ? (
              <>
                <FiCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto p-5 font-mono text-xs leading-6 text-slate-200">
          <pre>
            <code>{activeText}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

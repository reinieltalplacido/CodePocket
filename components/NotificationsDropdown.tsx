"use client";

import { useEffect, useState } from "react";
import { FiActivity, FiBell, FiCode, FiFolder, FiKey, FiTrash2, FiUser } from "react-icons/fi";
import { useVault } from "@/contexts/VaultContext";

export default function NotificationsDropdown() {
  const { activityFeed, unreadActivityCount, markActivityRead, clearActivity, syncStatus } =
    useVault();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && unreadActivityCount > 0) {
        markActivityRead();
      }
      return next;
    });
  };

  const formatTimeAgo = (iso: string) => {
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(iso).toLocaleDateString();
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "snippets":
        return <FiCode className="h-3.5 w-3.5 text-emerald-400" />;
      case "folders":
        return <FiFolder className="h-3.5 w-3.5 text-sky-400" />;
      case "api-keys":
        return <FiKey className="h-3.5 w-3.5 text-amber-400" />;
      case "profile":
        return <FiUser className="h-3.5 w-3.5 text-slate-300" />;
      default:
        return <FiActivity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Recent vault activity"
        aria-expanded={isOpen}
        title="Vault activity"
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
          isOpen
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-white/[0.08] bg-[#0D1015] text-slate-300 hover:border-white/20 hover:text-slate-100"
        }`}
      >
        <FiBell className="h-4 w-4" />
        {unreadActivityCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0D1015]" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="cp-dropdown-in absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] shadow-[0_24px_60px_-14px_rgba(0,0,0,0.92)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090B0E] px-4 py-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-100">
                  Vault Activity
                </h3>
                <p className="text-[11px] text-slate-400">
                  Stream status:{" "}
                  <span
                    className={
                      syncStatus === "live"
                        ? "text-emerald-400"
                        : syncStatus === "syncing"
                          ? "text-amber-400"
                          : "text-red-400"
                    }
                  >
                    {syncStatus === "live"
                      ? "Connected live"
                      : syncStatus === "syncing"
                        ? "Syncing..."
                        : "Offline"}
                  </span>
                </p>
              </div>
              {activityFeed.length > 0 && (
                <button
                  type="button"
                  onClick={clearActivity}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
                >
                  <FiTrash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            <div className="custom-scrollbar max-h-72 overflow-y-auto p-2">
              {activityFeed.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <FiActivity className="mx-auto mb-2 h-5 w-5 text-slate-600" />
                  <p className="text-xs font-medium text-slate-400">
                    No recent activity in this session
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Changes from VS Code or this browser appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activityFeed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608]">
                        {getResourceIcon(item.resource)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-200">
                          {item.title ? item.title : item.resource}{" "}
                          <span className="font-normal text-slate-400">
                            {item.action}
                          </span>
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{formatTimeAgo(item.timestamp)}</span>
                          {item.source === "vscode" && (
                            <span className="rounded bg-sky-500/15 px-1.5 py-0.2 font-mono text-[10px] text-sky-300">
                              VS Code
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

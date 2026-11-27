"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/contexts/ToastContext";
import type { Profile } from "@/lib/types/profile";

export type FolderRecord = {
  id: string;
  user_id?: string;
  name: string;
  description?: string | null;
  color: string;
  snippet_count: number;
  created_at?: string;
  updated_at?: string;
};

export type SnippetRecord = {
  id: string;
  user_id?: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  folder_id: string | null;
  is_favorite?: boolean;
  source?: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  folders?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type VaultPreferences = {
  density: "comfortable" | "compact";
  defaultLanguage: string;
};

export type VaultActivityItem = {
  id: string;
  resource: string;
  action: string;
  entityId?: string;
  title?: string;
  source?: string;
  timestamp: string;
};

export type SyncStatus = "live" | "syncing" | "offline";

type VaultContextType = {
  user: { id: string; email: string; name?: string | null } | null;
  profile: Profile | null;
  folders: FolderRecord[];
  snippets: SnippetRecord[];
  archivedSnippets: SnippetRecord[];
  loading: boolean;
  archiveLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  activityFeed: VaultActivityItem[];
  unreadActivityCount: number;
  preferences: VaultPreferences;
  counts: {
    all: number;
    favorites: number;
    archive: number;
    folders: number;
  };
  updatePreferences: (patch: Partial<VaultPreferences>) => void;
  markActivityRead: () => void;
  clearActivity: () => void;
  refreshAll: (opts?: { silent?: boolean }) => Promise<void>;
  refreshArchive: (opts?: { silent?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileDirect: (profile: Profile) => void;
  toggleFavorite: (snippet: SnippetRecord) => Promise<void>;
  moveSnippetToFolder: (snippetId: string, folderId: string | null) => Promise<void>;
  archiveSnippet: (snippet: SnippetRecord) => Promise<void>;
  restoreSnippet: (snippet: SnippetRecord) => Promise<void>;
  purgeSnippet: (snippet: SnippetRecord) => Promise<void>;
  createFolder: (input: {
    name: string;
    description?: string | null;
    color: string;
  }) => Promise<{ ok: boolean; error?: string; folder?: FolderRecord }>;
  deleteFolder: (folderId: string) => Promise<{ ok: boolean; error?: string }>;
  notifyMutation: (resource: "snippets" | "folders" | "profile" | "api-keys") => void;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const PREFS_STORAGE_KEY = "codepocket-preferences";
const DEFAULT_PREFS: VaultPreferences = {
  density: "comfortable",
  defaultLanguage: "TypeScript",
};

export function VaultProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<{ id: string; email: string; name?: string | null } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [snippets, setSnippets] = useState<SnippetRecord[]>([]);
  const [archivedSnippets, setArchivedSnippets] = useState<SnippetRecord[]>([]);
  const [archiveLoaded, setArchiveLoaded] = useState(false);
  const [archiveCountOverride, setArchiveCountOverride] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("live");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<VaultActivityItem[]>([]);
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const [preferences, setPreferences] = useState<VaultPreferences>(DEFAULT_PREFS);

  const fingerprintRef = useRef<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastRemoteToastRef = useRef<Record<string, number>>({});

  // Load saved UI preferences
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPreferences({
          density: parsed.density === "compact" ? "compact" : "comfortable",
          defaultLanguage:
            typeof parsed.defaultLanguage === "string" && parsed.defaultLanguage
              ? parsed.defaultLanguage
              : "TypeScript",
        });
      }
    } catch {
      // Ignore invalid stored preferences
    }
  }, []);

  const updatePreferences = useCallback((patch: Partial<VaultPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const fetchFoldersAndSnippets = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
      } else {
        setSyncStatus("syncing");
      }

      try {
        const [snippetsRes, foldersRes, stateRes] = await Promise.all([
          fetch("/api/snippets", { credentials: "include" }),
          fetch("/api/folders", { credentials: "include" }),
          fetch("/api/sync/state", { credentials: "include" }),
        ]);

        if (!snippetsRes.ok) {
          throw new Error("Failed to load snippets");
        }

        const snippetsJson = await snippetsRes.json();
        setSnippets(snippetsJson.snippets || []);

        if (foldersRes.ok) {
          const foldersJson = await foldersRes.json();
          setFolders(foldersJson.folders || []);
        }

        if (stateRes.ok) {
          const stateJson = await stateRes.json();
          fingerprintRef.current = stateJson.fingerprint;
          setArchiveCountOverride(stateJson.counts?.archive ?? null);
        }

        setError(null);
        setSyncStatus("live");
        setLastSyncedAt(new Date().toISOString());
      } catch (err: any) {
        setError(err?.message || "Failed to load vault");
        setSyncStatus(navigator.onLine ? "live" : "offline");
      } finally {
        if (!opts?.silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile);
      }
    } catch {
      // Ignore transient network errors
    }
  }, []);

  const refreshArchive = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setArchiveLoading(true);
    }
    try {
      const res = await fetch("/api/snippets?deleted=true", {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        const list = json.snippets || [];
        setArchivedSnippets(list);
        setArchiveLoaded(true);
        setArchiveCountOverride(list.length);
      }
    } finally {
      if (!opts?.silent) {
        setArchiveLoading(false);
      }
    }
  }, []);

  const refreshAll = useCallback(
    async (opts?: { silent?: boolean }) => {
      await Promise.all([
        fetchFoldersAndSnippets(opts),
        refreshProfile(),
        archiveLoaded ? refreshArchive({ silent: true }) : Promise.resolve(),
      ]);
    },
    [archiveLoaded, fetchFoldersAndSnippets, refreshArchive, refreshProfile]
  );

  // Initial load: auth session + profile + folders + snippets
  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const sessionRes = await authClient.getSession();
        if (!active) return;
        const u = sessionRes?.data?.user;
        if (u) {
          setUser({ id: u.id, email: u.email, name: u.name });
        }
        await Promise.all([fetchFoldersAndSnippets(), refreshProfile()]);
      } catch {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [fetchFoldersAndSnippets, refreshProfile]);

  const broadcastLocalMutation = useCallback((resource: string) => {
    try {
      channelRef.current?.postMessage({ resource, at: Date.now() });
    } catch {
      // Ignore BroadcastChannel errors
    }
  }, []);

  const notifyMutation = useCallback(
    (resource: "snippets" | "folders" | "profile" | "api-keys") => {
      broadcastLocalMutation(resource);
      if (resource === "profile") {
        void refreshProfile();
      } else {
        void fetchFoldersAndSnippets({ silent: true });
        if (archiveLoaded) {
          void refreshArchive({ silent: true });
        }
      }
    },
    [archiveLoaded, broadcastLocalMutation, fetchFoldersAndSnippets, refreshArchive, refreshProfile]
  );

  // SSE Realtime stream + BroadcastChannel + local DOM events + visibility-aware fingerprint sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("codepocket-vault-sync");
      channelRef.current.onmessage = (msg) => {
        const resource = msg.data?.resource;
        if (resource === "profile") {
          void refreshProfile();
        } else {
          void fetchFoldersAndSnippets({ silent: true });
          if (archiveLoaded) void refreshArchive({ silent: true });
        }
      };
    }

    const handleDomMutation = (e: Event) => {
      const detail = (e as CustomEvent<{ resource?: string }>).detail;
      const resource = detail?.resource;
      if (resource === "profile") {
        void refreshProfile();
      } else {
        void fetchFoldersAndSnippets({ silent: true });
        if (archiveLoaded) void refreshArchive({ silent: true });
      }
    };

    window.addEventListener("codepocket:vault-mutated", handleDomMutation);

    // Server-Sent Events stream for instant server/VS Code pushes
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/realtime/stream");

      eventSource.addEventListener("connected", (e) => {
        setSyncStatus("live");
        try {
          const payload = JSON.parse((e as MessageEvent).data);
          if (Array.isArray(payload.recent) && payload.recent.length > 0) {
            setActivityFeed(payload.recent);
          }
        } catch {
          // Ignore malformed event payload
        }
      });

      eventSource.addEventListener("vault", (e) => {
        try {
          const evt = JSON.parse((e as MessageEvent).data) as VaultActivityItem;
          setActivityFeed((prev) => [evt, ...prev.filter((i) => i.id !== evt.id)].slice(0, 20));
          setUnreadActivityCount((c) => Math.min(c + 1, 99));

          if (evt.resource === "profile") {
            void refreshProfile();
          } else {
            void fetchFoldersAndSnippets({ silent: true });
            if (archiveLoaded) void refreshArchive({ silent: true });
          }

          window.dispatchEvent(new CustomEvent("codepocket:vault-event", { detail: evt }));

          if (evt.source === "vscode") {
            const now = Date.now();
            const key = `${evt.entityId || evt.action}-${evt.action}`;
            if (!lastRemoteToastRef.current[key] || now - lastRemoteToastRef.current[key] > 2000) {
              lastRemoteToastRef.current[key] = now;
              const label = evt.title ? `"${evt.title}"` : "Snippet";
              const verb =
                evt.action === "created"
                  ? "synced from VS Code"
                  : evt.action === "deleted" || evt.action === "purged"
                    ? "removed from VS Code"
                    : "updated from VS Code";
              showToast(`${label} ${verb}`, "info");
            }
          }
        } catch {
          // Ignore malformed event payload
        }
      });

      eventSource.onerror = () => {
        setSyncStatus(navigator.onLine ? "syncing" : "offline");
      };
    } catch {
      // Fallback gracefully to visibility check
    }

    // Visibility-aware lightweight delta check for multi-instance serverless sync
    const checkFingerprint = async () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      try {
        const res = await fetch("/api/sync/state", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        setSyncStatus("live");
        if (fingerprintRef.current && json.fingerprint !== fingerprintRef.current) {
          fingerprintRef.current = json.fingerprint;
          await Promise.all([
            fetchFoldersAndSnippets({ silent: true }),
            refreshProfile(),
            archiveLoaded ? refreshArchive({ silent: true }) : Promise.resolve(),
          ]);
        } else if (!fingerprintRef.current) {
          fingerprintRef.current = json.fingerprint;
        }
        setArchiveCountOverride(json.counts?.archive ?? null);
      } catch {
        setSyncStatus(navigator.onLine ? "live" : "offline");
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void checkFingerprint();
      }
    };

    const handleOnline = () => {
      setSyncStatus("live");
      void refreshAll({ silent: true });
    };

    const handleOffline = () => {
      setSyncStatus("offline");
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void checkFingerprint();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      eventSource?.close();
      channelRef.current?.close();
      channelRef.current = null;
      window.removeEventListener("codepocket:vault-mutated", handleDomMutation);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [archiveLoaded, fetchFoldersAndSnippets, refreshAll, refreshArchive, refreshProfile, showToast]);

  const setProfileDirect = useCallback(
    (nextProfile: Profile) => {
      setProfile(nextProfile);
      broadcastLocalMutation("profile");
    },
    [broadcastLocalMutation]
  );

  const toggleFavorite = useCallback(
    async (snippet: SnippetRecord) => {
      const nextFav = !snippet.is_favorite;

      setSnippets((prev) =>
        prev.map((s) => (s.id === snippet.id ? { ...s, is_favorite: nextFav } : s))
      );
      setArchivedSnippets((prev) =>
        prev.map((s) => (s.id === snippet.id ? { ...s, is_favorite: nextFav } : s))
      );

      try {
        const res = await fetch(`/api/snippets/${snippet.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_favorite: nextFav }),
        });
        if (!res.ok) throw new Error("Failed to update favorite");
        broadcastLocalMutation("snippets");
        showToast(nextFav ? "Added to favorites" : "Removed from favorites", "success");
      } catch {
        setSnippets((prev) =>
          prev.map((s) => (s.id === snippet.id ? { ...s, is_favorite: !nextFav } : s))
        );
        setArchivedSnippets((prev) =>
          prev.map((s) => (s.id === snippet.id ? { ...s, is_favorite: !nextFav } : s))
        );
        showToast("Failed to update favorite", "error");
      }
    },
    [broadcastLocalMutation, showToast]
  );

  const moveSnippetToFolder = useCallback(
    async (snippetId: string, folderId: string | null) => {
      const targetSnippet = snippets.find((s) => s.id === snippetId);
      const previousFolderId = targetSnippet?.folder_id ?? null;
      if (previousFolderId === folderId) return;

      const targetFolder = folderId
        ? folders.find((f) => f.id === folderId) ?? null
        : null;

      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId
            ? {
                ...s,
                folder_id: folderId,
                folders: targetFolder
                  ? { id: targetFolder.id, name: targetFolder.name, color: targetFolder.color }
                  : null,
              }
            : s
        )
      );

      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === previousFolderId) {
            return { ...f, snippet_count: Math.max(0, f.snippet_count - 1) };
          }
          if (f.id === folderId) {
            return { ...f, snippet_count: f.snippet_count + 1 };
          }
          return f;
        })
      );

      try {
        const res = await fetch(`/api/snippets/${snippetId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder_id: folderId }),
        });
        if (!res.ok) throw new Error("Failed to move snippet");
        broadcastLocalMutation("snippets");
        showToast(
          targetFolder ? `Moved to ${targetFolder.name}` : "Removed from folder",
          "success"
        );
      } catch {
        void fetchFoldersAndSnippets({ silent: true });
        showToast("Failed to move snippet to folder", "error");
      }
    },
    [broadcastLocalMutation, fetchFoldersAndSnippets, folders, showToast, snippets]
  );

  const archiveSnippet = useCallback(
    async (snippet: SnippetRecord) => {
      setSnippets((prev) => prev.filter((s) => s.id !== snippet.id));
      if (snippet.folder_id) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === snippet.folder_id
              ? { ...f, snippet_count: Math.max(0, f.snippet_count - 1) }
              : f
          )
        );
      }
      setArchiveCountOverride((c) => (c !== null ? c + 1 : 1));
      if (archiveLoaded) {
        setArchivedSnippets((prev) => [
          { ...snippet, deleted_at: new Date().toISOString() },
          ...prev,
        ]);
      }

      try {
        const res = await fetch(`/api/snippets/${snippet.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to archive snippet");
        broadcastLocalMutation("snippets");
        showToast(`"${snippet.title}" moved to Archive`, "success");
      } catch {
        void refreshAll({ silent: true });
        showToast("Failed to archive snippet", "error");
      }
    },
    [archiveLoaded, broadcastLocalMutation, refreshAll, showToast]
  );

  const restoreSnippet = useCallback(
    async (snippet: SnippetRecord) => {
      setArchivedSnippets((prev) => prev.filter((s) => s.id !== snippet.id));
      setArchiveCountOverride((c) => (c !== null ? Math.max(0, c - 1) : null));
      setSnippets((prev) => [{ ...snippet, deleted_at: null }, ...prev]);
      if (snippet.folder_id) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === snippet.folder_id
              ? { ...f, snippet_count: f.snippet_count + 1 }
              : f
          )
        );
      }

      try {
        const res = await fetch(`/api/snippets/${snippet.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleted_at: null }),
        });
        if (!res.ok) throw new Error("Failed to restore snippet");
        broadcastLocalMutation("snippets");
        showToast(`"${snippet.title}" restored`, "success");
      } catch {
        void refreshAll({ silent: true });
        showToast("Failed to restore snippet", "error");
      }
    },
    [broadcastLocalMutation, refreshAll, showToast]
  );

  const purgeSnippet = useCallback(
    async (snippet: SnippetRecord) => {
      setArchivedSnippets((prev) => prev.filter((s) => s.id !== snippet.id));
      setArchiveCountOverride((c) => (c !== null ? Math.max(0, c - 1) : null));

      try {
        const res = await fetch(`/api/snippets/${snippet.id}?permanent=true`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to permanently delete snippet");
        broadcastLocalMutation("snippets");
        showToast(`"${snippet.title}" permanently deleted`, "success");
      } catch {
        void refreshArchive({ silent: true });
        showToast("Failed to permanently delete snippet", "error");
      }
    },
    [broadcastLocalMutation, refreshArchive, showToast]
  );

  const createFolder = useCallback(
    async (input: { name: string; description?: string | null; color: string }) => {
      try {
        const res = await fetch("/api/folders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (!res.ok) {
          return { ok: false, error: json.error || "Failed to create folder" };
        }
        const created: FolderRecord = {
          ...json.folder,
          snippet_count: json.folder.snippet_count ?? 0,
        };
        setFolders((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
        );
        broadcastLocalMutation("folders");
        showToast(`Folder "${created.name}" created`, "success");
        return { ok: true, folder: created };
      } catch (err: any) {
        return { ok: false, error: err?.message || "Failed to create folder" };
      }
    },
    [broadcastLocalMutation, showToast]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      try {
        const res = await fetch(`/api/folders/${folderId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) {
          return { ok: false, error: json.error || "Failed to delete folder" };
        }
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        setSnippets((prev) =>
          prev.map((s) =>
            s.folder_id === folderId ? { ...s, folder_id: null, folders: null } : s
          )
        );
        broadcastLocalMutation("folders");
        showToast("Folder deleted", "success");
        return { ok: true };
      } catch (err: any) {
        return { ok: false, error: err?.message || "Failed to delete folder" };
      }
    },
    [broadcastLocalMutation, showToast]
  );

  const markActivityRead = useCallback(() => {
    setUnreadActivityCount(0);
  }, []);

  const clearActivity = useCallback(() => {
    setActivityFeed([]);
    setUnreadActivityCount(0);
  }, []);

  const counts = useMemo(
    () => ({
      all: snippets.length,
      favorites: snippets.filter((s) => s.is_favorite).length,
      archive: archiveCountOverride ?? archivedSnippets.length,
      folders: folders.length,
    }),
    [archiveCountOverride, archivedSnippets.length, folders.length, snippets]
  );

  const value = useMemo<VaultContextType>(
    () => ({
      user,
      profile,
      folders,
      snippets,
      archivedSnippets,
      loading,
      archiveLoading,
      error,
      syncStatus,
      lastSyncedAt,
      activityFeed,
      unreadActivityCount,
      preferences,
      counts,
      updatePreferences,
      markActivityRead,
      clearActivity,
      refreshAll,
      refreshArchive,
      refreshProfile,
      setProfileDirect,
      toggleFavorite,
      moveSnippetToFolder,
      archiveSnippet,
      restoreSnippet,
      purgeSnippet,
      createFolder,
      deleteFolder,
      notifyMutation,
    }),
    [
      user,
      profile,
      folders,
      snippets,
      archivedSnippets,
      loading,
      archiveLoading,
      error,
      syncStatus,
      lastSyncedAt,
      activityFeed,
      unreadActivityCount,
      preferences,
      counts,
      updatePreferences,
      markActivityRead,
      clearActivity,
      refreshAll,
      refreshArchive,
      refreshProfile,
      setProfileDirect,
      toggleFavorite,
      moveSnippetToFolder,
      archiveSnippet,
      restoreSnippet,
      purgeSnippet,
      createFolder,
      deleteFolder,
      notifyMutation,
    ]
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return ctx;
}

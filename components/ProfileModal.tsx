"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import AvatarUpload from "@/components/AvatarUpload";
import CodeBlock from "@/components/CodeBlock";
import ConfirmModal from "@/components/ConfirmModal";
import { useVault } from "@/contexts/VaultContext";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AVAILABLE_THEMES } from "@/lib/themes";
import { SNIPPET_LANGUAGES } from "@/lib/languages";
import {
  FiCheck,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLayout,
  FiPlus,
  FiSliders,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

type SettingsTab = "profile" | "preferences" | "api-keys";

type ProfileModalProps = {
  isOpen: boolean;
  initialTab?: SettingsTab;
  onClose: () => void;
};

type ApiKeyItem = {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
  last_used_at?: string | null;
};

const PREVIEW_SAMPLE = `// CodePocket live syntax preview
export async function syncSnippet(token: string) {
  const res = await fetch("/api/snippets", {
    headers: { "x-api-key": token },
  });
  return res.json();
}`;

export default function ProfileModal({
  isOpen,
  initialTab = "profile",
  onClose,
}: ProfileModalProps) {
  const {
    user,
    profile,
    setProfileDirect,
    preferences,
    updatePreferences,
    notifyMutation,
  } = useVault();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setUsername(profile?.username || "");
      setDisplayName(profile?.display_name || "");
      setBio(profile?.bio || "");
      void fetchApiKeys();
    }
  }, [initialTab, isOpen, profile]);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/api-keys", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setApiKeys(json.keys || []);
      }
    } finally {
      setLoadingKeys(false);
    }
  };

  const isProfileDirty =
    username !== (profile?.username || "") ||
    displayName !== (profile?.display_name || "") ||
    bio !== (profile?.bio || "");

  const usernameValid =
    !username.trim() || /^[a-z0-9_]{3,20}$/.test(username.trim());

  const handleUpdateProfile = async () => {
    if (!usernameValid) {
      showToast(
        "Username must be 3-20 lowercase letters, numbers, or underscores",
        "error"
      );
      return;
    }

    setUpdatingProfile(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || null,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileDirect(data.profile);
      showToast("Profile updated", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to update profile", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setProfileDirect(data.profile);
      showToast("Avatar updated", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to upload avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove avatar");
      }

      setProfileDirect(data.profile);
      showToast("Avatar removed", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to remove avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      showToast("Enter a key name", "error");
      return;
    }

    setCreatingKey(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create API key");
      }

      setApiKeys((prev) => [json.key, ...prev]);
      setVisibleKeys((prev) => ({ ...prev, [json.key.id]: true }));
      setNewKeyName("");
      setShowNewKeyForm(false);
      notifyMutation("api-keys");
      showToast("API key created", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to create API key", "error");
    } finally {
      setCreatingKey(false);
    }
  };

  const confirmRevokeKey = async () => {
    if (!keyToRevoke) return;
    const target = keyToRevoke;
    setKeyToRevoke(null);

    try {
      const res = await fetch(`/api/api-keys/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to revoke API key");

      setApiKeys((prev) => prev.filter((k) => k.id !== target.id));
      notifyMutation("api-keys");
      showToast(`Revoked "${target.name}"`, "success");
    } catch {
      showToast("Failed to revoke API key", "error");
    }
  };

  const handleCopyKey = async (keyValue: string, id: string) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedKeyId(id);
      showToast("API key copied to clipboard", "success");
      setTimeout(() => setCopiedKeyId(null), 1800);
    } catch {
      showToast("Could not copy API key", "error");
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return "••••••••••••";
    return `${key.slice(0, 8)}••••••••••••••••${key.slice(-4)}`;
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Profile & Settings"
        subtitle="Manage your identity, editor defaults, and VS Code API keys."
        size="lg"
      >
        <div className="space-y-5">
          {/* Tab Switcher */}
          <div
            role="tablist"
            aria-label="Settings sections"
            className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.08] bg-[#050608] p-1"
          >
            {(
              [
                { id: "profile", label: "Profile", icon: <FiUser className="h-3.5 w-3.5" /> },
                { id: "preferences", label: "Preferences", icon: <FiSliders className="h-3.5 w-3.5" /> },
                { id: "api-keys", label: "API Keys", icon: <FiKey className="h-3.5 w-3.5" /> },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-[38px] items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                    active
                      ? "bg-[#11151B] text-emerald-300 shadow-sm ring-1 ring-white/[0.08]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/[0.08] bg-[#0D1015] p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Profile Photo
                </h3>
                <AvatarUpload
                  currentAvatar={profile?.avatar_url}
                  fallbackText={displayName || username || user?.email || "U"}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  loading={uploadingAvatar}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="settings-email"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Account Email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="min-h-[40px] w-full rounded-lg border border-white/[0.08] bg-[#050608] px-3 py-2 text-sm text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-display-name"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Display Name
                  </label>
                  <input
                    id="settings-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={50}
                    className="min-h-[40px] w-full rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-username"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400">
                    @
                  </span>
                  <input
                    id="settings-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="username"
                    maxLength={20}
                    className={`min-h-[40px] w-full rounded-lg border bg-[#050608] py-2 pl-8 pr-3 font-mono text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none ${
                      usernameValid
                        ? "border-white/[0.1] focus:border-emerald-500"
                        : "border-red-500/60 focus:border-red-400"
                    }`}
                  />
                </div>
                <p
                  className={`mt-1 text-xs ${
                    usernameValid ? "text-slate-400" : "text-red-400"
                  }`}
                >
                  3-20 lowercase letters, numbers, and underscores only.
                </p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="settings-bio"
                    className="text-xs font-medium text-slate-300"
                  >
                    Bio
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {bio.length}/500
                  </span>
                </div>
                <textarea
                  id="settings-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Languages you build with, notes, or role..."
                  maxLength={500}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                <span className="text-xs text-slate-400">
                  {isProfileDirty ? "Unsaved changes" : "Profile synced"}
                </span>
                <button
                  type="button"
                  onClick={() => void handleUpdateProfile()}
                  disabled={updatingProfile || !isProfileDirty || !usernameValid}
                  className="min-h-[40px] rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-5">
              {/* Live Syntax Theme Selector */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Syntax Theme
                  </h3>
                  <p className="text-xs text-slate-400">
                    Changes snippet cards and the Monaco editor immediately.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AVAILABLE_THEMES.map((item) => {
                    const selected = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        className={`flex flex-col rounded-xl border p-2.5 text-left transition-colors ${
                          selected
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                            : "border-white/[0.08] bg-[#0D1015] text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium">
                            {item.name}
                          </span>
                          {selected && <FiCheck className="h-3.5 w-3.5 shrink-0" />}
                        </div>
                        <div className="mt-2 flex gap-1">
                          <span
                            className="h-1.5 flex-1 rounded-sm"
                            style={{ backgroundColor: item.preview.background }}
                          />
                          <span
                            className="h-1.5 flex-1 rounded-sm"
                            style={{ backgroundColor: item.preview.keyword }}
                          />
                          <span
                            className="h-1.5 flex-1 rounded-sm"
                            style={{ backgroundColor: item.preview.string }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <CodeBlock
                  code={PREVIEW_SAMPLE}
                  language="typescript"
                  showLineNumbers={true}
                  maxHeight="155px"
                />
              </div>

              {/* Density + Default Language */}
              <div className="grid gap-4 border-t border-white/[0.08] pt-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <FiLayout className="h-3.5 w-3.5 text-emerald-400" />
                    Card Density
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["comfortable", "compact"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          updatePreferences({ density: mode });
                          showToast(`Card density set to ${mode}`, "info");
                        }}
                        className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                          preferences.density === mode
                            ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-300"
                            : "border-white/[0.08] bg-[#0D1015] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pref-default-lang"
                    className="mb-2 block text-xs font-medium text-slate-300"
                  >
                    Default New Snippet Language
                  </label>
                  <select
                    id="pref-default-lang"
                    value={preferences.defaultLanguage}
                    onChange={(e) => {
                      updatePreferences({ defaultLanguage: e.target.value });
                      showToast(`Default language set to ${e.target.value}`, "info");
                    }}
                    className="min-h-[38px] w-full rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {SNIPPET_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === "api-keys" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    VS Code &amp; CLI API Keys
                  </h3>
                  <p className="text-xs text-slate-400">
                    Authenticate external writes with the{" "}
                    <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
                      x-api-key
                    </code>{" "}
                    header.
                  </p>
                </div>
                {!showNewKeyForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewKeyForm(true)}
                    className="flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#050608] transition-colors hover:bg-emerald-400"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                    New Key
                  </button>
                )}
              </div>

              {showNewKeyForm && (
                <div className="cp-dropdown-in rounded-xl border border-white/[0.1] bg-[#0D1015] p-4">
                  <label
                    htmlFor="new-api-key-name"
                    className="mb-1.5 block text-xs font-medium text-slate-300"
                  >
                    Key Name
                  </label>
                  <input
                    id="new-api-key-name"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Work Laptop VS Code"
                    autoFocus
                    className="min-h-[40px] w-full rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCreateApiKey()}
                      disabled={creatingKey}
                      className="min-h-[36px] rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-[#050608] hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {creatingKey ? "Generating..." : "Create Key"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewKeyForm(false);
                        setNewKeyName("");
                      }}
                      className="min-h-[36px] rounded-lg border border-white/[0.1] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {loadingKeys ? (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-xl border border-white/[0.06] bg-[#0D1015]"
                    />
                  ))}
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#050608] p-8 text-center">
                  <FiKey className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                  <p className="text-sm font-medium text-slate-300">No API keys yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create a key to save and insert snippets directly from VS Code.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {apiKeys.map((key) => {
                    const revealed = Boolean(visibleKeys[key.id]);
                    return (
                      <div
                        key={key.id}
                        className="rounded-xl border border-white/[0.08] bg-[#0D1015] p-3.5"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {key.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Created {new Date(key.created_at).toLocaleDateString()} ·{" "}
                              {key.last_used_at
                                ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                                : "Not used yet"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setKeyToRevoke(key)}
                            aria-label={`Revoke ${key.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/12 hover:text-red-400"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-[#050608] px-3 py-2 font-mono text-xs text-slate-300">
                            {revealed ? key.api_key : maskKey(key.api_key)}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleKeys((prev) => ({
                                ...prev,
                                [key.id]: !prev[key.id],
                              }))
                            }
                            aria-label={revealed ? "Hide API key" : "Show API key"}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608] text-slate-300 hover:border-white/20"
                          >
                            {revealed ? (
                              <FiEyeOff className="h-4 w-4" />
                            ) : (
                              <FiEye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopyKey(key.api_key, key.id)}
                            aria-label="Copy API key"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608] text-slate-300 hover:border-white/20"
                          >
                            {copiedKeyId === key.id ? (
                              <FiCheck className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <FiCopy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(keyToRevoke)}
        title="Revoke API key"
        message={
          keyToRevoke
            ? `Revoke "${keyToRevoke.name}"? Any VS Code extension using this key will immediately stop syncing.`
            : ""
        }
        confirmText="Revoke Key"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => void confirmRevokeKey()}
        onCancel={() => setKeyToRevoke(null)}
      />
    </>
  );
}

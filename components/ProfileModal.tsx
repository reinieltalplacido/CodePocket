"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import AvatarUpload from "@/components/AvatarUpload";
import { FiCopy, FiTrash2, FiPlus, FiEye, FiEyeOff, FiCheck, FiUser, FiCalendar } from "react-icons/fi";
import type { Profile } from "@/lib/types/profile";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ApiKey = {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
      fetchProfile();
      fetchApiKeys();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || "");
    }
  };

  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const response = await fetch("/api/profile", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setProfile(data.profile);
      setUsername(data.profile.username || "");
      setDisplayName(data.profile.display_name || "");
      setBio(data.profile.bio || "");
    }
  };

  const fetchApiKeys = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setApiKeys(data);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUpdatingProfile(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
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

      setProfile(data.profile);
      setToast({
        show: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUploadingAvatar(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setProfile(data.profile);
      setToast({
        show: true,
        message: "Avatar uploaded successfully!",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setUploadingAvatar(false);
      return;
    }

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove avatar");
      }

      setProfile(data.profile);
      setToast({
        show: true,
        message: "Avatar removed successfully!",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const generateApiKey = () => {
    return `cpk_${Math.random().toString(36).substring(2, 15)}${Math.random()
      .toString(36)
      .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      setToast({
        show: true,
        message: "Please enter a key name",
        type: "error",
      });
      return;
    }

    setCreatingKey(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreatingKey(false);
      return;
    }

    const apiKey = generateApiKey();

    const { error } = await supabase.from("api_keys").insert({
      user_id: user.id,
      name: newKeyName.trim(),
      api_key: apiKey,
    });

    setCreatingKey(false);

    if (error) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
      return;
    }

    setToast({
      show: true,
      message: "API key created successfully!",
      type: "success",
    });

    setNewKeyName("");
    setShowNewKeyForm(false);
    fetchApiKeys();
  };

  const handleDeleteApiKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
      return;
    }

    setToast({
      show: true,
      message: "API key deleted",
      type: "success",
    });

    fetchApiKeys();
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setToast({
      show: true,
      message: "API key copied to clipboard!",
      type: "success",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    return key.substring(0, 10) + "•••••••••••••••••••";
  };

  const formatJoinedDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings" size="lg">
        <div className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-100">Avatar</h3>
            <AvatarUpload
              currentAvatar={profile?.avatar_url}
              fallbackText={displayName || username || email}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
              loading={uploadingAvatar}
            />
          </div>

          {/* Profile Info Section */}
          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-400 outline-none"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="username"
                  maxLength={20}
                  pattern="[a-z0-9_]{3,20}"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 pl-10 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                3-20 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                maxLength={50}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              />
              <p className="mt-1 text-xs text-slate-500">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Joined Date */}
            {profile?.created_at && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black px-3 py-2">
                <FiCalendar className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Joined</p>
                  <p className="text-sm text-slate-300">
                    {formatJoinedDate(profile.created_at)}
                  </p>
                </div>
              </div>
            )}

            {/* Update Button */}
            <button
              onClick={handleUpdateProfile}
              disabled={updatingProfile}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatingProfile ? "Updating..." : "Update Profile"}
            </button>
          </div>

          {/* API Keys Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">API Keys</h3>
                <p className="text-xs text-slate-500">
                  For VS Code extension and integrations
                </p>
              </div>
              {!showNewKeyForm && (
                <button
                  onClick={() => setShowNewKeyForm(true)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-emerald-400"
                >
                  <FiPlus className="h-3 w-3" />
                  New Key
                </button>
              )}
            </div>

            {/* New Key Form */}
            {showNewKeyForm && (
              <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., VS Code Extension"
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleCreateApiKey}
                    disabled={creatingKey}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {creatingKey ? "Creating..." : "Create Key"}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyForm(false);
                      setNewKeyName("");
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* API Keys List */}
            {apiKeys.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-slate-400">No API keys yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Create one to use with VS Code extension
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-100">
                          {key.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Created {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-black px-2 py-1.5 font-mono text-xs text-slate-300">
                        {visibleKeys[key.id] ? key.api_key : maskKey(key.api_key)}
                      </code>

                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/5"
                      >
                        {visibleKeys[key.id] ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyKey(key.api_key, key.id)}
                        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-white/5"
                      >
                        {copiedKey === key.id ? (
                          <FiCheck className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <FiCopy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

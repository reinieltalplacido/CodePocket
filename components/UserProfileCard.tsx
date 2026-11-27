"use client";

import { useState } from "react";
import { FiCalendar, FiCheck, FiCopy, FiEdit2, FiKey, FiLogOut, FiSliders, FiX } from "react-icons/fi";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { useVault } from "@/contexts/VaultContext";
import { useToast } from "@/contexts/ToastContext";
import { authClient } from "@/lib/auth-client";

type UserProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  onOpenPreferences?: () => void;
  onOpenApiKeys?: () => void;
};

export default function UserProfileCard({
  isOpen,
  onClose,
  onEditProfile,
  onOpenPreferences,
  onOpenApiKeys,
}: UserProfileCardProps) {
  const { user, profile, counts } = useVault();
  const { showToast } = useToast();
  const [copiedHandle, setCopiedHandle] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Developer";

  const handle = profile?.username || user?.email?.split("@")[0] || "";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently joined";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCopyHandle = async () => {
    if (!handle) return;
    try {
      await navigator.clipboard.writeText(`@${handle}`);
      setCopiedHandle(true);
      showToast("Handle copied to clipboard", "success");
      setTimeout(() => setCopiedHandle(false), 1800);
    } catch {
      showToast("Could not copy handle", "error");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch {
      setSigningOut(false);
      showToast("Failed to sign out", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" noBodyPadding>
      <div className="overflow-hidden">
        {/* Obsidian Top Strip */}
        <div className="relative h-24 border-b border-white/[0.08] bg-[#0D1015]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.16),transparent_65%)]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile card"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608]/80 text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Body */}
        <div className="relative px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <div className="inline-block rounded-full border border-white/[0.1] bg-[#0A0D12] p-1.5 shadow-xl">
              <Avatar
                src={profile?.avatar_url}
                fallbackText={displayName}
                size="2xl"
                className="h-20 w-20 text-xl"
              />
            </div>

            {handle && (
              <button
                type="button"
                onClick={() => void handleCopyHandle()}
                className="mb-1 inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D1015] px-2.5 py-1 font-mono text-xs text-slate-300 transition-colors hover:border-emerald-500/35 hover:text-emerald-300"
                title="Copy handle"
              >
                <span>@{handle}</span>
                {copiedHandle ? (
                  <FiCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <FiCopy className="h-3 w-3 text-slate-400" />
                )}
              </button>
            )}
          </div>

          <div className="mb-4">
            <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-bold text-slate-100">
              {displayName}
            </h2>
            {user?.email && (
              <p className="mt-0.5 text-xs text-slate-400">{user.email}</p>
            )}
          </div>

          {profile?.bio && (
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#050608] px-3.5 py-3">
              <p className="text-xs leading-relaxed text-slate-300">{profile.bio}</p>
            </div>
          )}

          {/* Account Metrics */}
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/[0.08] bg-[#050608] p-3">
              <p className="text-[11px] font-medium text-slate-400">Active Snippets</p>
              <p className="mt-1 font-mono text-base font-semibold text-slate-100">
                {counts.all}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#050608] p-3">
              <p className="text-[11px] font-medium text-slate-400">Member Since</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <FiCalendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>{formatDate(profile?.created_at)}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditProfile();
              }}
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Profile &amp; Settings
            </button>

            <div className="grid grid-cols-2 gap-2">
              {onOpenPreferences && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPreferences();
                  }}
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100"
                >
                  <FiSliders className="h-3.5 w-3.5" />
                  Preferences
                </button>
              )}
              {onOpenApiKeys && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenApiKeys();
                  }}
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100"
                >
                  <FiKey className="h-3.5 w-3.5" />
                  API Keys
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-60"
            >
              <FiLogOut className="h-4 w-4" />
              {signingOut ? "Signing out..." : "Log Out"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// components/InviteMemberModal.tsx
"use client";

import { useState } from "react";
import { FiX, FiMail, FiCopy, FiCheck } from "react-icons/fi";
import Modal from "./Modal";

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onSuccess: () => void;
};

export default function InviteMemberModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get session for auth token
      const { supabase } = await import("@/lib/supabase-client");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      // Just show success, no invite link
      setEmail("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiMail className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Invite to {groupName}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              They'll receive the invitation in their notifications
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

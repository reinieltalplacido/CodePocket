// components/CreateGroupModal.tsx
"use client";

import { useState } from "react";
import { FiX, FiUsers } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import Modal from "./Modal";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session?.access_token && {
            "Authorization": `Bearer ${session.access_token}`
          })
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      // Reset form
      setName("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Create New Group
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label
              htmlFor="group-name"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Group Name <span className="text-red-400">*</span>
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Alpha, Frontend Devs"
              maxLength={100}
              required
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              {name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="group-description"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group for?"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              {description.length}/500 characters
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
              disabled={loading || !name.trim()}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

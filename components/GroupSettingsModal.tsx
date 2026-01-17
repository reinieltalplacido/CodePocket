// components/GroupSettingsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FiX, FiSettings, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import Modal from "./Modal";
import type { Group } from "@/lib/types/groups";

type GroupSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  isOwner: boolean;
  onUpdate: () => void;
  onDelete: () => void;
};

export default function GroupSettingsModal({
  isOpen,
  onClose,
  group,
  isOwner,
  onUpdate,
  onDelete,
}: GroupSettingsModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update group");
      }

      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete group");
      }

      onDelete();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSettings className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Group Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {!showDeleteConfirm ? (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Group Name */}
              <div>
                <label
                  htmlFor="edit-group-name"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Group Name
                </label>
                <input
                  id="edit-group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  disabled={!isOwner}
                  required
                  className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="edit-group-description"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Description
                </label>
                <textarea
                  id="edit-group-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  disabled={!isOwner}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-2">
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Delete Group
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  {isOwner && (
                    <button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </>
        ) : (
          /* Delete Confirmation */
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <FiAlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-400">Delete Group</h3>
                <p className="mt-1 text-sm text-red-300">
                  Are you sure you want to delete <strong>{group.name}</strong>?
                  This will remove all members and shared snippets. This action
                  cannot be undone.
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

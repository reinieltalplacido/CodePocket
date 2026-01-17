// components/ShareToGroupModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FiX, FiShare2, FiCheck } from "react-icons/fi";
import Modal from "./Modal";
import type { GroupWithMembers } from "@/lib/types/groups";

type ShareToGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  snippetId: string;
  snippetTitle: string;
  onSuccess: () => void;
};

export default function ShareToGroupModal({
  isOpen,
  onClose,
  snippetId,
  snippetTitle,
  onSuccess,
}: ShareToGroupModalProps) {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups", {
        credentials: "include"
      });
      const data = await response.json();
      
      if (response.ok) {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleShare = async () => {
    if (selectedGroups.size === 0) {
      setError("Please select at least one group");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const promises = Array.from(selectedGroups).map((groupId) =>
        fetch(`/api/groups/${groupId}/snippets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ snippet_id: snippetId }),
        })
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => !r.ok);

      if (failed.length > 0) {
        throw new Error(`Failed to share to ${failed.length} group(s)`);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedGroups(new Set());
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiShare2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">
              Share to Groups
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Snippet Info */}
        <div className="mb-4 rounded-lg border border-white/10 bg-black p-3">
          <p className="text-xs text-slate-400">Sharing snippet</p>
          <p className="mt-0.5 font-medium text-slate-100">{snippetTitle}</p>
        </div>

        {/* Groups List */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Select Groups
          </label>
          
          {groups.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-black p-4 text-center">
              <p className="text-sm text-slate-400">
                You're not a member of any groups yet
              </p>
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black p-2">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    selectedGroups.has(group.id)
                      ? "bg-emerald-500/20 border border-emerald-500/30"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      selectedGroups.has(group.id)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-500"
                    }`}
                  >
                    {selectedGroups.has(group.id) && (
                      <FiCheck className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 truncate">
                      {group.name}
                    </p>
                    {group.description && (
                      <p className="text-xs text-slate-400 truncate">
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Member Count */}
                  <span className="text-xs text-slate-500">
                    {group.member_count || 0} members
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading || selectedGroups.size === 0 || groups.length === 0}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sharing..." : `Share to ${selectedGroups.size} group(s)`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

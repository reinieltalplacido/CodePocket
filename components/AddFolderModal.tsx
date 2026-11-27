"use client";

import { useState, FormEvent } from "react";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/ToastContext";
import { useVault } from "@/contexts/VaultContext";

type AddFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const COLORS = [
  { name: "Emerald", value: "emerald", class: "bg-emerald-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
];

export default function AddFolderModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFolderModalProps) {
  const { showToast } = useToast();
  const { createFolder } = useVault();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("emerald");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFieldError("Folder name is required");
      showToast("Folder name is required", "error");
      return;
    }

    setFieldError(null);
    setLoading(true);

    const res = await createFolder({
      name: name.trim(),
      description: description.trim() || null,
      color,
    });

    setLoading(false);

    if (!res.ok) {
      setFieldError(res.error || "Failed to create folder");
      showToast(res.error || "Failed to create folder", "error");
      return;
    }

    setName("");
    setDescription("");
    setColor("emerald");
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    setFieldError(null);
    setName("");
    setDescription("");
    setColor("emerald");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Folder"
      subtitle="Organize snippets by project, framework, or workflow."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="folder-name"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Folder Name <span className="text-red-400">*</span>
          </label>
          <input
            id="folder-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldError) setFieldError(null);
            }}
            placeholder="e.g., Auth Helpers"
            autoFocus
            className="min-h-[42px] w-full rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
          {fieldError && (
            <p className="mt-1.5 text-xs text-red-400">{fieldError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="folder-desc"
            className="mb-1.5 block text-xs font-medium text-slate-300"
          >
            Description
          </label>
          <textarea
            id="folder-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes for this collection..."
            rows={2}
            className="w-full resize-none rounded-lg border border-white/[0.1] bg-[#050608] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-slate-300">
            Folder Color
          </span>
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={`Select ${c.name} color`}
                aria-pressed={color === c.value}
                className={`h-9 w-9 rounded-full ${c.class} transition-all ${
                  color === c.value
                    ? "scale-105 ring-2 ring-white ring-offset-2 ring-offset-[#0A0D12]"
                    : "opacity-55 hover:opacity-100"
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/[0.08] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[40px] rounded-lg border border-white/[0.1] bg-[#0D1015] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[40px] rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

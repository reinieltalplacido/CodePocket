// components/AddSnippetModal.tsx
"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";

type AddSnippetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "Go",
  "Rust",
  "PHP",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
  "Other",
];

export default function AddSnippetModal({
  isOpen,
  onClose,
  onSuccess,
}: AddSnippetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !code.trim()) {
      setToast({
        show: true,
        message: "Title and code are required",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from("snippets").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      code: code.trim(),
      language,
      tags,
    });

    setLoading(false);

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
      message: "Snippet created successfully!",
      type: "success",
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("JavaScript");
    setTagsInput("");

    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("JavaScript");
    setTagsInput("");
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create New Snippet"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React useDebounce hook"
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Language */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Language <span className="text-red-400">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Code */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Code <span className="text-red-400">*</span>
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows={10}
              className="font-mono w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, hooks, custom (comma-separated)"
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate tags with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Snippet"}
            </button>
          </div>
        </form>
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

// components/CreateGroupSnippetModal.tsx
"use client";

import { useState, FormEvent } from "react";
import { FiX, FiCode } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import MonacoEditor from "./MonacoEditor";
import Modal from "./Modal";

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

type CreateGroupSnippetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onSuccess: () => void;
};

export default function CreateGroupSnippetModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSuccess,
}: CreateGroupSnippetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !code.trim()) {
      setError("Title and code are required");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      // Create the snippet
      const { data: snippet, error: snippetError } = await supabase
        .from("snippets")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          code: code.trim(),
          language,
          tags: [],
        })
        .select()
        .single();

      if (snippetError) throw snippetError;

      // Share the snippet to the group
      const { error: shareError } = await supabase
        .from("group_snippets")
        .insert({
          group_id: groupId,
          snippet_id: snippet.id,
          shared_by: user.id,
        });

      if (shareError) throw shareError;

      // Reset form
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("JavaScript");
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating snippet:", err);
      setError(err.message || "Failed to create snippet");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("JavaScript");
      setError("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="large">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Create Snippet
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Create and share to {groupName}
          </p>
        </div>
        <button
          onClick={handleClose}
          disabled={loading}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 disabled:opacity-50"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Snippet title..."
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              disabled={loading}
            />
          </div>

          {/* Language */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
              disabled={loading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
              disabled={loading}
            />
          </div>

          {/* Code Editor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Code
            </label>
            <MonacoEditor
              value={code}
              onChange={setCode}
              language={language}
              height="300px"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCode className="h-4 w-4" />
            {loading ? "Creating..." : "Create & Share"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

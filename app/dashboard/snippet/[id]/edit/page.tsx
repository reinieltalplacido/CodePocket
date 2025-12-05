"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FiArrowLeft } from "react-icons/fi";

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

type Folder = {
  id: string;
  name: string;
  color: string;
};

export default function EditSnippetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [folderId, setFolderId] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingLoading, setFetchingLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const originalDataRef = useRef({
    title: "",
    description: "",
    code: "",
    language: "",
    folderId: "",
    tagsInput: "",
  });

  useEffect(() => {
    fetchFolders();
    fetchSnippet();
  }, [id]);

  useEffect(() => {
    // Check if any field has changed
    const changed =
      title !== originalDataRef.current.title ||
      description !== originalDataRef.current.description ||
      code !== originalDataRef.current.code ||
      language !== originalDataRef.current.language ||
      folderId !== originalDataRef.current.folderId ||
      tagsInput !== originalDataRef.current.tagsInput;

    setHasChanges(changed);
  }, [title, description, code, language, folderId, tagsInput]);

  const fetchFolders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (data) {
      setFolders(data);
    }
  };

  const fetchSnippet = async () => {
    setFetchingLoading(true);
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      const titleData = data.title;
      const descData = data.description || "";
      const codeData = data.code;
      const langData = data.language;
      const folderData = data.folder_id || "";
      const tagsData = data.tags?.join(", ") || "";

      setTitle(titleData);
      setDescription(descData);
      setCode(codeData);
      setLanguage(langData);
      setFolderId(folderData);
      setTagsInput(tagsData);

      // Store original data
      originalDataRef.current = {
        title: titleData,
        description: descData,
        code: codeData,
        language: langData,
        folderId: folderData,
        tagsInput: tagsData,
      };
    }
    setFetchingLoading(false);
  };

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

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase
      .from("snippets")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        code: code.trim(),
        language,
        folder_id: folderId || null,
        tags,
      })
      .eq("id", id);

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
      message: "Snippet updated successfully!",
      type: "success",
    });

    setTimeout(() => {
      router.replace(`/dashboard/snippet/${id}`);
    }, 1000);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    router.back();
  };

  const lines = code.split("\n").length;

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  if (fetchingLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-400">Loading snippet...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-slate-100">
            Edit Snippet
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
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
              />
            </div>

            {/* File Extension */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                File Extension
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={language.toLowerCase()}
                  readOnly
                  className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-400 outline-none"
                />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Folder */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Folder (Optional)
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
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
              placeholder="Brief description of this code snippet..."
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Code with line numbers */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Code
            </label>

            <div className="flex rounded-lg border border-white/10 bg-[#020617] text-slate-100">
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="max-h-[360px] select-none overflow-hidden border-r border-white/10 bg-black/60 px-3 py-3 text-right text-xs leading-6 text-slate-500"
              >
                {Array.from({ length: lines }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                placeholder="// Paste your code here..."
                className="custom-scrollbar font-mono max-h-[360px] w-full resize-none bg-transparent px-3 py-3 text-xs leading-6 text-slate-100 outline-none placeholder:text-slate-600"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add tags (comma-separated)"
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="warning"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

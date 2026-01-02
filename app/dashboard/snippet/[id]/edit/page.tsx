"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import MonacoEditor from "@/components/MonacoEditor";
import TagInput from "@/components/TagInput";
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
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

  const originalDataRef = useRef({
    title: "",
    description: "",
    code: "",
    language: "",
    folderId: "",
    tags: [] as string[],
  });

  useEffect(() => {
    fetchFolders();
    fetchSnippet();
    fetchTagSuggestions();
  }, [id]);

  useEffect(() => {
    // Check if any field has changed
    const changed =
      title !== originalDataRef.current.title ||
      description !== originalDataRef.current.description ||
      code !== originalDataRef.current.code ||
      language !== originalDataRef.current.language ||
      folderId !== originalDataRef.current.folderId ||
      JSON.stringify(tags) !== JSON.stringify(originalDataRef.current.tags);

    setHasChanges(changed);
  }, [title, description, code, language, folderId, tags]);

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

  const fetchTagSuggestions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("snippets")
      .select("tags")
      .eq("user_id", user.id)
      .not("tags", "is", null);

    if (data) {
      // Extract all unique tags from all snippets
      const allTags = data.flatMap((snippet) => snippet.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      setTagSuggestions(uniqueTags);
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
      const tagsData = data.tags || [];

      setTitle(titleData);
      setDescription(descData);
      setCode(codeData);
      setLanguage(langData);
      setFolderId(folderData);
      setTags(tagsData);

      // Store original data
      originalDataRef.current = {
        title: titleData,
        description: descData,
        code: codeData,
        language: langData,
        folderId: folderData,
        tags: tagsData,
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

            {/* Language */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Language
              </label>
              <div className="flex items-center gap-3">
                {/* Language Badge */}
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 px-4 py-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                  <span className="text-sm font-medium text-emerald-400">
                    {language}
                  </span>
                </div>
                
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
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

          {/* Code Editor */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Code
            </label>
            <MonacoEditor
              value={code}
              onChange={setCode}
              language={language}
              height="400px"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Tags
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={tagSuggestions}
              placeholder="Add tags..."
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

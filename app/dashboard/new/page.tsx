"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import MonacoEditor from "@/components/MonacoEditor";
import TagInput from "@/components/TagInput";
import { useVault } from "@/contexts/VaultContext";
import { useToast } from "@/contexts/ToastContext";
import { SNIPPET_LANGUAGES } from "@/lib/languages";
import { FiArrowLeft } from "react-icons/fi";

export default function NewSnippetPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { folders, preferences, notifyMutation } = useVault();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<string>(preferences.defaultLanguage || "TypeScript");
  const [folderId, setFolderId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLanguage(preferences.defaultLanguage || "TypeScript");
  }, [preferences.defaultLanguage]);

  useEffect(() => {
    void fetchTagSuggestions();
  }, []);

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
      const allTags = data.flatMap((snippet) => snippet.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      setTagSuggestions(uniqueTags);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !code.trim()) {
      showToast("Title and code are required", "error");
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

    const { error } = await supabase.from("snippets").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      code: code.trim(),
      language,
      folder_id: folderId || null,
      tags,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    notifyMutation("snippets");
    showToast("Snippet created", "success");
    router.push("/dashboard");
  };

  return (
    <>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-slate-100">
            Add New Snippet
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
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2"
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
                  {SNIPPET_LANGUAGES.map((lang) => (
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
              className="w-full resize-none rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2"
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-[#050608] transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Snippet"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

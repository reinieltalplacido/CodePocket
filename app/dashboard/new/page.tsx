// app/dashboard/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
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

export default function NewSnippetPage() {
  const router = useRouter();
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

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
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

          {/* Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Code
            </label>
            <div className="relative rounded-lg border border-white/10 bg-slate-950">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <span className="text-xs font-mono text-slate-400">1</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste your code here..."
                rows={12}
                className="w-full resize-none bg-transparent px-3 py-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-600"
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
              placeholder="Add tags (press Enter)"
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Snippet"}
            </button>
          </div>
        </form>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}

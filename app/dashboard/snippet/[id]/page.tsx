"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import CodeBlock from "@/components/CodeBlock";
import { FiArrowLeft, FiCopy, FiTrash2, FiEdit2, FiCheck, FiStar } from "react-icons/fi";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  created_at: string;
  is_favorite?: boolean;
};

export default function SnippetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setSnippet(data);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setToast({
        show: true,
        message: "Code copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);

    const { error } = await supabase.from("snippets").delete().eq("id", id);

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
      message: "Snippet deleted successfully!",
      type: "success",
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const toggleFavorite = async () => {
    if (!snippet) return;

    const newFavoriteState = !snippet.is_favorite;

    // Optimistic update
    setSnippet({ ...snippet, is_favorite: newFavoriteState });

    const { error } = await supabase
      .from("snippets")
      .update({ is_favorite: newFavoriteState })
      .eq("id", id);

    if (error) {
      // Revert on error
      setSnippet({ ...snippet, is_favorite: !newFavoriteState });
      setToast({
        show: true,
        message: "Failed to update favorite",
        type: "error",
      });
    } else {
      setToast({
        show: true,
        message: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        type: "success",
      });
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-400">Loading snippet...</p>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-slate-400">Snippet not found</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const lines = snippet.code.split("\n").length;

  return (
    <>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">
                {snippet.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Created {new Date(snippet.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
              title={snippet.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FiStar
                className={`h-4 w-4 ${
                  snippet.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : ""
                }`}
              />
              {snippet.is_favorite ? "Favorited" : "Favorite"}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              {copied ? (
                <>
                  <FiCheck className="h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={() => router.push(`/dashboard/snippet/${id}/edit`)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Language badge */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
              {snippet.language}
            </span>
          </div>

          {/* Description */}
          {snippet.description && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-300">
                Description
              </h2>
              <p className="text-sm text-slate-400">{snippet.description}</p>
            </div>
          )}

          {/* Code */}
          <div>
            <h2 className="mb-2 text-sm font-medium text-slate-300">Code</h2>
            <CodeBlock
              code={snippet.code}
              language={snippet.language}
              showLineNumbers={true}
              maxHeight="500px"
            />
          </div>

          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-300">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {snippet.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Snippet"
        message="Are you sure you want to delete this snippet? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
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

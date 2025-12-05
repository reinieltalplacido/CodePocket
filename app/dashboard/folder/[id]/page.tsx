"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiArrowLeft, FiTrash2, FiPlus } from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[] | null;
  created_at: string;
};

type Folder = {
  id: string;
  name: string;
  description: string | null;
  color: string;
};

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.id as string;

  const [folder, setFolder] = useState<Folder | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    fetchFolder();
    fetchSnippets();
  }, [folderId]);

  const fetchFolder = async () => {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .single();

    if (data) {
      setFolder(data);
    }
  };

  const fetchSnippets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("snippets")
      .select("*")
      .eq("folder_id", folderId)
      .order("created_at", { ascending: false });

    if (data) {
      setSnippets(data);
    }
    setLoading(false);
  };

  const handleDeleteFolder = async () => {
    setShowDeleteConfirm(false);

    const { error } = await supabase.from("folders").delete().eq("id", folderId);

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
      message: "Folder deleted successfully!",
      type: "success",
    });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: "bg-emerald-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    };
    return colors[color] || colors.emerald;
  };

  if (loading || !folder) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-400">Loading folder...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${getColorClass(folder.color)}`}
                />
                <h1 className="text-2xl font-semibold text-slate-100">
                  {folder.name}
                </h1>
              </div>
              {folder.description && (
                <p className="mt-2 text-sm text-slate-400">{folder.description}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/new")}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              <FiPlus className="h-4 w-4" />
              New Snippet
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Snippets Grid */}
        {snippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 py-12">
            <p className="text-sm text-slate-400">No snippets in this folder yet</p>
            <button
              onClick={() => router.push("/dashboard/new")}
              className="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
            >
              Create your first snippet
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                onClick={() => router.push(`/dashboard/snippet/${snippet.id}`)}
                className="group cursor-pointer rounded-lg border border-white/10 bg-black p-4 transition-all hover:border-emerald-500/50 hover:bg-white/5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium text-slate-100 group-hover:text-emerald-400">
                    {snippet.title}
                  </h3>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    {snippet.language}
                  </span>
                </div>

                {snippet.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-slate-400">
                    {snippet.description}
                  </p>
                )}

                <div className="rounded bg-slate-950 p-2">
                  <pre className="line-clamp-3 text-xs text-slate-300">
                    {snippet.code}
                  </pre>
                </div>

                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {snippet.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  {new Date(snippet.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? Snippets inside will not be deleted, but they will be moved to 'No Folder'."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteFolder}
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

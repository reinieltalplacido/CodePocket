// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiPlus, FiSearch, FiCode } from "react-icons/fi";

type Snippet = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSnippets(data);
    }
    setLoading(false);
  };

  const filteredSnippets = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Your snippets
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/new")}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
        >
          <FiPlus className="h-4 w-4" />
          New Snippet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none ring-emerald-500/60 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2"
        />
      </div>

      {/* Snippets Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-400">Loading snippets...</p>
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16">
          <FiCode className="mb-3 h-12 w-12 text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-300">
            {searchQuery ? "No snippets found" : "No snippets yet"}
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            {searchQuery
              ? "Try a different search term"
              : "Create your first snippet to get started"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push("/dashboard/new")}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              <FiPlus className="h-4 w-4" />
              New Snippet
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSnippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
}

function SnippetCard({ snippet }: { snippet: Snippet }) {
  const router = useRouter();
  
  return (
    <div
      onClick={() => router.push(`/dashboard/snippet/${snippet.id}`)}
      className="group cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-white/10"
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-medium text-slate-100">{snippet.title}</h3>
        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
          {snippet.language}
        </span>
      </div>
      {snippet.description && (
        <p className="mb-3 line-clamp-2 text-xs text-slate-400">
          {snippet.description}
        </p>
      )}
      <pre className="mb-3 overflow-hidden rounded bg-black/50 p-2 text-xs text-slate-300">
        <code className="line-clamp-3">{snippet.code}</code>
      </pre>
      <div className="text-xs text-slate-500">
        {new Date(snippet.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}


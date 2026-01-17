"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiCode, FiFolder, FiSearch, FiUsers, FiStar, FiZap, FiLock, FiClock } from "react-icons/fi";
import { useLenis } from "@/hooks/useLenis";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import GradualBlur from "@/components/GradualBlur";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // Initialize Lenis smooth scroll
  useLenis();
  
  // Scroll animations for each section
  const heroAnimation = useScrollAnimation(0.1);
  const dashboardAnimation = useScrollAnimation(0.2);
  const featuresAnimation = useScrollAnimation(0.1);
  const ctaAnimation = useScrollAnimation(0.2);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0e1a] text-slate-50">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <span className="text-lg font-bold text-white">CP</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Code<span className="text-emerald-400">Pocket</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 font-medium text-slate-300 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl text-center">
          <div className={`transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
              <FiZap className="h-4 w-4" />
              Save smarter, code faster
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Everything you need
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                to manage your snippets
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              Organize, search, and share your code snippets efficiently. Never rewrite the same code twice.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-500 px-8 py-3.5 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/40"
              >
                Get started for free
              </Link>
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-3.5 text-base font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/10"
              >
                Sign in
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section ref={dashboardAnimation.ref} className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left - Text Content */}
            <div className={`flex flex-col justify-center transition-all duration-1000 ${dashboardAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Boost your productivity.
                <br />
                Start using our app today.
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-slate-400">
                Access your snippets from anywhere. Organize with folders and tags. Share with your team. All in one beautiful interface.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-lg bg-emerald-500 px-6 py-3 text-base font-semibold text-black transition-all hover:bg-emerald-400"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="group flex items-center gap-2 text-base font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Learn more
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className={`flex items-center justify-center transition-all duration-1000 delay-300 ${dashboardAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-2xl">
                {/* Dashboard Header */}
                <div className="border-b border-white/10 bg-slate-900/80 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                      <span className="text-lg font-bold text-white">CP</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">CodePocket</div>
                      <div className="text-xs text-slate-500">Snippet Manager</div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-48 border-r border-white/10 bg-slate-900/60 p-4">
                    <nav className="space-y-1">
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5">
                        <FiCode className="h-4 w-4" />
                        <span>All Snippets</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5">
                        <FiStar className="h-4 w-4" />
                        <span>Favorites</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
                        <FiUsers className="h-4 w-4" />
                        <span>Groups</span>
                      </div>
                    </nav>
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between px-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Folders</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="flex-1 truncate">React Hooks</span>
                          <span className="text-xs text-slate-600">12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">Dashboard</h3>
                    </div>
                    
                    {/* Snippet Cards */}
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/60">
                        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                          <span className="text-sm font-medium text-slate-200">useDebounce</span>
                          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400">TSX</span>
                        </div>
                        <div className="p-3">
                          <pre className="text-xs leading-relaxed text-slate-400">
                            <code>
                              <span className="text-purple-400">import</span>{" "}
                              <span className="text-slate-300">{"{"}</span>{" "}
                              <span className="text-cyan-400">useState</span>
                              <span className="text-slate-300">,</span>{" "}
                              <span className="text-cyan-400">useEffect</span>{" "}
                              <span className="text-slate-300">{"}"}</span>
                            </code>
                          </pre>
                        </div>
                        <div className="border-t border-white/10 px-3 py-1.5 text-xs text-slate-600">
                          1/16/2026
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900/60">
                        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                          <span className="text-sm font-medium text-slate-200">API Helper</span>
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">JS</span>
                        </div>
                        <div className="p-3">
                          <pre className="text-xs leading-relaxed text-slate-400">
                            <code>
                              <span className="text-purple-400">const</span>{" "}
                              <span className="text-cyan-400">fetchData</span>{" "}
                              <span className="text-slate-400">=</span>{" "}
                              <span className="text-purple-400">async</span>
                            </code>
                          </pre>
                        </div>
                        <div className="border-t border-white/10 px-3 py-1.5 text-xs text-slate-600">
                          1/15/2026
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresAnimation.ref} className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Bento Box Grid Layout */}
          <div className="grid gap-6 md:grid-cols-6 lg:grid-cols-6 auto-rows-fr">
            {/* Feature 1 - Syntax Highlighting - LARGE FEATURED BOX (spans 2 columns) */}
            <div className={`group md:col-span-6 lg:col-span-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Syntax Highlighting</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Beautiful code display with Monaco Editor integration for all major programming languages.
                </p>
              </div>

              {/* Code Preview */}
              <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/60">
                <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/80 px-3 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500/80" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
                    <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500">snippet.tsx</span>
                </div>
                <div className="p-3">
                  <pre className="text-xs leading-relaxed">
                    <code>
                      <span className="text-purple-400">import</span>{" "}
                      <span className="text-slate-400">{"{"}</span>{" "}
                      <span className="text-cyan-400">CodePocketAPI</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-cyan-400">SnippetManager</span>{" "}
                      <span className="text-slate-400">{"}"}</span>{" "}
                      <span className="text-purple-400">from</span>{" "}
                      <span className="text-emerald-400">'@/lib/codepocket/api'</span>
                      <span className="text-slate-400">;</span>
                      {"\n"}
                      <span className="text-purple-400">import</span>{" "}
                      <span className="text-slate-400">{"{"}</span>{" "}
                      <span className="text-cyan-400">useState</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-cyan-400">useEffect</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-cyan-400">useCallback</span>{" "}
                      <span className="text-slate-400">{"}"}</span>{" "}
                      <span className="text-purple-400">from</span>{" "}
                      <span className="text-emerald-400">'react'</span>
                      <span className="text-slate-400">;</span>
                      {"\n\n"}
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-cyan-400">createSnippetWithMetadata</span>{" "}
                      <span className="text-slate-400">=</span>{" "}
                      <span className="text-slate-400">{"{"}</span>
                      {"\n"}
                      {"  "}
                      <span className="text-orange-300">title</span>
                      <span className="text-slate-400">:</span>{" "}
                      <span className="text-emerald-400">"useCodePocketAuthenticationHook"</span>
                      <span className="text-slate-400">,</span>
                      {"\n"}
                      {"  "}
                      <span className="text-orange-300">language</span>
                      <span className="text-slate-400">:</span>{" "}
                      <span className="text-emerald-400">"typescript"</span>
                      <span className="text-slate-400">,</span>
                      {"\n"}
                      {"  "}
                      <span className="text-orange-300">tags</span>
                      <span className="text-slate-400">:</span>{" "}
                      <span className="text-slate-400">[</span>
                      <span className="text-emerald-400">"react"</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-emerald-400">"hooks"</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-emerald-400">"authentication"</span>
                      <span className="text-slate-400">,</span>{" "}
                      <span className="text-emerald-400">"typescript"</span>
                      <span className="text-slate-400">],</span>
                      {"\n"}
                      {"  "}
                      <span className="text-orange-300">description</span>
                      <span className="text-slate-400">:</span>{" "}
                      <span className="text-emerald-400">"Custom React hook for managing authentication state"</span>
                      {"\n"}
                      <span className="text-slate-400">{"}"}</span>
                      <span className="text-slate-400">;</span>
                      {"\n\n"}
                      <span className="text-slate-600">{"// Save snippet to CodePocket with automatic sync"}</span>
                      {"\n"}
                      <span className="text-purple-400">await</span>{" "}
                      <span className="text-cyan-400">SnippetManager</span>
                      <span className="text-slate-400">.</span>
                      <span className="text-yellow-400">saveWithAutoSync</span>
                      <span className="text-slate-400">(</span>
                      <span className="text-cyan-400">createSnippetWithMetadata</span>
                      <span className="text-slate-400">);</span>
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Feature 2 - Smart Organization - MEDIUM BOX (right side of row 1) */}
            <div className={`group md:col-span-6 lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 delay-100 hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Smart Organization</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Keep your snippets organized with folders, tags, and favorites for quick access.
                </p>
              </div>

              {/* Folder Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 p-3 transition-colors hover:bg-slate-900/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <FiFolder className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">React Hooks</div>
                    <div className="text-xs text-slate-500">12 snippets</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 p-3 transition-colors hover:bg-slate-900/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                    <FiFolder className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">Utilities</div>
                    <div className="text-xs text-slate-500">8 snippets</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/60 p-3 transition-colors hover:bg-slate-900/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <FiFolder className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">API Helpers</div>
                    <div className="text-xs text-slate-500">15 snippets</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Powerful Search - SMALL BOX (row 2, left) */}
            <div className={`group md:col-span-3 lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 delay-200 hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Powerful Search</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Find any snippet instantly with full-text search across titles, descriptions, and code.
                </p>
              </div>

              {/* Search Preview */}
              <div className="space-y-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search snippets..."
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="mb-1 text-sm font-medium text-slate-200">useDebounce</div>
                    <div className="text-xs text-slate-500">TypeScript • React Hooks</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3 opacity-60">
                    <div className="mb-1 text-sm font-medium text-slate-200">useFetch</div>
                    <div className="text-xs text-slate-500">TypeScript • API Helpers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 - Team Collaboration - SMALL BOX (row 2, middle) */}
            <div className={`group md:col-span-3 lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 delay-300 hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Team Collaboration</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Create groups to share snippets with your team and collaborate on code together.
                </p>
              </div>

              {/* Team Members Stack */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex -space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 ring-4 ring-slate-900 text-white font-semibold text-sm">
                    JD
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 ring-4 ring-slate-900 text-white font-semibold text-sm">
                    AS
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 ring-4 ring-slate-900 text-white font-semibold text-sm">
                    MK
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 ring-4 ring-slate-900 text-white font-semibold text-sm">
                    RL
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 ring-4 ring-slate-900 text-slate-300 font-semibold text-xs">
                    +12
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm font-medium text-slate-300">16 team members</div>
                  <div className="text-xs text-slate-500 mt-1">Sharing 127 snippets</div>
                </div>
              </div>
            </div>

            {/* Feature 5 - Lightning Fast - SMALL BOX (row 2, right) */}
            <div className={`group md:col-span-6 lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 delay-[400ms] hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">Lightning Fast</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Built with Next.js and Supabase for blazing-fast performance and real-time updates.
                </p>
              </div>

              {/* Performance Metric */}
              <div className="py-6">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-emerald-400">1.2</span>
                      <span className="text-lg text-slate-500">s</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Avg load time</div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                    <span>-32%</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                
                {/* Performance Chart */}
                <div className="flex items-end justify-between gap-1 h-20">
                  {[45, 52, 48, 65, 58, 70, 55, 72, 68, 85, 78, 92, 88, 95].map((height, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t bg-gradient-to-t from-emerald-500/60 to-emerald-400/60 transition-all hover:from-emerald-500 hover:to-emerald-400"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 6 - VSCode Extension - MEDIUM CENTERED BOX (row 3, centered) */}
            <div className={`group md:col-span-6 lg:col-span-4 lg:col-start-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-500 delay-500 hover:border-emerald-500/30 ${featuresAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-100">VSCode Extension</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Save snippets directly from VSCode to CodePocket with our extension. One click to save your code.
                </p>
              </div>

              {/* VSCode Extension Preview */}
              <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/60">
                {/* VSCode Command Palette Header */}
                <div className="border-b border-white/10 bg-[#1e1e1e] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{">"}</span>
                    <span className="text-[10px] text-slate-400">Codepocket</span>
                  </div>
                </div>
                
                {/* Command Palette Content */}
                <div className="bg-[#252526] p-2 space-y-1">
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 bg-emerald-500/20 border-l-2 border-emerald-400">
                    <span className="text-[10px] font-semibold text-emerald-400">CodePocket:</span>
                    <span className="text-[10px] text-white">Save Selection as Snippet</span>
                    <span className="ml-auto text-[9px] text-slate-500">recently used</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-[#2a2d2e]">
                    <span className="text-[10px] font-semibold text-emerald-400">CodePocket:</span>
                    <span className="text-[10px] text-slate-300">Insert Snippet</span>
                  </div>
                </div>
                
                {/* Extension Icon Display */}
                <div className="border-t border-white/10 bg-slate-900/60 p-4 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/30">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">CodePocket Extension</div>
                      <div className="text-xs text-slate-500">Save & manage snippets</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaAnimation.ref} className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        <div className={`relative mx-auto max-w-4xl text-center transition-all duration-1000 ${ctaAnimation.isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to organize your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              code snippets?
            </span>
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Join developers who are saving time and staying organized with CodePocket.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-black shadow-xl shadow-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/40"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} CodePocket. All rights reserved.</span>
          <span>Built with Next.js, Tailwind CSS & Supabase</span>
        </div>
      </footer>
    </main>
  );
}

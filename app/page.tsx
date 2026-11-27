"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiExternalLink, FiMenu, FiX } from "react-icons/fi";
import { useLenis } from "@/hooks/useLenis";
import VaultPreview from "@/components/landing/VaultPreview";
import VsCodeSyncDemo from "@/components/landing/VsCodeSyncDemo";
import { AVAILABLE_THEMES } from "@/lib/themes";

const CAPABILITIES = [
  {
    name: "Colored Folders & Multi-Tagging",
    detail:
      "Group recipes into color-coded folders and attach reusable tags so related utilities stay together.",
    spec: "6 folder colors, unlimited tags",
  },
  {
    name: "Monaco Code Editor & 7 Syntax Themes",
    detail:
      "Edit snippets with indentation preserved and switch between VS Code Dark+, Dracula, One Dark, Nord, GitHub Dark, Monokai, and Solarized Dark.",
    spec: "Powered by @monaco-editor/react",
  },
  {
    name: "Soft-Delete Archive & Recovery",
    detail:
      "Deleting a snippet moves it to Archive first. Restore it back into your vault or delete it permanently whenever you choose.",
    spec: "Non-destructive archive flow",
  },
  {
    name: "Personal API Keys for VS Code",
    detail:
      "Generate scoped cpk_ keys from your profile modal to push or fetch snippets straight from Visual Studio Code or shell scripts.",
    spec: "x-api-key authentication",
  },
];

export default function Home() {
  useLenis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#050608] text-[#F8FAFC] selection:bg-[#10B981]/25 selection:text-[#F8FAFC]">
      {/* Sticky Obsidian Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050608]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            aria-label="CodePocket Home"
          >
            <Image
              src="/CodePocket Tech Logo.png"
              alt="CodePocket"
              width={2137}
              height={736}
              priority
              className="h-10 w-auto sm:h-12 md:h-14"
            />
          </Link>

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Primary navigation"
          >
            <a
              href="#preview"
              className="rounded px-1 py-1 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              Preview
            </a>
            <a
              href="#vscode-sync"
              className="rounded px-1 py-1 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              VS Code Sync
            </a>
            <Link
              href="/dashboard/help"
              className="rounded px-1 py-1 text-sm font-medium text-[#94A3B8] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
            >
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden min-h-[44px] items-center justify-center rounded-lg border border-white/[0.12] bg-[#0D1015] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg bg-[#10B981] px-3 py-2 text-xs font-semibold text-[#050608] transition-colors hover:bg-[#34D399] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608] sm:px-4 sm:text-sm"
            >
              Create Free Vault
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.12] bg-[#0D1015] text-slate-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.08] bg-[#090B0E] px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                Preview
              </a>
              <a
                href="#vscode-sync"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                VS Code Sync
              </a>
              <Link
                href="/dashboard/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-md px-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"
              >
                Documentation
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg border border-white/[0.12] bg-[#0D1015] text-sm font-medium text-slate-200"
              >
                Sign In
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Asymmetric Hero Opener + Immediate Interactive Vault Preview */}
        <section className="px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <div className="min-w-0 lg:col-span-7">
                <h1 className="font-[family-name:var(--font-bricolage)] text-4xl font-bold leading-[1.06] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.45rem]">
                  Your personal vault for code worth keeping.
                </h1>
              </div>

              <div className="min-w-0 lg:col-span-5 lg:pb-1">
                <p className="text-base leading-relaxed text-[#94A3B8]">
                  CodePocket is a personal snippet vault for developers. Capture functions straight from VS Code, group them into colored folders, and retrieve exact syntax in seconds.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    id="hero-cta"
                    href="/signup"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-[#050608] transition-colors hover:bg-[#34D399] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608]"
                  >
                    Create Free Vault
                  </Link>
                  <a
                    href="#preview"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/[0.14] bg-[#0D1015] px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                  >
                    View Dashboard Preview
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Product Preview */}
            <div id="preview" className="mt-10 scroll-mt-20 sm:mt-12">
              <VaultPreview />
            </div>
          </div>
        </section>

        {/* Asymmetric Split: VS Code & API Key Integration */}
        <section
          id="vscode-sync"
          className="scroll-mt-20 border-y border-white/[0.08] bg-[#0A0D12] px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:items-center">
            <div className="min-w-0 lg:col-span-5">
              <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                Save and insert snippets straight from VS Code.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#94A3B8]">
                Install the CodePocket Snippets extension, paste your personal API key once, and use the Command Palette to save highlighted code or insert any vault snippet directly at your cursor.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=Reiniel.codepocket-snippets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-[#050608] transition-colors hover:bg-[#34D399] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D12]"
                >
                  <span>Install VS Code Extension</span>
                  <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/dashboard/help"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/[0.14] bg-[#11151B] px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-500/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                >
                  <span>Read Extension Guide</span>
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <VsCodeSyncDemo />
            </div>
          </div>
        </section>

        {/* Architectural Ledger */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">
                Everything included in your vault.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
                Built around personal snippet management, fast search, and reliable recovery rather than social clutter.
              </p>
            </div>

            <div className="mt-10 divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {CAPABILITIES.map((item) => (
                <div
                  key={item.name}
                  className="grid gap-3 py-6 md:grid-cols-12 md:items-baseline"
                >
                  <h3 className="font-[family-name:var(--font-bricolage)] text-lg font-semibold text-white md:col-span-4">
                    {item.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#94A3B8] md:col-span-5">
                    {item.detail}
                  </p>
                  <div className="font-mono text-xs font-medium text-[#34D399] md:col-span-3 md:text-right">
                    {item.spec}
                  </div>
                </div>
              ))}
            </div>

            {/* Real Syntax Theme Swatches from lib/themes.ts */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.1] bg-[#0A0D12] px-5 py-4">
              <span className="text-sm font-medium text-slate-200">
                Supported workspace syntax themes
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {AVAILABLE_THEMES.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-[#11151B] px-2.5 py-1 text-xs font-medium text-slate-200"
                  >
                    <span
                      className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-white/20"
                      style={{ backgroundColor: t.preview.background }}
                      aria-hidden="true"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: t.preview.keyword }}
                      />
                    </span>
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grounded Closing CTA */}
        <section className="border-t border-white/[0.08] bg-[#0A0D12] px-4 py-16 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
                Ready to organize your snippets in one place?
              </h2>
              <p className="mt-2 text-sm text-[#94A3B8]">
                Create an account to start saving snippets on the web or pair your VS Code editor with an API key.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#10B981] px-6 py-2.5 text-sm font-semibold text-[#050608] transition-colors hover:bg-[#34D399] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0D12]"
              >
                Create Free Vault
              </Link>
              <Link
                href="/dashboard/help"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/[0.14] bg-[#11151B] px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
              >
                Open Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Direct Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050608] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-xs text-[#94A3B8] sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/Glossy Green Code Pocket Icon.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              aria-hidden="true"
            />
            <span className="font-semibold text-slate-200">CodePocket</span>
            <span className="mx-1" aria-hidden="true">/</span>
            <span>Personal code snippet vault</span>
          </div>

          <nav className="flex flex-wrap items-center gap-5" aria-label="Footer navigation">
            <a href="#preview" className="py-1 transition-colors hover:text-white">
              Preview
            </a>
            <a href="#vscode-sync" className="py-1 transition-colors hover:text-white">
              VS Code Sync
            </a>
            <Link href="/dashboard/help" className="py-1 transition-colors hover:text-white">
              Docs
            </Link>
            <Link href="/login" className="py-1 transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/signup" className="py-1 transition-colors hover:text-white">
              Sign Up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

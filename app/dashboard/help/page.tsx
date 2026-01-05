"use client";

import { useState, useRef, useEffect } from "react";
import { FiBook, FiCode, FiFolder, FiStar, FiArchive, FiSettings, FiDownload, FiKey, FiChevronDown } from "react-icons/fi";

type AccordionItemProps = {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function AccordionItem({ icon, title, color, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const contentEl = contentRef.current;
      if (contentEl) {
        setHeight(contentEl.scrollHeight);
      }
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-all duration-200 hover:bg-white/5 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} transition-transform duration-200 ${isOpen ? 'scale-110' : 'scale-100'}`}>
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
        <FiChevronDown
          className={`h-5 w-5 text-slate-400 transition-all duration-500 ease-out ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>
      <div
        ref={contentRef}
        style={{ height }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div className="border-t border-white/10 p-4 text-sm text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100">Help & Tutorial</h1>
        <p className="mt-2 text-slate-400">
          Learn how to use CodePocket and the VS Code extension
        </p>
      </div>

      {/* Quick Start Card */}
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-400">
          <FiBook className="h-5 w-5" />
          Quick Start
        </h3>
        <p className="text-sm text-slate-300">
          Welcome to CodePocket! Your personal code snippet manager. Click on any section below to learn more.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {/* Creating Snippets */}
        <AccordionItem
          icon={<FiCode className="h-5 w-5 text-blue-400" />}
          title="Creating Snippets"
          color="bg-blue-500/10"
          defaultOpen={true}
        >
          <ol className="space-y-2">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">1</span>
              <span>Click <strong className="text-slate-100">"New Snippet"</strong> on your dashboard</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">2</span>
              <span>Fill in title, language, and code (description & tags optional)</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">3</span>
              <span>Click <strong className="text-slate-100">"Save Snippet"</strong></span>
            </li>
          </ol>
        </AccordionItem>

        {/* Organizing with Folders */}
        <AccordionItem
          icon={<FiFolder className="h-5 w-5 text-purple-400" />}
          title="Organizing with Folders"
          color="bg-purple-500/10"
        >
          <div className="space-y-3">
            <div>
              <p className="mb-2 font-semibold text-slate-100">Creating a Folder:</p>
              <ol className="space-y-1 text-slate-400">
                <li>• Click the folder icon in the sidebar</li>
                <li>• Click "New Folder"</li>
                <li>• Enter a name and choose a color</li>
              </ol>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-100">Assigning Snippets:</p>
              <p className="text-slate-400">Select a folder from the dropdown when creating or editing a snippet.</p>
            </div>
          </div>
        </AccordionItem>

        {/* Favorites & Archive */}
        <AccordionItem
          icon={<FiStar className="h-5 w-5 text-yellow-400" />}
          title="Favorites & Archive"
          color="bg-yellow-500/10"
        >
          <div className="space-y-3">
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-slate-100">
                <FiStar className="h-4 w-4 text-yellow-400" />
                Favorites
              </p>
              <ul className="space-y-1 text-slate-400">
                <li>• Click the star icon on any snippet to favorite it</li>
                <li>• Access favorites from the sidebar</li>
              </ul>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 font-semibold text-slate-100">
                <FiArchive className="h-4 w-4 text-amber-400" />
                Archive
              </p>
              <ul className="space-y-1 text-slate-400">
                <li>• Click trash icon to archive (soft delete)</li>
                <li>• View archived snippets in Archive page</li>
                <li>• Restore or permanently delete from there</li>
              </ul>
            </div>
          </div>
        </AccordionItem>

        {/* Theme Customization */}
        <AccordionItem
          icon={<FiSettings className="h-5 w-5 text-pink-400" />}
          title="Theme Customization"
          color="bg-pink-500/10"
        >
          <ul className="space-y-1 text-slate-400">
            <li>• Click the theme selector in the top-right corner</li>
            <li>• Choose from VS Dark, VS Light, High Contrast, and more</li>
            <li>• Your preference is saved automatically</li>
          </ul>
        </AccordionItem>

        {/* VS Code Extension */}
        <AccordionItem
          icon={<FiDownload className="h-5 w-5 text-cyan-400" />}
          title="VS Code Extension"
          color="bg-cyan-500/10"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 font-semibold text-slate-100">Installation:</p>
              <ol className="space-y-1 text-slate-400">
                <li>1. Open VS Code Extensions (Ctrl+Shift+X)</li>
                <li>2. Search for "CodePocket Snippets"</li>
                <li>3. Click Install</li>
              </ol>
              <a
                href="https://marketplace.visualstudio.com/items?itemName=Reiniel.codepocket-snippets"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                <FiDownload className="h-3.5 w-3.5" />
                VS Code Marketplace
              </a>
            </div>

            <div>
              <p className="mb-2 font-semibold text-slate-100">Setup:</p>
              <div className="space-y-2 text-slate-400">
                <div>
                  <p className="font-medium text-slate-300">1. Generate API Key:</p>
                  <p className="ml-4 text-xs">Profile → API Keys → New Key → Copy it</p>
                </div>
                <div>
                  <p className="font-medium text-slate-300">2. Configure VS Code:</p>
                  <p className="ml-4 text-xs">Settings → Search "CodePocket"</p>
                  <p className="ml-4 text-xs">Set API Base URL: <code className="rounded bg-black px-1.5 py-0.5 text-emerald-400">https://reiniel.vercel.app</code></p>
                  <p className="ml-4 text-xs">Set API Key: Paste your key</p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 font-semibold text-slate-100">Usage:</p>
              <ol className="space-y-1 text-slate-400">
                <li>1. Open Command Palette (Ctrl+Shift+P)</li>
                <li>2. Type "CodePocket: Insert Snippet"</li>
                <li>3. Select a snippet</li>
                <li>4. Code inserted at cursor!</li>
              </ol>
            </div>
          </div>
        </AccordionItem>

        {/* API Keys */}
        <AccordionItem
          icon={<FiKey className="h-5 w-5 text-orange-400" />}
          title="Managing API Keys"
          color="bg-orange-500/10"
        >
          <div className="space-y-3">
            <div>
              <p className="mb-2 font-semibold text-slate-100">Creating an API Key:</p>
              <ol className="space-y-1 text-slate-400">
                <li>• Go to Profile Settings</li>
                <li>• Navigate to API Keys section</li>
                <li>• Click "New Key" and give it a name</li>
                <li>• Copy and save securely</li>
              </ol>
            </div>
            <div>
              <p className="mb-2 font-semibold text-slate-100">Security Tips:</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Keep API keys private</li>
                <li>• Create separate keys for different integrations</li>
                <li>• Delete unused keys</li>
              </ul>
            </div>
          </div>
        </AccordionItem>

        {/* Tips & Tricks */}
        <AccordionItem
          icon={<FiBook className="h-5 w-5 text-green-400" />}
          title="Tips & Tricks"
          color="bg-green-500/10"
        >
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <span className="text-emerald-400">💡</span>
              <span>Use descriptive titles and tags for easy searching</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">💡</span>
              <span>Create folders for different projects or languages</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">💡</span>
              <span>Add descriptions to explain when to use snippets</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">💡</span>
              <span>Favorite your most-used snippets</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">💡</span>
              <span>Archive instead of deleting permanently</span>
            </li>
          </ul>
        </AccordionItem>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-white/10 bg-emerald-500/5 p-4 text-center">
        <p className="text-sm text-slate-300">
          Need help?{" "}
          <a
            href="mailto:support@codepocket.com"
            className="font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

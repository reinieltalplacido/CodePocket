"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AVAILABLE_THEMES, ThemeName } from "@/lib/themes";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = AVAILABLE_THEMES.find((t) => t.id === theme);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select code syntax theme"
        className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0D1015] px-3 text-sm text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
      >
        <div
          className="h-3.5 w-3.5 rounded border border-white/20"
          style={{ backgroundColor: currentTheme?.preview.background }}
        />
        <span className="hidden text-xs font-medium sm:inline">
          {currentTheme?.name}
        </span>
        <FiChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            aria-label="Syntax Highlighting Themes"
            className="cp-dropdown-in absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/[0.1] bg-[#0D1015] p-2 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.95)]"
          >
            <div className="mb-1.5 border-b border-white/[0.06] px-2.5 pb-2 pt-1">
              <h3 className="text-xs font-semibold text-slate-200">
                Syntax Theme
              </h3>
              <p className="text-[11px] text-slate-400">
                Applies to snippet code blocks &amp; editor
              </p>
            </div>

            <div className="custom-scrollbar max-h-80 space-y-1 overflow-y-auto">
              {AVAILABLE_THEMES.map((themeOption) => {
                const selected = theme === themeOption.id;
                return (
                  <button
                    key={themeOption.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                      selected
                        ? "bg-emerald-500/12 text-emerald-300"
                        : "text-slate-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 shrink-0 rounded border border-white/20"
                            style={{
                              backgroundColor: themeOption.preview.background,
                            }}
                          />
                          <span className="truncate text-sm font-medium">
                            {themeOption.name}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {themeOption.description}
                        </p>
                      </div>
                      {selected && (
                        <FiCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                    </div>

                    <div className="mt-2 flex gap-1">
                      <div
                        className="h-1.5 w-full rounded-sm"
                        style={{ backgroundColor: themeOption.preview.keyword }}
                      />
                      <div
                        className="h-1.5 w-full rounded-sm"
                        style={{ backgroundColor: themeOption.preview.string }}
                      />
                      <div
                        className="h-1.5 w-full rounded-sm"
                        style={{ backgroundColor: themeOption.preview.comment }}
                      />
                      <div
                        className="h-1.5 w-full rounded-sm"
                        style={{ backgroundColor: themeOption.preview.text }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

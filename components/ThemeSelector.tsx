// components/ThemeSelector.tsx
"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { AVAILABLE_THEMES, ThemeName } from "@/lib/themes";
import { FiCheck, FiChevronDown } from "react-icons/fi";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = AVAILABLE_THEMES.find((t) => t.id === theme);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10"
      >
        <div
          className="h-4 w-4 rounded border border-white/20"
          style={{ backgroundColor: currentTheme?.preview.background }}
        />
        <span className="hidden sm:inline">{currentTheme?.name}</span>
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-white/10 bg-zinc-950 p-2 shadow-xl">
            <div className="mb-2 px-2 py-1">
              <h3 className="text-xs font-semibold text-slate-400">
                Syntax Theme
              </h3>
            </div>

            <div className="space-y-1">
              {AVAILABLE_THEMES.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                    theme === themeOption.id
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border border-white/20"
                          style={{
                            backgroundColor: themeOption.preview.background,
                          }}
                        />
                        <span className="text-sm font-medium">
                          {themeOption.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {themeOption.description}
                      </p>
                    </div>
                    {theme === themeOption.id && (
                      <FiCheck className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="mt-2 flex gap-1">
                    <div
                      className="h-2 w-full rounded-sm"
                      style={{ backgroundColor: themeOption.preview.keyword }}
                    />
                    <div
                      className="h-2 w-full rounded-sm"
                      style={{ backgroundColor: themeOption.preview.string }}
                    />
                    <div
                      className="h-2 w-full rounded-sm"
                      style={{ backgroundColor: themeOption.preview.comment }}
                    />
                    <div
                      className="h-2 w-full rounded-sm"
                      style={{ backgroundColor: themeOption.preview.text }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

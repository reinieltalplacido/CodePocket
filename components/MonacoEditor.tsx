"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { AVAILABLE_THEMES, ThemeName } from "@/lib/themes";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";

type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
};

const MONACO_THEME_MAP: Record<ThemeName, string> = {
  "vscode-dark": "vs-dark",
  dracula: "dracula-theme",
  "github-dark": "github-dark-theme",
  monokai: "monokai-theme",
  nord: "nord-theme",
  "one-dark": "one-dark-theme",
  "solarized-dark": "solarized-dark-theme",
};

const stripHash = (hex: string) => hex.replace(/^#/, "");

export default function MonacoEditor({
  value,
  onChange,
  language,
  height = "500px",
  readOnly = false,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const monaco = useMonaco();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMonacoTheme = () => MONACO_THEME_MAP[theme] || "vs-dark";

  useEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(MONACO_THEME_MAP[theme] || "vs-dark");
  }, [monaco, theme]);

  // Map language names to Monaco language IDs
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      javascriptreact: "javascript",
      typescriptreact: "typescript",
      python: "python",
      java: "java",
      csharp: "csharp",
      cpp: "cpp",
      c: "c",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      swift: "swift",
      kotlin: "kotlin",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      markdown: "markdown",
      sql: "sql",
      bash: "shell",
      shell: "shell",
      powershell: "powershell",
      plaintext: "plaintext",
    };

    return languageMap[lang.toLowerCase()] || "plaintext";
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-white/10 bg-black"
        style={{ height }}
      >
        <p className="text-sm text-slate-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        onChange={handleEditorChange}
        theme={getMonacoTheme()}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          folding: true,
          glyphMargin: false,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          // Disable error checking to avoid red squiggly lines
          "semanticHighlighting.enabled": false,
        }}
        beforeMount={(monacoInstance) => {
          // Disable all diagnostics (error checking)
          monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });
          monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });

          // Define custom themes with matching background, foreground, and syntax token rules
          for (const themeConfig of AVAILABLE_THEMES) {
            if (themeConfig.id === "vscode-dark") continue;
            const monacoThemeId = MONACO_THEME_MAP[themeConfig.id];
            monacoInstance.editor.defineTheme(monacoThemeId, {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "", foreground: stripHash(themeConfig.preview.text) },
                { token: "comment", foreground: stripHash(themeConfig.preview.comment), fontStyle: "italic" },
                { token: "keyword", foreground: stripHash(themeConfig.preview.keyword) },
                { token: "string", foreground: stripHash(themeConfig.preview.string) },
                { token: "number", foreground: stripHash(themeConfig.preview.keyword) },
                { token: "type", foreground: stripHash(themeConfig.preview.string) },
                { token: "delimiter", foreground: stripHash(themeConfig.preview.text) },
              ],
              colors: {
                "editor.background": themeConfig.preview.background,
                "editor.foreground": themeConfig.preview.text,
                "editorLineNumber.foreground": themeConfig.preview.comment,
                "editorCursor.foreground": themeConfig.preview.keyword,
              },
            });
          }
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-black">
            <p className="text-sm text-slate-400">Loading Monaco Editor...</p>
          </div>
        }
      />
    </div>
  );
}

"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
};

export default function MonacoEditor({
  value,
  onChange,
  language,
  height = "500px",
  readOnly = false,
}: MonacoEditorProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map app themes to Monaco themes
  const getMonacoTheme = () => {
    switch (theme) {
      case "vscode-dark":
        return "vs-dark";
      case "dracula":
        return "dracula-theme";
      case "github-dark":
        return "github-dark-theme";
      case "monokai":
        return "monokai-theme";
      case "nord":
        return "nord-theme";
      case "one-dark":
        return "one-dark-theme";
      case "solarized-dark":
        return "solarized-dark-theme";
      default:
        return "vs-dark";
    }
  };

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
        key={theme} // Force re-render when theme changes
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
        beforeMount={(monaco) => {
          // Disable all diagnostics (error checking)
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });
          monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
          });

          // Define custom themes
          monaco.editor.defineTheme("dracula-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#282a36",
              "editor.foreground": "#f8f8f2",
            },
          });

          monaco.editor.defineTheme("nord-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#2e3440",
              "editor.foreground": "#d8dee9",
            },
          });

          monaco.editor.defineTheme("solarized-dark-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#002b36",
              "editor.foreground": "#839496",
            },
          });

          monaco.editor.defineTheme("monokai-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#272822",
              "editor.foreground": "#f8f8f2",
            },
          });

          monaco.editor.defineTheme("one-dark-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#282c34",
              "editor.foreground": "#abb2bf",
            },
          });

          monaco.editor.defineTheme("github-dark-theme", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#0d1117",
              "editor.foreground": "#c9d1d9",
            },
          });
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

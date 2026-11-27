// components/CodeBlock.tsx
"use client";

import { memo, type CSSProperties } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  dracula,
  oneDark,
  nord,
  solarizedDarkAtom,
  okaidia,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/contexts/ThemeContext";
import { AVAILABLE_THEMES, ThemeName } from "@/lib/themes";

type PrismTheme = Record<string, CSSProperties>;

const githubDark: PrismTheme = {
  ...(vscDarkPlus as PrismTheme),
  'pre[class*="language-"]': {
    ...(vscDarkPlus as PrismTheme)['pre[class*="language-"]'],
    background: "#0d1117",
    color: "#c9d1d9",
  },
  'code[class*="language-"]': {
    ...(vscDarkPlus as PrismTheme)['code[class*="language-"]'],
    background: "#0d1117",
    color: "#c9d1d9",
  },
  comment: { color: "#8b949e", fontStyle: "italic" },
  prolog: { color: "#8b949e" },
  keyword: { color: "#ff7b72" },
  operator: { color: "#ff7b72" },
  string: { color: "#a5d6ff" },
  char: { color: "#a5d6ff" },
  function: { color: "#d2a8ff" },
  "class-name": { color: "#ffa657" },
  number: { color: "#79c0ff" },
  boolean: { color: "#79c0ff" },
  constant: { color: "#79c0ff" },
  builtin: { color: "#ffa657" },
  property: { color: "#79c0ff" },
  punctuation: { color: "#c9d1d9" },
};

type CodeBlockProps = {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
};

const getThemeStyle = (themeName: ThemeName): PrismTheme => {
  switch (themeName) {
    case "vscode-dark":
      return vscDarkPlus as PrismTheme;
    case "dracula":
      return dracula as PrismTheme;
    case "github-dark":
      return githubDark;
    case "monokai":
      return okaidia as PrismTheme;
    case "nord":
      return nord as PrismTheme;
    case "one-dark":
      return oneDark as PrismTheme;
    case "solarized-dark":
      return solarizedDarkAtom as PrismTheme;
    default:
      return vscDarkPlus as PrismTheme;
  }
};

const normalizeLanguage = (lang: string): string => {
  const langMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    javascriptreact: "jsx",
    typescriptreact: "tsx",
    python: "python",
    java: "java",
    "c++": "cpp",
    cpp: "cpp",
    "c#": "csharp",
    csharp: "csharp",
    ruby: "ruby",
    go: "go",
    rust: "rust",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    bash: "bash",
    shell: "bash",
    sh: "bash",
    powershell: "powershell",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    dotenv: "ini",
    env: "ini",
    ini: "ini",
    toml: "toml",
    markdown: "markdown",
    dockerfile: "docker",
    plaintext: "text",
  };

  return langMap[lang.toLowerCase()] || "text";
};

function CodeBlockInner({
  code,
  language,
  showLineNumbers = true,
  maxHeight = "500px",
  className = "",
}: CodeBlockProps) {
  const { theme } = useTheme();
  const themeStyle = getThemeStyle(theme);
  const themeBg =
    AVAILABLE_THEMES.find((t) => t.id === theme)?.preview.background ?? "#1e1e1e";
  const normalizedLang = normalizeLanguage(language);

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-lg border border-white/[0.08] ${className}`}
      style={{ backgroundColor: themeBg }}
    >
      <SyntaxHighlighter
        language={normalizedLang}
        style={themeStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={false}
        customStyle={{
          margin: 0,
          padding: "0.75rem 0.9rem",
          maxHeight,
          overflowY: "auto",
          overflowX: "auto",
          background: themeBg,
          fontSize: "0.75rem",
          lineHeight: "1.45",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
        codeTagProps={{
          style: {
            background: "transparent",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          },
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "0.9em",
          color: "#94a3b8",
          userSelect: "none",
        }}
        className="custom-scrollbar"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const CodeBlock = memo(CodeBlockInner);
export default CodeBlock;

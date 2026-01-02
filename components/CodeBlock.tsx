// components/CodeBlock.tsx
"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  dracula,
  oneDark,
  nord,
  solarizedDarkAtom,
  materialDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeName } from "@/lib/themes";

type CodeBlockProps = {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
};

// Map theme names to actual style objects
const getThemeStyle = (themeName: ThemeName) => {
  switch (themeName) {
    case "vscode-dark":
      return vscDarkPlus;
    case "dracula":
      return dracula;
    case "github-dark":
      return materialDark; // Using material dark as close alternative
    case "monokai":
      return materialDark; // Using material dark as alternative
    case "nord":
      return nord;
    case "one-dark":
      return oneDark;
    case "solarized-dark":
      return solarizedDarkAtom;
    default:
      return vscDarkPlus;
  }
};

// Map language names to syntax highlighter language codes
const normalizeLanguage = (lang: string): string => {
  const langMap: Record<string, string> = {
    javascript: "javascript",
    typescript: "typescript",
    javascriptreact: "jsx",
    typescriptreact: "tsx",
    python: "python",
    java: "java",
    "c++": "cpp",
    "c#": "csharp",
    ruby: "ruby",
    go: "go",
    rust: "rust",
    php: "php",
    swift: "swift",
    kotlin: "kotlin",
    html: "html",
    css: "css",
    sql: "sql",
    bash: "bash",
    json: "json",
    plaintext: "text",
  };

  return langMap[lang.toLowerCase()] || "text";
};

export default function CodeBlock({
  code,
  language,
  showLineNumbers = true,
  maxHeight = "500px",
  className = "",
}: CodeBlockProps) {
  const { theme } = useTheme();
  const themeStyle = getThemeStyle(theme);
  const normalizedLang = normalizeLanguage(language);

  return (
    <div className={`rounded-lg overflow-hidden border border-white/10 ${className}`}>
      <SyntaxHighlighter
        language={normalizedLang}
        style={themeStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        customStyle={{
          margin: 0,
          maxHeight: maxHeight,
          fontSize: "0.75rem",
          lineHeight: "1.5rem",
        }}
        lineNumberStyle={{
          minWidth: "3em",
          paddingRight: "1em",
          color: "#6b7280",
          userSelect: "none",
        }}
        className="custom-scrollbar"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

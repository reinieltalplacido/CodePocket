export const SNIPPET_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
  "JSON",
  "YAML",
  "Dotenv",
  "Markdown",
  "Other",
] as const;

export function prettyLanguage(id: string | undefined | null): string {
  if (!id) return "Plain text";

  switch (id.toLowerCase()) {
    case "javascript":
      return "JavaScript";
    case "typescript":
      return "TypeScript";
    case "javascriptreact":
      return "JSX";
    case "typescriptreact":
      return "TSX";
    case "json":
      return "JSON";
    case "yaml":
    case "yml":
      return "YAML";
    case "dotenv":
    case "env":
      return "Dotenv";
    case "html":
      return "HTML";
    case "css":
      return "CSS";
    case "sql":
      return "SQL";
    case "c++":
    case "cpp":
      return "C++";
    case "c#":
    case "csharp":
      return "C#";
    case "php":
      return "PHP";
    case "plaintext":
      return "Plain text";
    default:
      return id.charAt(0).toUpperCase() + id.slice(1);
  }
}

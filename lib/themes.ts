// lib/themes.ts
export type ThemeName =
  | "vscode-dark"
  | "dracula"
  | "github-dark"
  | "monokai"
  | "nord"
  | "one-dark"
  | "solarized-dark";

export type ThemeConfig = {
  id: ThemeName;
  name: string;
  description: string;
  preview: {
    background: string;
    text: string;
    keyword: string;
    string: string;
    comment: string;
  };
};

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: "vscode-dark",
    name: "VS Code Dark+",
    description: "The default dark theme from Visual Studio Code",
    preview: {
      background: "#1e1e1e",
      text: "#d4d4d4",
      keyword: "#569cd6",
      string: "#ce9178",
      comment: "#6a9955",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "A dark theme with vibrant colors",
    preview: {
      background: "#282a36",
      text: "#f8f8f2",
      keyword: "#ff79c6",
      string: "#f1fa8c",
      comment: "#6272a4",
    },
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    description: "GitHub's dark color scheme",
    preview: {
      background: "#0d1117",
      text: "#c9d1d9",
      keyword: "#ff7b72",
      string: "#a5d6ff",
      comment: "#8b949e",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    description: "Classic Monokai color scheme",
    preview: {
      background: "#272822",
      text: "#f8f8f2",
      keyword: "#f92672",
      string: "#e6db74",
      comment: "#75715e",
    },
  },
  {
    id: "nord",
    name: "Nord",
    description: "An arctic, north-bluish color palette",
    preview: {
      background: "#2e3440",
      text: "#d8dee9",
      keyword: "#81a1c1",
      string: "#a3be8c",
      comment: "#616e88",
    },
  },
  {
    id: "one-dark",
    name: "One Dark",
    description: "Atom's iconic One Dark theme",
    preview: {
      background: "#282c34",
      text: "#abb2bf",
      keyword: "#c678dd",
      string: "#98c379",
      comment: "#5c6370",
    },
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    description: "Precision colors for machines and people",
    preview: {
      background: "#002b36",
      text: "#839496",
      keyword: "#268bd2",
      string: "#2aa198",
      comment: "#586e75",
    },
  },
];

export const DEFAULT_THEME: ThemeName = "vscode-dark";

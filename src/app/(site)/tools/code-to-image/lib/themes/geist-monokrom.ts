import type { ThemeRegistration } from "shiki";

const geistMonokrom: ThemeRegistration = {
  name: "geist-monokrom",
  displayName: "Geist Monokrom",
  type: "dark",
  colors: {
    "editor.background": "#0a0a0a",
    "editor.foreground": "#ededed",
    "editor.lineHighlightBackground": "#141414",
    "editor.selectionBackground": "#2a2a2a",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#6b6b6b" } },
    { scope: ["string", "constant.other.symbol"], settings: { foreground: "#c4c4c4" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#a8a8a8" } },
    { scope: ["keyword", "storage.type", "storage.modifier"], settings: { foreground: "#ededed", fontStyle: "bold" } },
    { scope: ["entity.name.function", "support.function"], settings: { foreground: "#d4d4d4" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type"], settings: { foreground: "#b8b8b8" } },
    { scope: ["variable", "variable.parameter"], settings: { foreground: "#e0e0e0" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#d0d0d0" } },
    { scope: ["entity.other.attribute-name"], settings: { foreground: "#9a9a9a" } },
    { scope: ["punctuation", "meta.brace"], settings: { foreground: "#888888" } },
    { scope: ["markup.heading"], settings: { foreground: "#ededed", fontStyle: "bold" } },
    { scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
  ],
};

export default geistMonokrom;
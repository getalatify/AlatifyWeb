import { getSingletonHighlighter, type Highlighter } from "shiki";
import javascript from "@shikijs/langs/javascript";
import typescript from "@shikijs/langs/typescript";
import tsx from "@shikijs/langs/tsx";
import python from "@shikijs/langs/python";
import html from "@shikijs/langs/html";
import css from "@shikijs/langs/css";
import json from "@shikijs/langs/json";
import bash from "@shikijs/langs/bash";
import go from "@shikijs/langs/go";
import rust from "@shikijs/langs/rust";
import sql from "@shikijs/langs/sql";
import markdown from "@shikijs/langs/markdown";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import geistMonokrom from "./themes/geist-monokrom";

export type ThemeId = "geist-monokrom" | "github-dark" | "github-light";

export const THEME_OPTIONS: { id: ThemeId; label: string }[] = [
  { id: "geist-monokrom", label: "Geist Monokrom" },
  { id: "github-dark", label: "Dark" },
  { id: "github-light", label: "Light Minimal" },
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      langs: [javascript, typescript, tsx, python, html, css, json, bash, go, rust, sql, markdown],
      themes: [geistMonokrom, githubDark, githubLight],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string, theme: ThemeId): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang, theme });
}
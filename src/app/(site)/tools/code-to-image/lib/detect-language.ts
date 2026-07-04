export type SupportedLang =
  | "text"
  | "javascript"
  | "typescript"
  | "tsx"
  | "python"
  | "html"
  | "css"
  | "json"
  | "bash"
  | "go"
  | "rust"
  | "sql"
  | "markdown";

export function detectLanguage(code: string): SupportedLang {
  const trimmed = code.trim();
  if (!trimmed) return "javascript";

  if (/^#!\/bin\/(ba)?sh/.test(trimmed) || /^#!\/usr\/bin\/env\s+bash/.test(trimmed)) {
    return "bash";
  }

  if (/<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || /<div[\s>]/i.test(trimmed)) {
    return "html";
  }

  try {
    JSON.parse(trimmed);
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      return "json";
    }
  } catch {
    // not JSON
  }

  if (/import\s+React/.test(trimmed) || /export\s+default\s+function/.test(trimmed) || /<[A-Z][A-Za-z0-9]*/.test(trimmed)) {
    return "tsx";
  }

  if (/\binterface\s+\w+/.test(trimmed) || /:\s*string\b/.test(trimmed) || /\bas\s+const\b/.test(trimmed)) {
    return "typescript";
  }

  if (/\bfn\s+main\b/.test(trimmed) || /\blet\s+mut\b/.test(trimmed) || /\bimpl\s+/.test(trimmed)) {
    return "rust";
  }

  if (/\bpackage\s+main\b/.test(trimmed) || /\bfunc\s+main\s*\(/.test(trimmed)) {
    return "go";
  }

  if (/\b(SELECT|INSERT|CREATE\s+TABLE|UPDATE|DELETE\s+FROM)\b/i.test(trimmed)) {
    return "sql";
  }

  if (/^#{1,6}\s+\S/m.test(trimmed) || /^```/m.test(trimmed)) {
    return "markdown";
  }

  if (/\bdef\s+\w+\s*\(/.test(trimmed) || (/^import\s+\w+/m.test(trimmed) && /\bprint\s*\(/.test(trimmed))) {
    return "python";
  }

  if (/[.#][\w-]+\s*\{/.test(trimmed) && /:\s*[^;]+;/.test(trimmed)) {
    return "css";
  }

  return "javascript";
}
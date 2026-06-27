import { TOOLS, ToolEntry } from "./registry";

// Deduplicate keywords at load time.
export const SEARCHABLE_TOOLS = TOOLS.map(tool => ({
  ...tool,
  keywords: Array.from(new Set(tool.keywords.map(kw => kw.toLowerCase().trim()))),
}));

export interface SearchResult {
  tool: ToolEntry;
  score: number;
}

export function searchTools(query: string): SearchResult[] {
  if (!query) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!normalizedQuery) {
    return [];
  }

  const queryTokens = normalizedQuery.split(' ');

  const results: SearchResult[] = [];

  for (const tool of SEARCHABLE_TOOLS) {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const descLower = tool.description.toLowerCase();
    const searchableText = `${nameLower} ${descLower} ${tool.keywords.join(' ')}`;

    // Check for exact match in name or keywords
    if (nameLower === normalizedQuery || tool.keywords.includes(normalizedQuery)) {
      score += 100;
    }

    // Check for prefix match in name
    if (nameLower.startsWith(normalizedQuery)) {
      score += 50;
    }

    // Keyword prefix matches
    if (tool.keywords.some(kw => kw.startsWith(normalizedQuery))) {
      score += 40;
    }

    // Substring match in name
    if (nameLower.includes(normalizedQuery)) {
      score += 30;
    }

    // Substring match in description
    if (descLower.includes(normalizedQuery)) {
      score += 15;
    }

    // Substring match in keywords
    if (tool.keywords.some(kw => kw.includes(normalizedQuery))) {
      score += 20;
    }

    // Token based matching (AND style)
    let allTokensMatch = true;
    let someTokensMatch = false;

    for (const token of queryTokens) {
      if (searchableText.includes(token)) {
        someTokensMatch = true;
        score += 5; // incremental score for each matching token
      } else {
        allTokensMatch = false;
      }
    }

    // If multi-word query and all tokens match, give a boost
    if (queryTokens.length > 1) {
      if (allTokensMatch) {
        score += 60;
      } else if (!someTokensMatch) {
        continue;
      }
    } else {
       if (!someTokensMatch) {
           continue;
       }
    }

    if (score > 0) {
      results.push({ tool, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

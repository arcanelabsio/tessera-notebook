import { publishedEpisodes } from "../content/loader";
import type { Episode } from "../content/types";

export type SearchResult = {
  episode: Episode;
  score: number;
  snippet: string;
};

// Lightweight, dependency-free substring search. At catalog scale
// (≤200 episodes lifetime) a linear scan beats pulling in MiniSearch
// or Fuse — they'd be ~10-20KB of vendor JS for relevance no human
// will notice on a corpus this small. Promote to a real index later
// only if relevance complaints arrive.
//
// Weight: title 10× > concept 5× > description 3× > body 1×.
// Multi-token queries score by sum of per-token max-field scores —
// rewards episodes that match all tokens somewhere over episodes
// that match one token in many places.
const W_TITLE = 10;
const W_CONCEPT = 5;
const W_DESC = 3;
const W_BODY = 1;

function countMatches(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let count = 0;
  let idx = 0;
  while ((idx = h.indexOf(n, idx)) !== -1) {
    count++;
    idx += n.length;
  }
  return count;
}

function bodyText(ep: Episode): string {
  // Strip markdown chrome so query tokens match against words, not
  // fence/heading/list syntax.
  return ep.body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`|\-]/g, " ")
    .replace(/\s+/g, " ");
}

function buildSnippet(ep: Episode, token: string): string {
  const text = bodyText(ep);
  const idx = text.toLowerCase().indexOf(token.toLowerCase());
  if (idx < 0) return ep.description || ep.concept || "";
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + token.length + 80);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end).trim() + suffix;
}

export function search(query: string): SearchResult[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];
  for (const ep of publishedEpisodes) {
    let score = 0;
    for (const tok of tokens) {
      const t = countMatches(ep.title, tok) * W_TITLE;
      const c = countMatches(ep.concept, tok) * W_CONCEPT;
      const d = countMatches(ep.description, tok) * W_DESC;
      const b = countMatches(ep.body, tok) * W_BODY;
      score += Math.max(t, c, d, b);
    }
    if (score > 0) {
      results.push({
        episode: ep,
        score,
        snippet: buildSnippet(ep, tokens[0]),
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 12);
}

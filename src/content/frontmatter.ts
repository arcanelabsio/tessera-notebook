import { parse as parseYaml } from "yaml";

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Split a `---\n…\n---\n…` markdown source into its frontmatter
// (parsed as YAML) and body. Returns `{ data: {}, body }` if no
// frontmatter is present.
export function splitFrontmatter(source: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = FENCE.exec(source);
  if (!match) return { data: {}, body: source };
  const [, yaml, body] = match;
  const data = parseYaml(yaml) as Record<string, unknown> | null;
  return { data: data ?? {}, body: body ?? "" };
}

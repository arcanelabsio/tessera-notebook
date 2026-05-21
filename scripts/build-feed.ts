import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

// Build-time RSS 2.0 generator for The Tessera Notebook.
//
// Reads /content/episodes/<season>/<slug>.md, parses frontmatter, and
// returns an RSS XML string. Only episodes with both `voice_pass` and
// `date` set are emitted — same publication gate as src/content/loader.ts.
// Sorted by date desc (newest first), which is what feed readers expect.
//
// Loader-parity note: this file intentionally re-implements the
// frontmatter split and publication gate rather than importing from
// src/content/loader.ts. The loader uses `import.meta.glob` (Vite-only)
// and resolves /content/* via the dev server's root, so it cannot run
// in a Node build script. Keep the gating rules here aligned with the
// loader when either side changes.

const SITE_URL = "https://tessera.arcanelabs.info";
const SITE_TITLE = "The Tessera Notebook";
const SITE_DESCRIPTION =
  "A daily platform-engineering story. One episode a day, roughly seven minutes.";
const FEED_PATH = "/feed.xml";

type Frontmatter = Record<string, unknown>;
type EpisodeEntry = {
  title: string;
  description: string;
  season: string;
  slug: string;
  date: string; // ISO YYYY-MM-DD
  pubDate: Date;
  sceneType: string;
  url: string;
  guid: string;
};

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function splitFrontmatter(source: string): { data: Frontmatter; body: string } {
  const match = FENCE.exec(source);
  if (!match) return { data: {}, body: source };
  const [, yaml, body] = match;
  const data = parseYaml(yaml) as Frontmatter | null;
  return { data: data ?? {}, body: body ?? "" };
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asIsoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v;
  return "";
}

// XML 1.0 only requires escaping &, <, >, ", '. We treat all interpolated
// text as untrusted (it's author-controlled markdown frontmatter, but a
// stray ampersand in a description breaks the feed).
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RFC-822 date for pubDate. Feed readers reject ISO-8601 here.
function rfc822(d: Date): string {
  return d.toUTCString();
}

function readEpisodes(contentRoot: string): EpisodeEntry[] {
  const episodesRoot = join(contentRoot, "episodes");
  const seasons = readdirSync(episodesRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const entries: EpisodeEntry[] = [];

  for (const seasonDir of seasons) {
    const seasonPath = join(episodesRoot, seasonDir);
    const files = readdirSync(seasonPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      const raw = readFileSync(join(seasonPath, file), "utf-8");
      const { data } = splitFrontmatter(raw);

      const date = asIsoDate(data.date);
      const voicePass = asIsoDate(data.voice_pass);
      // Match loader.ts publication gate.
      if (!date || !voicePass) continue;

      const title = asString(data.title, slug);
      const description = asString(data.description);
      const sceneType = asString(data.scene_type, "feature");
      const season = asString(data.season, seasonDir);
      const url = `${SITE_URL}/${season}/${slug}`;

      // Anchor pubDate at noon UTC so timezone-naive readers don't show
      // the episode as "yesterday" west of GMT. The site itself only
      // shows YYYY-MM-DD, so this is purely for feed-reader display.
      const pubDate = new Date(`${date}T12:00:00Z`);

      entries.push({
        title,
        description,
        season,
        slug,
        date,
        pubDate,
        sceneType,
        url,
        guid: url,
      });
    }
  }

  // Newest first.
  entries.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return entries;
}

export function buildFeed(contentRoot: string, nowIso?: string): string {
  const entries = readEpisodes(contentRoot);
  // `lastBuildDate` is the time we built the feed; feed readers use it
  // to decide whether to refetch. In dev this is "now"; in CI this is
  // build time, which doubles as a cache-buster.
  const lastBuild = nowIso ? new Date(nowIso) : new Date();
  // `pubDate` on the channel itself is the latest episode's pubDate —
  // some validators warn if it's missing on a non-empty feed.
  const channelPub = entries[0]?.pubDate ?? lastBuild;

  const items = entries
    .map((e) => {
      const category = escapeXml(e.sceneType);
      return [
        "    <item>",
        `      <title>${escapeXml(e.title)}</title>`,
        `      <link>${escapeXml(e.url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(e.guid)}</guid>`,
        `      <pubDate>${rfc822(e.pubDate)}</pubDate>`,
        `      <category>${category}</category>`,
        `      <description>${escapeXml(e.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(SITE_TITLE)}</title>`,
    `    <link>${escapeXml(SITE_URL)}/</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>en-us</language>",
    `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`,
    `    <pubDate>${rfc822(channelPub)}</pubDate>`,
    `    <atom:link href="${SITE_URL}${FEED_PATH}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

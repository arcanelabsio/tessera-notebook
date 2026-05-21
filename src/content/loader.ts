import { splitFrontmatter } from "./frontmatter";
import type {
  Episode,
  Intro,
  SceneType,
  SeasonSummary,
} from "./types";

// Vite glob imports bundle markdown content at build time. Each glob
// returns `{ '/content/…/file.md': '…raw source…' }`. Eager so the
// index is synchronous; total content size is well under the threshold
// where per-route splitting would matter.
const EPISODE_RAW = import.meta.glob("/content/episodes/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const INTRO_RAW = import.meta.glob("/content/_intro.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// --- helpers --------------------------------------------------------

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asIsoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v;
  return "";
}

function asNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

// Adult prose reads at ~225 wpm; the notebook is denser ("density is
// the brand") so we estimate at 220 wpm and always round up — readers
// finishing in less than the readout feel rewarded, finishing over
// feels misleading.
const WORDS_PER_MINUTE = 220;

function estimateReadMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-|]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const SCENE_TYPES: ReadonlySet<SceneType> = new Set([
  "feature",
  "incident",
  "support",
  "decision",
]);

function asSceneType(v: unknown): SceneType {
  if (typeof v === "string" && SCENE_TYPES.has(v as SceneType)) {
    return v as SceneType;
  }
  return "feature";
}

// --- parsers --------------------------------------------------------

const EPISODE_FILE =
  /^\/content\/episodes\/([a-z0-9-]+)\/([a-z0-9-]+)\.md$/;

function parseEpisode(path: string, raw: string): Episode {
  const match = EPISODE_FILE.exec(path);
  if (!match) {
    throw new Error(
      `episode filename must match /content/episodes/<season>/<slug>.md — got ${path}`,
    );
  }
  const [, seasonFromPath, slugFromPath] = match;
  const { data, body } = splitFrontmatter(raw);
  const voicePassRaw = data.voice_pass;
  return {
    series: asString(data.series, "tessera-notebook"),
    season: asString(data.season, seasonFromPath),
    slug: asString(data.slug, slugFromPath),
    episode: asNumber(data.day ?? data.episode),
    title: asString(data.title, slugFromPath),
    description: asString(data.description),
    date: asIsoDate(data.date),
    sceneType: asSceneType(data.scene_type),
    arc: asString(data.arc),
    concept: asString(data.concept),
    voicePass:
      typeof voicePassRaw === "string" && voicePassRaw !== ""
        ? asIsoDate(voicePassRaw)
        : voicePassRaw instanceof Date
          ? voicePassRaw.toISOString().slice(0, 10)
          : null,
    body,
    url: `/${seasonFromPath}/${slugFromPath}`,
    readMinutes: estimateReadMinutes(body),
  };
}

function parseIntro(raw: string): Intro {
  const { data, body } = splitFrontmatter(raw);
  return {
    title: asString(data.title, "The Tessera Notebook"),
    description: asString(data.description),
    greeting: asString(
      data.greeting,
      "The Tessera Notebook — a daily platform-engineering story.",
    ),
    body,
  };
}

// --- indexes --------------------------------------------------------

// Season metadata. Update if the curriculum (notebook/curriculum.md in
// dispatch) grows past 4 seasons.
const SEASON_META: Record<
  string,
  { label: string; title: string; tier: string; description: string }
> = {
  "season-1": {
    label: "Season 1",
    title: "Distributed Systems Foundations",
    tier: "POC → 10K customers",
    description:
      "Take a reader who builds correct single-machine code and give them the mental scaffold for thinking in distributed primitives — where every interaction is over a network and every component can fail.",
  },
  "season-2": {
    label: "Season 2",
    title: "Platform Engineering as a Discipline",
    tier: "10K → 1M",
    description:
      "Platform engineering is product management for developers. Kubernetes is a generic control-loop engine. Multi-tenancy is an architectural choice.",
  },
  "season-3": {
    label: "Season 3",
    title: "System Design at Staff Bar",
    tier: "1M → 10M",
    description:
      "Frame ambiguous problems under time pressure, defend a data-store choice in a design review, write ADRs that get cited three years later.",
  },
  "season-4": {
    label: "Season 4",
    title: "Identity, Compliance, and the Agentic Era",
    tier: "10M → 1B",
    description:
      "Enterprise-grade identity (OAuth/OIDC/SAML/mTLS/SPIFFE/zero trust) and the agentic literacy for LLM-backed services under cost/latency budgets.",
  },
};

export const episodes: Episode[] = Object.entries(EPISODE_RAW)
  .map(([p, raw]) => parseEpisode(p, raw))
  .sort((a, b) => a.episode - b.episode);

export const publishedEpisodes: Episode[] = episodes.filter(
  (e) => e.voicePass !== null && e.date !== "",
);

// Latest published episode by date desc, episode desc as tiebreaker.
export const latestEpisode: Episode | undefined = (() => {
  if (publishedEpisodes.length === 0) return undefined;
  return [...publishedEpisodes].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.episode - a.episode;
  })[0];
})();

export const seasons: SeasonSummary[] = Object.keys(SEASON_META).map((id) => {
  const meta = SEASON_META[id];
  const eps = episodes.filter((e) => e.season === id);
  const publishedCount = eps.filter(
    (e) => e.voicePass !== null && e.date !== "",
  ).length;
  return { id, ...meta, episodes: eps, publishedCount };
});

// Seasons that have at least one episode through voice-pass. Use this
// on public surfaces (home page, future indexes/feeds) so unpublished
// seasons don't leak. `seasons` stays as the full catalog for routes
// like /season-2 that should still resolve to an empty-state page.
export const publishedSeasons: SeasonSummary[] = seasons.filter(
  (s) => s.publishedCount > 0,
);

export function getSeason(id: string | undefined): SeasonSummary | undefined {
  if (!id) return undefined;
  return seasons.find((s) => s.id === id);
}

export function getEpisode(
  season: string | undefined,
  slug: string | undefined,
): Episode | undefined {
  if (!season || !slug) return undefined;
  return episodes.find((e) => e.season === season && e.slug === slug);
}

// Group episodes by arc within a season, preserving the arc order of
// first appearance.
export function groupEpisodesByArc(
  season: SeasonSummary,
): Array<{ arc: string; episodes: Episode[] }> {
  const groups = new Map<string, Episode[]>();
  for (const ep of season.episodes) {
    const arc = ep.arc || "Unsorted";
    if (!groups.has(arc)) groups.set(arc, []);
    groups.get(arc)!.push(ep);
  }
  return Array.from(groups.entries()).map(([arc, eps]) => ({
    arc,
    episodes: eps,
  }));
}

// Group published episodes by their `concept` frontmatter value.
// Concepts without a value are bucketed as "Unsorted". Episodes inside
// each group keep their natural episode-number order; groups
// themselves are returned in first-appearance order so the /concepts
// page reads chronologically by curriculum, not alphabetically.
export function groupEpisodesByConcept(): Array<{
  concept: string;
  episodes: Episode[];
}> {
  const groups = new Map<string, Episode[]>();
  for (const ep of publishedEpisodes) {
    const key = ep.concept.trim() || "Unsorted";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ep);
  }
  return Array.from(groups.entries()).map(([concept, eps]) => ({
    concept,
    episodes: eps,
  }));
}

// Find neighbour episodes (prev/next) within the same season, ordered
// by episode number. Returns { prev, next } either of which may be
// undefined at the edges.
export function getNeighbours(ep: Episode): {
  prev: Episode | undefined;
  next: Episode | undefined;
} {
  const season = getSeason(ep.season);
  if (!season) return { prev: undefined, next: undefined };
  const idx = season.episodes.findIndex((e) => e.slug === ep.slug);
  if (idx < 0) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? season.episodes[idx - 1] : undefined,
    next:
      idx < season.episodes.length - 1
        ? season.episodes[idx + 1]
        : undefined,
  };
}

// --- intro ----------------------------------------------------------

export const intro: Intro = (() => {
  const entry = Object.values(INTRO_RAW)[0];
  if (!entry) {
    return {
      title: "The Tessera Notebook",
      description: "",
      greeting: "The Tessera Notebook — a daily platform-engineering story.",
      body: "",
    };
  }
  return parseIntro(entry);
})();

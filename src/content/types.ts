// Domain types for the content layer. Loader produces these from
// markdown source under /content/.

export type SceneType = "feature" | "incident" | "support" | "decision";

export type Episode = {
  series: string;
  season: string;
  slug: string;
  episode: number;
  title: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  sceneType: SceneType;
  arc: string;
  concept: string;
  voicePass: string | null;
  body: string;
  url: string; // /<season>/<slug>
};

export type SeasonSummary = {
  id: string;
  label: string;
  title: string;
  tier: string;
  description: string;
  episodes: Episode[];
  publishedCount: number;
};

export type Intro = {
  title: string;
  description: string;
  greeting: string;
  body: string;
};

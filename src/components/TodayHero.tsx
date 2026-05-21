import { Link } from "react-router-dom";
import type { Episode } from "../content/types";
import { SceneTypeBadge } from "./Badge";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

export function TodayHero({ episode }: { episode: Episode | undefined }) {
  if (!episode) {
    return (
      <p className="lead" style={{ textAlign: "center", color: "var(--muted)" }}>
        First episode lands soon.
      </p>
    );
  }
  return (
    <Link to={episode.url} className="today-card" aria-label={`Today's episode: Day ${episode.episode}, ${episode.title}`}>
      <div className="today-card__meta">
        <SceneTypeBadge sceneType={episode.sceneType} />
        <span className="meta__sep">·</span>
        <span className="today-card__today">TODAY</span>
        <span className="meta__sep">·</span>
        <span>DAY {pad(episode.episode)}</span>
      </div>
      <h2 className="today-card__title">{episode.title}</h2>
      {episode.description ? (
        <p className="today-card__desc">{episode.description}</p>
      ) : null}
      <span className="today-card__cta">READ THIS EPISODE →</span>
    </Link>
  );
}

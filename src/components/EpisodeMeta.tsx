import type { Episode } from "../content/types";
import { SceneTypeBadge } from "./Badge";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

export function EpisodeMeta({ episode }: { episode: Episode }) {
  return (
    <div className="meta" aria-label="Episode metadata">
      <div className="meta__row">
        <SceneTypeBadge sceneType={episode.sceneType} />
        <span className="meta__sep">·</span>
        <span>DAY {pad(episode.episode)}</span>
        {episode.date ? (
          <>
            <span className="meta__sep">·</span>
            <time className="meta__time" dateTime={episode.date}>
              {episode.date}
            </time>
          </>
        ) : null}
      </div>
      {episode.concept ? (
        <div className="meta__row">
          <span className="meta__label">concept</span>
          <span className="meta__value">{episode.concept}</span>
        </div>
      ) : null}
    </div>
  );
}

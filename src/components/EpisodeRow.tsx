import { Link } from "react-router-dom";
import type { Episode } from "../content/types";
import { SceneTypeBadge } from "./Badge";
import { useReadingProgress } from "../state/ReadingProgress";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

export function EpisodeRow({ episode }: { episode: Episode }) {
  const { isRead } = useReadingProgress();
  const isPublished = episode.voicePass !== null && episode.date !== "";
  const read = isPublished && isRead(episode.url);

  const inner = (
    <>
      <div className="ep-row__top">
        <SceneTypeBadge sceneType={episode.sceneType} />
        <span className="meta__sep">·</span>
        <span>Day {pad(episode.episode)}</span>
      </div>
      <h3 className="ep-row__title">{episode.title}</h3>
      {episode.concept ? (
        <span className="ep-row__concept">{episode.concept}</span>
      ) : null}
      <div className="ep-row__bottom">
        {isPublished ? (
          <>
            <time>{episode.date}</time>
            <span className="meta__sep">·</span>
            <span className="ep-row__cta">read →</span>
          </>
        ) : (
          <span className="ep-row__cta">— coming soon —</span>
        )}
      </div>
    </>
  );

  if (isPublished) {
    return (
      <Link
        to={episode.url}
        className={`ep-row${read ? " ep-row--read" : ""}`}
        aria-label={`Day ${episode.episode}: ${episode.title}${read ? " (read)" : ""}`}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className="ep-row ep-row--coming" aria-label={`Day ${episode.episode}: ${episode.title}, coming soon`}>
      {inner}
    </div>
  );
}

import { Link } from "react-router-dom";
import type { SeasonSummary } from "../content/types";
import { useReadingProgress } from "../state/ReadingProgress";

export function SeasonCard({ season }: { season: SeasonSummary }) {
  const { readUrls } = useReadingProgress();
  const isActive = season.publishedCount > 0;
  const readCount = season.episodes.filter((e) => readUrls.has(e.url)).length;
  const complete = isActive && readCount === season.publishedCount;
  const ariaLabel = `${season.label}, ${season.title}, ${
    isActive
      ? `${season.publishedCount} ${season.publishedCount === 1 ? "episode" : "episodes"} published, ${readCount} read`
      : "coming soon"
  }`;
  const inner = (
    <>
      <span className="season-card__label">{season.label.toUpperCase()}</span>
      <h3 className="season-card__title">{season.title}</h3>
      <span className="season-card__tier">{season.tier}</span>
      <hr className="season-card__rule" />
      {isActive ? (
        <>
          <span className="season-card__count">
            {season.publishedCount} {season.publishedCount === 1 ? "episode" : "episodes"} published
          </span>
          <span
            className={`season-card__read${complete ? " season-card__read--complete" : ""}`}
          >
            {readCount} of {season.publishedCount} read{complete ? " ✓" : ""}
          </span>
        </>
      ) : (
        <span className="season-card__count season-card__count--coming">
          — coming —
        </span>
      )}
    </>
  );
  if (isActive) {
    return (
      <Link to={`/${season.id}`} className="season-card" aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  return (
    <div
      className="season-card season-card--coming"
      aria-label={ariaLabel}
    >
      {inner}
    </div>
  );
}

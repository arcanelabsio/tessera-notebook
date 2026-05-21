import type { Episode } from "../content/types";
import { TransitionLink } from "./TransitionLink";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

export function EpisodeNav({
  prev,
  next,
}: {
  prev: Episode | undefined;
  next: Episode | undefined;
}) {
  return (
    <nav className="ep-nav" aria-label="Episode navigation">
      {prev ? (
        <TransitionLink
          to={prev.url}
          className="ep-nav__card ep-nav__card--prev"
          aria-label={`Previous episode: Day ${prev.episode}, ${prev.title}`}
        >
          <span className="ep-nav__dir">← previous</span>
          <span className="ep-nav__day">Day {pad(prev.episode)}</span>
          <span className="ep-nav__title">{prev.title}</span>
        </TransitionLink>
      ) : (
        <span
          className="ep-nav__card ep-nav__card--prev ep-nav__card--disabled"
          aria-hidden="true"
        >
          <span className="ep-nav__dir">← previous</span>
          <span className="ep-nav__placeholder">— first episode —</span>
        </span>
      )}
      {next ? (
        <TransitionLink
          to={next.url}
          className="ep-nav__card ep-nav__card--next"
          aria-label={`Next episode: Day ${next.episode}, ${next.title}`}
        >
          <span className="ep-nav__dir">next →</span>
          <span className="ep-nav__day">Day {pad(next.episode)}</span>
          <span className="ep-nav__title">{next.title}</span>
        </TransitionLink>
      ) : (
        <span
          className="ep-nav__card ep-nav__card--next ep-nav__card--disabled"
          aria-hidden="true"
        >
          <span className="ep-nav__dir">next →</span>
          <span className="ep-nav__placeholder">— latest episode —</span>
        </span>
      )}
    </nav>
  );
}

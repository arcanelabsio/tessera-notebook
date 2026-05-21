import { Link } from "react-router-dom";
import { episodes, latestEpisode } from "../content/loader";
import { useReadingProgress } from "../state/ReadingProgress";
import { usePersisted } from "../state/usePersisted";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

// Editorial resume affordance. Surfaces lastVisited from
// ReadingProgress when the reader has an in-progress episode that isn't
// the latest published one. Dismissal is persisted per-episode so a
// caught-up reader doesn't see the card reappear after they read more.
export function ResumeCard() {
  const { lastVisited } = useReadingProgress();
  const [dismissed, setDismissed] = usePersisted<string | null>(
    "tessera:resume-dismissed:v1",
    null,
  );

  if (!lastVisited) return null;
  if (latestEpisode && lastVisited === latestEpisode.url) return null;
  if (dismissed === lastVisited) return null;

  const ep = episodes.find((e) => e.url === lastVisited);
  if (!ep) return null;

  return (
    <aside className="resume-card" aria-label="Resume reading">
      <Link to={ep.url} className="resume-card__link">
        <span className="resume-card__label">↩ Continue reading</span>
        <span className="resume-card__title">
          Day {pad(ep.episode)} — {ep.title}
        </span>
      </Link>
      <button
        type="button"
        className="resume-card__dismiss"
        onClick={() => setDismissed(lastVisited)}
        aria-label="Dismiss resume reading prompt"
      >
        ×
      </button>
    </aside>
  );
}

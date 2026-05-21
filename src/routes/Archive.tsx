import { Link } from "react-router-dom";
import { publishedEpisodes } from "../content/loader";
import { EpisodeRow } from "../components/EpisodeRow";
import { useDocumentTitle, pageTitle } from "../content/head";

// Flat chronological archive. Episodes sorted by date desc (newest
// first); falls back to episode-number desc when dates collide.
export function Archive() {
  useDocumentTitle(pageTitle("Archive"));
  const eps = [...publishedEpisodes].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.episode - a.episode;
  });

  return (
    <main id="main" className="page">
      <Link className="back-nav" to="/">
        ← /
      </Link>

      <section className="season-hero">
        <span className="season-hero__label">Archive</span>
        <h1 className="season-hero__title">Every episode, newest first.</h1>
        <p className="season-hero__desc">
          A flat chronological list of the published notebook. Use this when
          you remember a specific day and want to land on it directly, or to
          catch up after a few days away.
        </p>
      </section>

      {eps.length === 0 ? (
        <div className="empty-state">
          <p>No episodes published yet. The first one lands soon.</p>
        </div>
      ) : (
        <div className="arc-block__list" style={{ marginTop: "var(--space-12)" }}>
          {eps.map((ep) => (
            <EpisodeRow key={ep.url} episode={ep} />
          ))}
        </div>
      )}
    </main>
  );
}

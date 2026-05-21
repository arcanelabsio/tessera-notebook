import { Link } from "react-router-dom";
import { groupEpisodesByConcept } from "../content/loader";
import { EpisodeRow } from "../components/EpisodeRow";
import { useDocumentTitle, pageTitle } from "../content/head";

// Concept index. Each published episode declares a `concept` in its
// frontmatter — this view groups episodes by that concept so a
// returning reader who remembers "the fallacies of distributed
// computing" can navigate by idea, not by day number.
export function Concepts() {
  useDocumentTitle(pageTitle("Concepts"));
  const groups = groupEpisodesByConcept();

  return (
    <main id="main" className="page">
      <Link className="back-nav" to="/">
        ← /
      </Link>

      <section className="season-hero">
        <span className="season-hero__label">Concepts</span>
        <h1 className="season-hero__title">The ideas, by name.</h1>
        <p className="season-hero__desc">
          Each episode surfaces a single concept. This page groups episodes
          by the concept they introduce — read this when you remember an
          idea and want to find every episode that touches it.
        </p>
      </section>

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>No concepts indexed yet. Episodes will populate this view as they publish.</p>
        </div>
      ) : (
        groups.map(({ concept, episodes }) => (
          <section className="arc-block" key={concept}>
            <div className="arc-block__label">
              # CONCEPT <span className="arc-num">{episodes.length}</span>
            </div>
            <h2 className="arc-block__name">{concept}</h2>
            <div className="arc-block__list">
              {episodes.map((ep) => (
                <EpisodeRow key={ep.url} episode={ep} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}

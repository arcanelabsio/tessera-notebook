import { Link } from "react-router-dom";
import { episodes } from "../content/loader";
import { EpisodeRow } from "../components/EpisodeRow";
import { useReadingProgress } from "../state/ReadingProgress";
import { useDocumentTitle, pageTitle } from "../content/head";

// Save-for-later view. Iterates savedUrls in save-order (most recent
// first, as stored by toggleSaved) and renders the corresponding
// episodes. Silently skips saved URLs whose episode no longer exists
// (slug renames, removed drafts) — the localStorage entry stays so a
// future re-import would surface it again.
export function Saved() {
  useDocumentTitle(pageTitle("Saved"));
  const { savedUrls } = useReadingProgress();

  const eps = savedUrls
    .map((url) => episodes.find((e) => e.url === url))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  return (
    <main id="main" className="page">
      <Link className="back-nav" to="/">
        ← /
      </Link>

      <section className="season-hero">
        <span className="season-hero__label">Saved</span>
        <h1 className="season-hero__title">Pinned for later.</h1>
        <p className="season-hero__desc">
          Episodes you've starred from the bottom of any episode page. Stored
          locally to your browser only — no account, no sync.
        </p>
      </section>

      {eps.length === 0 ? (
        <div className="empty-state">
          <p>
            Nothing saved yet. Open any episode and press <kbd>s</kbd> or tap
            the save button below the read-time to keep it here.
          </p>
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

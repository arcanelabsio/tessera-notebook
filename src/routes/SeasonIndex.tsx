import { Link, useParams } from "react-router-dom";
import { getSeason, groupEpisodesByArc } from "../content/loader";
import { EpisodeRow } from "../components/EpisodeRow";
import { NotFound } from "./NotFound";
import { useDocumentTitle, pageTitle } from "../content/head";

function arcLabel(arc: string, idx: number): { num: string; name: string } {
  // Arcs in episodes look like "Arc 1 — The Premises of Distributed Computing".
  const m = /^Arc\s+(\d+)\s*—\s*(.+)$/.exec(arc);
  if (m) return { num: m[1], name: m[2] };
  return { num: String(idx + 1), name: arc };
}

export function SeasonIndex() {
  const { season: seasonId } = useParams<{ season: string }>();
  const season = getSeason(seasonId);
  useDocumentTitle(
    season ? pageTitle(season.label, season.title) : pageTitle("Not found"),
  );
  if (!season) return <NotFound />;

  const arcs = groupEpisodesByArc(season);

  return (
    <main className="page">
      <Link className="back-nav" to="/">
        ← /
      </Link>

      <section className="season-hero">
        <span className="season-hero__label">{season.label}</span>
        <h1 className="season-hero__title">{season.title}</h1>
        <span className="season-hero__tier">{season.tier}</span>
        <p className="season-hero__desc">{season.description}</p>
      </section>

      {season.episodes.length === 0 ? (
        <div className="empty-state">
          <p>This season hasn't begun yet. Watch this space.</p>
        </div>
      ) : (
        arcs.map(({ arc, episodes }, idx) => {
          const { num, name } = arcLabel(arc, idx);
          return (
            <section className="arc-block" key={arc}>
              <div className="arc-block__label">
                # ARC <span className="arc-num">{num}</span>
              </div>
              <h2 className="arc-block__name">{name}</h2>
              <div className="arc-block__list">
                {episodes.map((ep) => (
                  <EpisodeRow key={ep.slug} episode={ep} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}

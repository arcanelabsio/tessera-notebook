import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getEpisode, getNeighbours } from "../content/loader";
import { EpisodeMeta } from "../components/EpisodeMeta";
import { EpisodeBody } from "../components/EpisodeBody";
import { EpisodeNav } from "../components/EpisodeNav";
import { useReadingProgress } from "../state/ReadingProgress";
import { useDocumentTitle, pageTitle } from "../content/head";
import { NotFound } from "./NotFound";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

export function Episode() {
  const { season, slug } = useParams<{ season: string; slug: string }>();
  const ep = getEpisode(season, slug);
  const { markRead, setLastVisited } = useReadingProgress();

  useDocumentTitle(
    ep ? pageTitle(ep.title, `Day ${pad(ep.episode)}`) : pageTitle("Not found"),
  );

  // Track that the reader opened this episode. Marking as "read"
  // happens when the URL is visited (less reliable but works for any
  // engagement); a future iteration could gate this on scroll-to-bottom.
  useEffect(() => {
    if (!ep) return;
    setLastVisited(ep.url);
    markRead(ep.url);
  }, [ep, markRead, setLastVisited]);

  // Scroll to top on episode change (the SPA router preserves scroll
  // by default, which surprises readers who expect each episode to
  // start at the top).
  useEffect(() => {
    if (!ep) return;
    window.scrollTo(0, 0);
  }, [ep]);

  if (!ep) return <NotFound />;
  const { prev, next } = getNeighbours(ep);
  const epPad = pad(ep.episode);

  return (
    <main className="page">
      <Link className="back-nav" to={`/${ep.season}`}>
        ← /{ep.season}
      </Link>

      <EpisodeMeta episode={ep} />

      <h1 className="title">{ep.title}</h1>

      {ep.description ? <p className="lead">{ep.description}</p> : null}

      <hr className="thin" />

      <EpisodeBody body={ep.body} />

      <p className="read-time" aria-label="Estimated reading time">
        ~{ep.readMinutes} min read
      </p>

      <hr className="thin thin--centered" />

      <EpisodeNav prev={prev} next={next} />

      <p className="back-nav" style={{ marginTop: "var(--space-12)" }}>
        <Link to={`/${ep.season}`}>~/{ep.season}</Link>
        {" · "}
        <Link to="/">~/notebook</Link>
        {" · "}
        <span aria-hidden="true">day {epPad}</span>
      </p>
    </main>
  );
}

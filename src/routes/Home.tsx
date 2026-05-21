import { intro, latestEpisode, publishedSeasons } from "../content/loader";
import { Markdown } from "../components/Markdown";
import { ResumeCard } from "../components/ResumeCard";
import { SeasonCard } from "../components/SeasonCard";
import { TodayHero } from "../components/TodayHero";
import { useDocumentTitle, pageTitle } from "../content/head";

export function Home() {
  useDocumentTitle(pageTitle());
  return (
    <main id="main" className="page">
      <h1 className="visually-hidden">The Tessera Notebook</h1>
      <p className="greeting">{intro.greeting}</p>

      <ResumeCard />

      <h2 className="home-section">Today</h2>
      <TodayHero episode={latestEpisode} />

      <h2 className="home-section">The notebook</h2>
      <div className="intro-body">
        <Markdown source={intro.body} variant="inline" />
      </div>

      <h2 className="home-section">Browse by season</h2>
      <div className="seasons-grid">
        {publishedSeasons.map((s) => (
          <SeasonCard key={s.id} season={s} />
        ))}
      </div>
    </main>
  );
}

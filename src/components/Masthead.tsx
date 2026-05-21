import { Link, useLocation } from "react-router-dom";

export function Masthead() {
  const { pathname } = useLocation();
  const onSeasonOrEpisode = /^\/season-\d/.test(pathname);
  return (
    <header className="masthead">
      <div className="masthead__inner">
        <Link to="/" className="masthead__title-link" aria-label="The Tessera Notebook — home">
          <span className="masthead__title">
            The Tessera Notebook <span className="vol">· Vol. 1</span>
          </span>
        </Link>
        <nav className="masthead__nav" aria-label="primary">
          <Link to="/" aria-current={pathname === "/" ? "page" : undefined}>
            home
          </Link>
          <span className="sep">·</span>
          <Link
            to="/season-1"
            aria-current={onSeasonOrEpisode ? "true" : undefined}
          >
            seasons
          </Link>
          <span className="sep">·</span>
          <a className="rss" href="/feed.xml" aria-label="RSS feed">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.18 15.64a2.18 2.18 0 1 1 0 4.36 2.18 2.18 0 0 1 0-4.36zM4 4.44A19.56 19.56 0 0 1 23.56 24h-2.83A16.73 16.73 0 0 0 4 7.27V4.44zm0 5.66A13.9 13.9 0 0 1 17.9 24h-2.83A11.07 11.07 0 0 0 4 12.93V10.1z" />
            </svg>
            rss
          </a>
        </nav>
      </div>
    </header>
  );
}

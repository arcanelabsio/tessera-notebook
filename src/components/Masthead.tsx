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
        </nav>
      </div>
    </header>
  );
}

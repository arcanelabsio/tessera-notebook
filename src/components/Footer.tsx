export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__attribution">
          Part of <a href="https://arcanelabs.info">arcanelabs.info</a> — a multi-year platform-engineering serial by arcanelabs.
        </p>
        <p className="footer__links">
          <a href="https://github.com/arcanelabsio/tessera-notebook">github</a>
          <span className="sep">·</span>
          <a href="https://instagram.com/labs.arcane">@labs.arcane</a>
          <span className="sep">·</span>
          <a href="/feed.xml">rss</a>
        </p>
      </div>
    </footer>
  );
}

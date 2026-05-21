import { Link } from "react-router-dom";
import { useDocumentTitle, pageTitle } from "../content/head";

export function NotFound() {
  useDocumentTitle(pageTitle("Not found"));
  return (
    <main className="page">
      <section className="season-hero">
        <span className="season-hero__label">404</span>
        <h1 className="season-hero__title">This page isn't here.</h1>
        <p className="season-hero__desc">
          The URL you followed doesn't match any episode, season, or document.
          The notebook is open-ended — content arrives daily; some links might
          point to episodes that haven't been written yet.
        </p>
      </section>

      <p style={{ textAlign: "center", marginTop: "var(--space-12)" }}>
        <Link to="/" style={{ color: "var(--mint)", fontFamily: "var(--f-mono)" }}>
          → back to /
        </Link>
      </p>
    </main>
  );
}

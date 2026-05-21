import { Link } from "react-router-dom";
import { docs } from "../content/loader";
import { DocRow } from "../components/DocRow";
import { useDocumentTitle, pageTitle } from "../content/head";

export function DocsIndex() {
  useDocumentTitle(pageTitle("Architecture"));
  return (
    <main className="page">
      <Link className="back-nav" to="/">
        ← /
      </Link>

      <section className="docs-hero">
        <span className="docs-hero__label">Architecture</span>
        <h1 className="docs-hero__title">Decisions, recorded</h1>
        <p className="docs-hero__desc">
          The ADRs that shape The Tessera Notebook — the system around the serial, not the serial itself. How content moves from editorial source to the published site, why the carousel renders the way it does, why this notebook lives at its own subdomain.
        </p>
      </section>

      {docs.length === 0 ? (
        <div className="empty-state">
          <p>No architecture docs published yet.</p>
        </div>
      ) : (
        <div className="docs-list">
          {docs.map((d) => (
            <DocRow key={d.slug} doc={d} />
          ))}
        </div>
      )}
    </main>
  );
}

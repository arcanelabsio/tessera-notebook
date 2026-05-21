import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getDoc } from "../content/loader";
import { Markdown } from "../components/Markdown";
import { NotFound } from "./NotFound";
import { useDocumentTitle, pageTitle } from "../content/head";

export function Doc() {
  const { slug } = useParams<{ slug: string }>();
  const doc = getDoc(slug);
  useDocumentTitle(doc ? pageTitle(doc.title, doc.id) : pageTitle("Not found"));

  useEffect(() => {
    if (doc) window.scrollTo(0, 0);
  }, [doc]);

  if (!doc) return <NotFound />;

  const statusClass = `doc-meta__status doc-meta__status--${doc.status.toLowerCase()}`;

  return (
    <main className="page">
      <Link className="back-nav" to="/docs">
        ← /docs
      </Link>

      <h1 className="title">{doc.title}</h1>

      <div className="doc-meta">
        <div className="doc-meta__row">
          <span className="doc-meta__label">id</span>
          <span className="doc-meta__value">{doc.id}</span>
        </div>
        <div className="doc-meta__row">
          <span className="doc-meta__label">status</span>
          <span className={statusClass}>{doc.status}</span>
        </div>
        {doc.date ? (
          <div className="doc-meta__row">
            <span className="doc-meta__label">date</span>
            <time className="doc-meta__value" dateTime={doc.date}>
              {doc.date}
            </time>
          </div>
        ) : null}
        {doc.supersedes ? (
          <div className="doc-meta__row">
            <span className="doc-meta__label">supersedes</span>
            <span className="doc-meta__value">{doc.supersedes}</span>
          </div>
        ) : null}
        {doc.supersededBy ? (
          <div className="doc-meta__row">
            <span className="doc-meta__label">superseded by</span>
            <span className="doc-meta__value">{doc.supersededBy}</span>
          </div>
        ) : null}
      </div>

      <hr className="thin" />

      <article className="prose">
        <Markdown source={doc.body} variant="episode" />
      </article>
    </main>
  );
}

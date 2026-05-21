import { Link } from "react-router-dom";
import type { Doc } from "../content/types";

export function DocRow({ doc }: { doc: Doc }) {
  return (
    <Link
      to={doc.url}
      className="doc-row"
      aria-label={`${doc.id}: ${doc.title}`}
    >
      <span className="doc-row__label">
        {doc.id} · {doc.status}
      </span>
      <h3 className="doc-row__title">{doc.title}</h3>
      {doc.date ? <span className="doc-row__date">{doc.date}</span> : null}
    </Link>
  );
}

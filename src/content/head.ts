import { useEffect } from "react";

// Tiny document-title manager. React Helmet would handle this more
// comprehensively but for a single-tab SPA the synchronous title-write
// is sufficient and avoids the dependency.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

const SITE_NAME = "The Tessera Notebook";

export function pageTitle(...parts: string[]): string {
  const filtered = parts.filter(Boolean);
  if (filtered.length === 0) return SITE_NAME;
  return `${filtered.join(" — ")} — ${SITE_NAME}`;
}

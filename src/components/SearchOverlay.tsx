import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { search, type SearchResult } from "../lib/search";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

// Global search overlay. Opens via "/" key or a click from the
// masthead search trigger. Uses native <dialog> for focus trap, ESC
// handling, and backdrop click for free.
//
// Results are computed synchronously off the in-memory corpus (linear
// scan; see src/lib/search.ts). For typical catalog sizes this is
// well under one frame — no debouncing needed. If the corpus grows
// past ~500 episodes, switch to MiniSearch and re-evaluate.
export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusedIdx, setFocusedIdx] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => search(query), [query]);

  useKeyboardShortcuts({
    "/": (e) => {
      e.preventDefault();
      setOpen(true);
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal autofocuses the first focusable child. We want focus
      // on the input specifically, so re-focus after the browser does.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Reset transient state when the dialog closes so the next open
  // doesn't preserve stale query/focus.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setFocusedIdx(0);
    }
  }, [open]);

  // Clamp focusedIdx whenever the result list shrinks.
  useEffect(() => {
    if (focusedIdx >= results.length) setFocusedIdx(0);
  }, [results.length, focusedIdx]);

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setFocusedIdx(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[focusedIdx];
      if (r) go(r.episode.url);
    }
  };

  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) setOpen(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="search-overlay"
      onClose={() => setOpen(false)}
      onClick={onBackdrop}
      aria-label="Search episodes"
    >
      <div className="search-overlay__inner">
        <div className="search-overlay__input-row">
          <span className="search-overlay__icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            type="search"
            className="search-overlay__input"
            placeholder="Search episodes, concepts, ideas…"
            value={query}
            onChange={onChange}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Search query"
          />
          <kbd className="search-overlay__hint">esc</kbd>
        </div>

        {query.trim().length === 0 ? (
          <div className="search-overlay__empty">
            Type to search across titles, concepts, descriptions, and body text.
            <span className="search-overlay__hint-row">
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate · <kbd>↵</kbd> to open
            </span>
          </div>
        ) : results.length === 0 ? (
          <div className="search-overlay__empty">
            No matches for <strong>{query}</strong>.
          </div>
        ) : (
          <ul className="search-overlay__results" role="listbox">
            {results.map((r, i) => (
              <li
                key={r.episode.url}
                role="option"
                aria-selected={i === focusedIdx}
                className={`search-overlay__result${
                  i === focusedIdx ? " search-overlay__result--focused" : ""
                }`}
              >
                <button
                  type="button"
                  className="search-overlay__hit"
                  onClick={() => go(r.episode.url)}
                  onMouseEnter={() => setFocusedIdx(i)}
                >
                  <span className="search-overlay__hit-meta">
                    Day {pad(r.episode.episode)} · {r.episode.season.replace("season-", "S")}
                  </span>
                  <span className="search-overlay__hit-title">
                    {r.episode.title}
                  </span>
                  {r.episode.concept ? (
                    <span className="search-overlay__hit-concept">
                      {r.episode.concept}
                    </span>
                  ) : null}
                  <span className="search-overlay__hit-snippet">
                    {r.snippet}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}

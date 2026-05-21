import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePersisted } from "./usePersisted";

type ReadingProgressState = {
  // Set of episode urls (`/season-1/two-regions-by-friday`) that the
  // reader has marked read OR scrolled to completion on.
  readUrls: Set<string>;
  isRead: (url: string) => boolean;
  markRead: (url: string) => void;
  markUnread: (url: string) => void;
  // The last episode the reader opened — used for "Resume reading"
  // (not yet wired into a UI but tracked from day one).
  lastVisited: string | null;
  setLastVisited: (url: string) => void;
};

const ReadingProgressContext = createContext<ReadingProgressState | null>(
  null,
);

const READ_KEY = "tessera:reading-progress:v1";
const LAST_KEY = "tessera:last-visited:v1";

export function ReadingProgressProvider({ children }: { children: ReactNode }) {
  const [readArray, setReadArray] = usePersisted<string[]>(READ_KEY, []);
  const [lastVisited, setLastVisited] = usePersisted<string | null>(
    LAST_KEY,
    null,
  );

  const readUrls = useMemo(() => new Set(readArray), [readArray]);

  const isRead = useCallback((url: string) => readUrls.has(url), [readUrls]);

  const markRead = useCallback(
    (url: string) => {
      setReadArray((prev) => {
        if (prev.includes(url)) return prev;
        return [...prev, url];
      });
    },
    [setReadArray],
  );

  const markUnread = useCallback(
    (url: string) => {
      setReadArray((prev) => prev.filter((u) => u !== url));
    },
    [setReadArray],
  );

  const value: ReadingProgressState = {
    readUrls,
    isRead,
    markRead,
    markUnread,
    lastVisited,
    setLastVisited,
  };

  return (
    <ReadingProgressContext.Provider value={value}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress(): ReadingProgressState {
  const ctx = useContext(ReadingProgressContext);
  if (!ctx) {
    throw new Error(
      "useReadingProgress must be used inside a ReadingProgressProvider",
    );
  }
  return ctx;
}

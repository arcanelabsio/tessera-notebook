import { useCallback, useEffect, useRef, useState } from "react";

// localStorage-backed state. Reads on mount, writes on change. Safe
// during SSR / build-time render (returns the initial value when
// `window` is absent). Use sparingly — this is for *reader-side
// preferences*, not editorial state.
export function usePersisted<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const initialised = useRef(false);

  // Read once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Corrupt or unreadable — fall back to initial.
    }
    initialised.current = true;
  }, [key]);

  // Write on change (skip the first render so we don't overwrite
  // before we've read).
  useEffect(() => {
    if (!initialised.current) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage unavailable — ignore.
    }
  }, [key, value]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, set];
}

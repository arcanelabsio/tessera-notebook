import { useEffect, useRef } from "react";

export type ShortcutHandler = (e: KeyboardEvent) => void;
export type ShortcutMap = Record<string, ShortcutHandler>;

// Listens on document.keydown and dispatches by KeyboardEvent.key. Skips
// when focus is in an editable element or when modifier keys are held —
// reserved key combos (Cmd/Ctrl/Alt+anything) belong to the browser/OS,
// not the page. Map values are stored in a ref so updates don't tear
// down the listener.
export function useKeyboardShortcuts(map: ShortcutMap, enabled = true): void {
  const mapRef = useRef<ShortcutMap>(map);
  mapRef.current = map;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const handler = mapRef.current[e.key];
      if (handler) handler(e);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}

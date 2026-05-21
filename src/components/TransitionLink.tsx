import { type MouseEvent, type ReactNode, useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";

type Props = {
  to: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

// Drop-in replacement for <Link> that opts into the View Transitions
// API for cross-route animations. Falls back to plain navigation when
// the API is unsupported (Firefox <129, older Safari) or when the
// reader has prefers-reduced-motion enabled. flushSync forces React's
// commit to happen inside the transition callback so the snapshot
// captures the new DOM, not a stale render.
type StartViewTransition = (cb: () => void) => unknown;

function startViewTransition(cb: () => void): boolean {
  const doc = document as Document & {
    startViewTransition?: StartViewTransition;
  };
  if (typeof doc.startViewTransition !== "function") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  doc.startViewTransition(() => flushSync(cb));
  return true;
}

export function TransitionLink({
  to,
  className,
  children,
  "aria-label": ariaLabel,
}: Props) {
  const navigate = useNavigate();
  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (!startViewTransition(() => navigate(to))) navigate(to);
    },
    [navigate, to],
  );
  return (
    <a href={to} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

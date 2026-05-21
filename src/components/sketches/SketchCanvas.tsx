import { useEffect, useRef, useState } from "react";
import type p5Type from "p5";

// React wrapper around p5's instance mode.
//
// Why this exists:
// - p5 must be dynamically imported, or it costs ~150kb on every page
//   (Home, Archive, etc.) even when no sketch is on screen. The import()
//   below resolves into `vendor-sketches` (see vite.config.ts).
// - p5's lifecycle is "construct → run forever → remove()". React's is
//   "mount → re-render → unmount". Without the cleanup in the effect,
//   navigating away from an episode leaks the canvas + draw loop.
// - Long-form articles can scroll the sketch out of view for minutes.
//   The IntersectionObserver gate parks the loop while offscreen.
// - prefers-reduced-motion is respected by drawing one frame and then
//   suspending — readers still get the visual; CPU doesn't churn.

export type SketchFactory = (p: p5Type, theme: ThemeColors) => void;

export type ThemeColors = {
  bg: string;
  bg2: string;
  fg: string;
  fgMuted: string;
  muted: string;
  mint: string;
  mintSoft: string;
  amber: string;
  amberSoft: string;
  rule: string;
  ruleSoft: string;
};

function readTheme(host: HTMLElement): ThemeColors {
  const cs = getComputedStyle(host);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    bg: v("--bg"),
    bg2: v("--bg-2"),
    fg: v("--fg"),
    fgMuted: v("--fg-muted"),
    muted: v("--muted"),
    mint: v("--mint"),
    mintSoft: v("--mint-soft"),
    amber: v("--amber"),
    amberSoft: v("--amber-soft"),
    rule: v("--rule"),
    ruleSoft: v("--rule-soft"),
  };
}

type Props = {
  factory: SketchFactory;
  // Stable key for the sketch; changing it tears down and rebuilds
  // (used when frontmatter changes between episodes on SPA navigation).
  sketchKey: string;
  // Editorial className for the wrapping figure; tone, spacing, captions
  // are owned by app.css, not by the sketch.
  className?: string;
  // Optional caption rendered below the canvas (mono, small, --muted).
  caption?: string;
  // Aspect ratio (width / height). Defaults to 16:5 — a tall band reads
  // as chrome; a short band reads as content.
  aspect?: number;
};

export function SketchCanvas({
  factory,
  sketchKey,
  className,
  caption,
  aspect = 16 / 5,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let instance: p5Type | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    (async () => {
      const mod = await import("p5");
      if (cancelled) return;
      const P5Ctor = (mod as { default: typeof p5Type }).default;
      // p5 v1's Friendly Error System (FES) tries to fetch the
      // calling script's source over the network to produce nicer
      // error messages. That fetch fails noisily in our dev setup
      // (modules served by Vite, not as standalone scripts). FES is
      // a development convenience for p5 authors, not something our
      // production canvases need — disable it once at load time.
      (P5Ctor as unknown as { disableFriendlyErrors?: boolean })
        .disableFriendlyErrors = true;
      const theme = readTheme(host);

      instance = new P5Ctor((p: p5Type) => {
        factory(p, theme);
        // If the sketch author didn't override draw() into a noop, we
        // still suspend immediately under reduced-motion after the
        // first frame so the reader gets a static composition.
        if (reducedMotion) {
          const userDraw = p.draw;
          p.draw = function patchedDraw() {
            userDraw.call(p);
            p.noLoop();
          };
        }
      }, host);

      setLoaded(true);

      // Park the loop when the sketch isn't in the viewport. Avoids
      // burning frames on a 7-min article scrolled past the band.
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            const visible = entries[0]?.isIntersecting;
            if (!instance) return;
            if (visible && !reducedMotion) {
              instance.loop();
            } else {
              instance.noLoop();
            }
          },
          { threshold: 0.01 },
        );
        io.observe(host);
      }
    })();

    return () => {
      cancelled = true;
      io?.disconnect();
      instance?.remove();
    };
  }, [factory, sketchKey]);

  return (
    <figure
      className={className ?? "sketch-figure"}
      style={{ aspectRatio: String(aspect) }}
      aria-hidden={caption ? undefined : true}
    >
      <div
        ref={hostRef}
        className="sketch-host"
        data-loaded={loaded ? "true" : undefined}
      />
      {caption ? <figcaption className="sketch-caption">{caption}</figcaption> : null}
    </figure>
  );
}

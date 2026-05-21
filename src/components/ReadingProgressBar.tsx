import { useEffect, useState } from "react";

// Fixed 2px mint bar at the top of the viewport that scales horizontally
// as the reader scrolls. Updates are rAF-throttled. Hidden under
// prefers-reduced-motion to avoid a transform-driven affordance for
// readers who opted out of motion.
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      setProgress(next);
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div
        className="reading-progress__bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

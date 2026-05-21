import { useEffect, useState } from "react";

// Sticky beat indicator that announces which of the 5 episode sections
// (Scene / The concept it surfaces / Mental model / One question to
// journal / Tomorrow) the reader is currently in. Drives off the
// section-h IDs already added by EpisodeBody.
//
// Hidden until the reader scrolls past the lead, then fades in. Uses
// IntersectionObserver with a top-biased rootMargin so the "current"
// section is whichever heading is near the top of the viewport.
export function SectionBeat() {
  const [label, setLabel] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(".prose .section-h"),
    );
    if (headings.length === 0) return;

    let visible = new Set<HTMLElement>();
    const pickCurrent = () => {
      if (visible.size === 0) return;
      const sorted = Array.from(visible).sort(
        (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
      );
      setLabel(sorted[0].textContent ?? null);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
        pickCurrent();
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );
    headings.forEach((h) => io.observe(h));

    const onScroll = () => setPinned(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`section-beat${pinned && label ? " section-beat--visible" : ""}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}

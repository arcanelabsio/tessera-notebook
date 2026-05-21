import { Suspense, useCallback, useState } from "react";
import { Markdown } from "./Markdown";
import type { Episode } from "../content/types";
import { AmbientSketch } from "./sketches/ambient";
import { CONCEPT_SKETCHES, hasConceptSketch } from "./sketches/registry";

// Split an episode body by H2 sections. The episode template (Scene,
// Concept, Mental model, Question, Tomorrow) is fixed, so a simple
// linewise scanner is enough.
type Section = { heading: string; id: string; body: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function splitSections(body: string): Section[] {
  const lines = body.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section | null = null;
  let buffer: string[] = [];
  for (const line of lines) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      if (current) {
        current.body = buffer.join("\n").trim();
        sections.push(current);
      }
      current = { heading: h2[1], id: slugify(h2[1]), body: "" };
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
    // Lines before the first H2 are dropped (the episode-body H1 lives
    // in frontmatter, not the body content shown on the site).
  }
  if (current) {
    current.body = buffer.join("\n").trim();
    sections.push(current);
  }
  return sections;
}

// Map section heading → CSS wrapper class. The Mental model and One
// question to journal sections get card treatment per ADR-0008/0007;
// other sections (Scene, The concept it surfaces, Tomorrow) render as
// plain body prose.
function wrapperFor(heading: string): string | null {
  const lower = heading.toLowerCase();
  if (lower === "mental model") return "mm-card";
  if (lower === "one question to journal") return "question";
  return null;
}

function AnchorLink({ id, heading }: { id: string; heading: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      window.history.replaceState(null, "", `#${id}`);
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }
      } catch {
        // clipboard write can fail under permissions policy or non-secure
        // contexts; the URL hash update above still gives readers a way
        // to share — just no toast feedback.
      }
    },
    [id],
  );
  return (
    <a
      href={`#${id}`}
      className="anchor-link"
      onClick={onClick}
      data-copied={copied ? "true" : undefined}
      aria-label={`Copy link to section: ${heading}`}
    >
      #
    </a>
  );
}

function EpisodeTOC({ sections }: { sections: Section[] }) {
  if (sections.length < 2) return null;
  return (
    <nav className="episode-toc" aria-label="Episode sections">
      <span className="episode-toc__label"># beats</span>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`}>
          {s.heading}
        </a>
      ))}
    </nav>
  );
}

// The concept sketch is rendered immediately after the "Mental model"
// beat — that's where the abstract has just been introduced and the
// reader most benefits from a manipulable counterpart. Headings other
// than "Mental model" don't trigger injection.
function isMentalModel(heading: string): boolean {
  return heading.toLowerCase() === "mental model";
}

export function EpisodeBody({ episode }: { episode: Episode }) {
  const sections = splitSections(episode.body);
  const ConceptSketch = hasConceptSketch(episode.slug)
    ? CONCEPT_SKETCHES[episode.slug]
    : null;
  return (
    <article className="prose">
      <AmbientSketch episode={episode} />
      <EpisodeTOC sections={sections} />
      {sections.map((section) => {
        const wrap = wrapperFor(section.heading);
        return (
          <div key={section.id}>
            <h2 className="section-h" id={section.id}>
              <AnchorLink id={section.id} heading={section.heading} />
              {section.heading}
            </h2>
            {wrap ? (
              <div className={wrap}>
                <Markdown source={section.body} variant="inline" />
              </div>
            ) : (
              <Markdown source={section.body} variant="inline" />
            )}
            {ConceptSketch && isMentalModel(section.heading) ? (
              <Suspense fallback={null}>
                <ConceptSketch />
              </Suspense>
            ) : null}
          </div>
        );
      })}
    </article>
  );
}

import { Markdown } from "./Markdown";

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

export function EpisodeBody({ body }: { body: string }) {
  const sections = splitSections(body);
  return (
    <article className="prose">
      {sections.map((section) => {
        const wrap = wrapperFor(section.heading);
        return (
          <div key={section.id}>
            <h2 className="section-h" id={section.id}>
              {section.heading}
            </h2>
            {wrap ? (
              <div className={wrap}>
                <Markdown source={section.body} variant="inline" />
              </div>
            ) : (
              <Markdown source={section.body} variant="inline" />
            )}
          </div>
        );
      })}
    </article>
  );
}

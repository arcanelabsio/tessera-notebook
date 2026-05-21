---
id: ADR-0008
title: Notebook carousel slides render per-purpose, not as a single repeated template; PNG export is canvas-driven at 1080×1350
status: Accepted
date: 2026-05-21
supersedes:
superseded_by:
---

## Context

The carousel orchestrator in `scripts/lib/templates.mjs` renders all six Instagram slides through a single visual template: terminal chrome, `[SCENE-TYPE]` badge, arc subtitle, heading, and a `<foreignObject>` block dumping a 600-character condensed slice of one episode section. Slides 02 through 05 are visually indistinguishable — same chrome, same heading position, same prose box.

This produces three problems that compound:

1. **Visual sameness across slides.** A six-slide Instagram carousel earns its readability from *visual variety per slide*. Side-by-side with `arcanelabsio/social/projects/cloud_sync/cloud_sync_drive/2026-04-20-drive-scope-launch/post.html` — which uses a hand-laid-out per-purpose template for each slide (hero title, install command + YAML, three-API-cards, numbered code blocks, cost breakdown, link list with CTA) — the notebook carousel reads as the same slide repeated six times with different text. Readers swipe past faster.

2. **No download path.** The current `post.html` has no per-slide SVG/PNG download controls and no bulk export. The author is expected to manually screenshot each slide. The preview grid renders slides at `minmax(360px, 1fr)` — between roughly 360 px and 1280 px wide depending on viewport — so any screenshot is downscaled from the 1080×1350 SVG target. The cloud_sync reference template has per-slide `[svg]` + `[png 1080×1350]` buttons plus a "download all 6 slides as PNG" bulk button, all canvas-driven; the saved PNGs are always 1080×1350 regardless of how the preview renders.

3. **`<foreignObject>` does not paint reliably to canvas.** Even if downloaders were bolted onto the current template, the body text lives inside a `<foreignObject>` block. Most browsers refuse to paint `<foreignObject>` content when serializing SVG to a canvas (the security/origin model treats embedded HTML as tainted). Reliable PNG export requires hand-positioned native SVG `<text>` elements with manual wrapping — which is what cloud_sync uses.

There is a fourth, structural concern that affects how this redesign is framed.

The existing AGENTS.md invariant #2 reads: *"Carousel content fidelity. Episode content fits the carousel; the carousel never trims the episode."* That invariant made sense when the carousel was being treated as a complete content artifact in its own right. But every slide already carries an `arcanelabs.info/notebook/...` footer, and slide 06's job is the call-to-action that routes readers to the canonical post. In practice the carousel has always been a *teaser* (a distribution surface for the editorial artifact), not a complete substitute for it. The invariant has been describing an aspiration the rendering pipeline cannot satisfy — a 600-word concept body does not fit on a 1080×1350 slide regardless of how cleverly it's condensed.

## Options Considered

### Option A: Bolt downloaders onto the existing template; leave the visual sameness alone

Add per-slide SVG/PNG buttons and a bulk-download button to the current `buildCarouselHtml` output. Keep the single uniform `[SCENE-TYPE] / arc / heading / foreignObject body` slide structure.

- **Pro:** Smallest possible change. Unblocks the Instagram-upload workflow today without touching slide content.
- **Con:** Does not address the visual sameness problem. Carousel reads as the same slide six times.
- **Con:** `<foreignObject>`-to-canvas painting is unreliable across browsers. Downloaders would ship but produce blank or partial bodies on a meaningful fraction of exports.

### Option B: Per-purpose slide layouts, no downloader work

Rewrite the six slides to each have their own visual idiom: hero title, scene pull-quote, definition card, mental model table or diagram, the question with breathing room, take-home + CTA. Keep manual screenshot as the export path.

- **Pro:** Solves the readability problem. Each slide does visual work the others don't.
- **Con:** Still requires the author to hand-screenshot each slide and accept the downscaling. The friction that's blocking daily uploads stays in place.
- **Con:** Half-shipping the redesign and saying "downloaders next time" creates a window where the new visual layouts exist but can't be cleanly exported. Two visible deliveries instead of one.

### Option C: Per-purpose layouts + canvas-driven PNG export at 1080×1350 (chosen)

Rewrite `extractSlides` to produce a per-purpose data shape per slide (the same six slots, but each one extracts the chunk of episode content it actually needs and rejects the rest). Add six dedicated SVG builders, one per slide kind, using hand-positioned native `<text>` elements with manual line wrapping — no `<foreignObject>`. Wrap `buildCarouselHtml` with per-slide `[svg]` and `[png 1080×1350]` buttons plus a `download all 6 slides as PNG` bulk button. Wire `downloadSvg` / `downloadPng` / `downloadAllPngs` JS helpers that serialize the SVG, paint it to a `<canvas>` at a fixed 1080×1350, and save the result as PNG — cloning the pattern proven in the cloud_sync carousel.

- **Pro:** Ships the variety and the export path in one change. The visual variety only pays off if the author can actually upload the slides.
- **Pro:** Native SVG `<text>` makes canvas export reliable across browsers and at the correct dimensions regardless of the preview grid's width.
- **Pro:** Each slide does visual work the others don't, which is the readability-driving property of every working IG carousel.
- **Pro:** Reframes the carousel's role in the editorial system honestly — it is a teaser/distribution surface for the canonical post, and slide 06's CTA already encoded that. The invariant in AGENTS.md catches up to reality.
- **Con:** Substantially more code than Option A. Six per-purpose builders + a manual `wrapText` helper + per-slide content extractors. Roughly 600–800 lines of `templates.mjs` change.
- **Con:** Pull-quote extraction for slide 02 (the scene excerpt) is heuristic — the orchestrator picks the last paragraph in the scene that contains a quoted phrase, capped at ~280 chars. For some episodes that may not pick the best line, and the author may want to override. Mitigation: an optional `social_pull_quote` field in episode frontmatter is documented as a future enhancement (this ADR doesn't ship it; the heuristic is the default).
- **Con:** Mental model rendering for slide 04 needs to detect whether the section is a markdown table, a fenced code block (ASCII diagram), or prose, and render each appropriately in native SVG. Three rendering paths in one slide builder.

## Decision

**Option C.**

The notebook carousel is rewritten so each of the six slides has a purpose-built layout. The slide-mapping contract (the slot purposes set in ADR-0007) is unchanged: slide 01 title, 02 scene, 03 concept, 04 mental model, 05 the question, 06 take-home. What changes is *how each slide renders*:

| Slide | Layout | Content extracted |
|---|---|---|
| **01 · title** | Hero. Scene-type badge top, episode title in 72 px mint, arc subtitle, concept as amber tag, generous whitespace. | `title`, `sceneType`, `arc`, `concept`, `episode`, `date` from frontmatter. |
| **02 · scene** | Pull-quote. One excerpt in 32–38 px with quote glyphs, attributed to the speaker. | Last paragraph in the scene containing a quoted phrase (≤ 280 chars). Fallback: first paragraph trimmed. |
| **03 · concept** | Definition card. Concept name as heading, one definition sentence, up to 4 bullets. | First non-empty paragraph after the H2 (definition); first markdown list under that (bullets). |
| **04 · mental model** | Table or code block or prose, rendered crisp in native SVG. | The `## Mental model` section verbatim; rendered as parsed table, preformatted code, or wrapped prose depending on the section's shape. |
| **05 · the question** | Big quiet slide. The question in 36–44 px with generous line height; minimal chrome. | The `## One question to journal` section, condensed if necessary. |
| **06 · take-home** | Tomorrow tease + CTA. Tomorrow's headline, the canonical episode URL, handles. | The `## Tomorrow` section + the season/slug-derived URL + the handle pair. |

PNG export is canvas-driven at a fixed 1080×1350 regardless of preview rendering. The generated `post.html` includes per-slide `[svg]` + `[png 1080×1350]` buttons and a top-of-page `download all 6 slides as PNG` bulk button. The JS pattern (XMLSerializer → Blob → Image → Canvas → toBlob → save) is cloned from the cloud_sync carousel which has been proven in production.

Slide bodies use native SVG `<text>` elements with a `wrapText` helper that breaks lines at character-count boundaries. No `<foreignObject>` — that path is incompatible with reliable canvas export across browsers.

AGENTS.md invariant #2 is reframed from *"the carousel never trims the episode"* to *"the carousel is a teaser for the canonical post; not all episode content fits on six slides, and slide 06's CTA carries readers to the full episode at arcanelabs.info."* The new wording matches what the carousel has actually been since slide 06's CTA was added.

## Consequences

### Positive

- Each slide does visual work the others don't. Readers swipe through deliberately instead of scanning past six identical-looking blocks.
- PNG export becomes one click ("download all 6"). The author's daily Instagram-upload workflow drops from "screenshot each slide carefully" to "click → upload."
- Sizing is correct by construction. The canvas export forces 1080×1350 regardless of how the preview grid renders.
- The carousel and the canonical post stop competing. Carousel = distribution; arcanelabs.info post = full content. Slide 06's CTA is now load-bearing rather than decorative.
- `<foreignObject>` is removed, eliminating a known browser-inconsistency risk on PNG export.
- The visual contract is documented per-slide in this ADR. Future template changes have a reference for what each slide is *for*, not just what string it shows.

### Negative

- `templates.mjs` is materially larger (six per-purpose SVG builders + table/code/prose mental-model rendering + manual line wrapping + downloader JS). The complexity is contained to one file, but it is real.
- Slide 02 pull-quote extraction is heuristic. For episodes where the most quotable moment isn't in the last quoted paragraph, the auto-extracted pull-quote will be suboptimal. The author can manually edit `post.html` after generation (it is the canonical editable source per ADR-0001 in `arcanelabsio/social`), but that breaks the regenerate-and-export flow.
- AGENTS.md invariant #2 is weakened in letter (the carousel does not carry full episode content). It is preserved in spirit: the *episode* is canonical at `arcanelabs.info` and the carousel routes to it. This ADR is the supersession.

### Risks

- **The `wrapText` heuristic breaks lines mid-word for very long URLs or code snippets.** Mitigation: pre-wrap at known break points (`/` in URLs, `.` in package paths) inside the SVG builders; fall back to character-count wrap. URLs that would still break are placed on their own line in the layout (e.g., slide 06 has the episode URL on a dedicated line).
- **Font load timing affects PNG export.** When the canvas renders before JetBrains Mono is loaded from Google Fonts, the PNG falls back to system monospace. The cloud_sync carousel's documented mitigation (reload, wait ~2 seconds, re-export) carries over. For archival-grade assets, the documented path is "open the SVG in Figma, convert text to outlines, re-export."
- **Author wants a different pull-quote than the heuristic picks.** Future enhancement: an optional `social_pull_quote` field in episode frontmatter that the orchestrator prefers when present. Not shipped in this ADR; documented here as the planned next step if the heuristic proves brittle in practice.
- **Mental model rendering with a wide markdown table overflows the slide.** Mitigation: the SVG builder measures the column widths and shrinks the font when the table exceeds the safe width (940 px); for tables wider than that even at the smallest legible font, the orchestrator emits a warning at publish time so the author knows to redesign the mental model (or split the episode).

## Related Decisions

- [ADR-0006](0006-editorial-publishing-hub-separate-from-oss-social.md) — established the editorial repo and the cross-repo template-reference pattern that this ADR's cloud_sync borrow follows.
- [ADR-0007](0007-implicit-staff-perspective-in-notebook-episodes.md) — set the current six-slot slide mapping (slide 05 = the question, slide 06 = take-home). This ADR does not change the slot mapping; it changes the rendering inside each slot.
- `notebook/PUBLISHING.md` — the slide-mapping document is updated in lockstep with this ADR to describe the per-purpose treatments.
- `AGENTS.md` invariant #2 — superseded in part by this ADR. The new wording (carousel-as-teaser) is reflected in `AGENTS.md` directly with a back-reference here.
- `arcanelabsio/social/projects/cloud_sync/.../2026-04-20-drive-scope-launch/post.html` — the reference template whose download UX and per-purpose layout discipline this ADR ports into the notebook carousel pipeline.

# Spacing & rhythm — tessera.arcanelabs.info

Reading-surface spacing is more generous than the terminal-aesthetic sibling. The defaults below give the body type room to breathe without making the page feel sparse.

## Base unit

**4px** spacing base, with **8px** as the rhythm increment. Every spacing value below is a multiple of 4.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

## Reading width and breakout

```css
:root {
  --measure:           680px;  /* canonical reading width — episode body */
  --measure-narrow:    520px;  /* question-block, single-thought callout */
  --measure-wide:      880px;  /* page outer container + mental-model breakout */
  --measure-page:     1080px;  /* home-page max-width (intro + grid)     */
}
```

**Body content** (paragraphs, lists, headings, prev/next nav) sits in `--measure` (680px). 680 is the **upper** end of the 640–720 target band — a deliberate choice for serif body type at 18px, which earns slightly wider measure than sans for equivalent line-length comfort.

**Line length at 680/18px:** ~72 characters per line — squarely inside the typography rule's 65–75-char target.

**The outer page container is `--measure-wide` (880px)**, not `--measure`. This is the *breakout pattern* used by every editorial publication site (Stratechery, the New Yorker, Mailbrew, Substack): the body text stays narrow for reading rhythm, but specific elements — tables, code blocks, large figures, mental-model diagrams — are allowed to extend wider so they don't sidescroll on narrower screens or feel cramped at 680px.

**Which elements break out wider than `--measure`:**

- **Mental-model card** (`.mm-card`): up to `--measure-wide` (880px). Three-column tables and ASCII diagrams need the room.
- **Future:** wide figures, embedded code blocks longer than ~80 chars, comparative two-column layouts.

**Implementation pattern:**

```css
.page {
  max-width: var(--measure-wide);   /* outer container = 880px */
  margin: 0 auto;
}

/* Narrow body content centered inside .page */
.prose > p, .prose > ol, .prose > ul, .section-h,
.meta, .title, .lead, .ep-nav {
  max-width: var(--measure);        /* 680px */
  margin-left: auto;
  margin-right: auto;
}

/* Wide breakout — uses full .page width */
.mm-card {
  max-width: var(--measure-wide);   /* 880px */
  margin-left: auto;
  margin-right: auto;
}

/* Narrow callout */
.question {
  max-width: var(--measure-narrow); /* 520px */
}
```

On screens narrower than `--measure-wide + 2 × --space-6` (≈928px), every element collapses to viewport-width minus padding. On screens narrower than the body measure itself, the body uses full viewport too. The breakout is a *desktop affordance*, not a mobile requirement.

## Vertical rhythm

| Between                                    | Spacing       | Token              |
|--------------------------------------------|---------------|---------------------|
| Body paragraphs (within a section)         | 24px          | `--space-6`         |
| End of a list to next paragraph            | 32px          | `--space-8`         |
| H3 to following body                       | 16px          | `--space-4`         |
| H2 section label to first paragraph        | 24px          | `--space-6`         |
| One H2 section to the next H2 label        | 64px          | `--space-16`        |
| Article title (h1) to lead description     | 24px          | `--space-6`         |
| Lead description to first divider rule     | 48px          | `--space-12`        |
| Major thematic divider (`<hr>`)            | 48px above, 48px below | `--space-12` |
| Question-block to surrounding content      | 48px above, 48px below | `--space-12` |
| Prev/next nav from last paragraph          | 96px          | `--space-24`        |
| Footer from prev/next nav                  | 96px          | `--space-24`        |

The 64px between H2 sections is the rhythm carrier of the whole reader. Tighter and the five sections (Scene → Concept → Mental Model → Question → Tomorrow) blur into one another; looser and the page feels stretched.

## Horizontal spacing

| Use                                                  | Spacing          | Token         |
|------------------------------------------------------|------------------|---------------|
| Body padding on small screens (< 728px)              | 24px each side   | `--space-6`   |
| Card padding (mental-model card, question-block)     | 32px             | `--space-8`   |
| Card padding on mobile (< 480px)                     | 20px             | `--space-5`   |
| Page-edge padding on home/season index               | 32–48px          | `--space-8`–`--space-12` |
| Inline gap between meta strip badges                 | 12px             | `--space-3`   |
| Gap between season cards (grid)                      | 24px             | `--space-6`   |
| Gap between episode rows in a season list            | 16px             | `--space-4`   |
| Prev/next nav gap                                    | 24px (column gap)| `--space-6`   |

## Borders and rules

The *outer chrome* (masthead → body → footer separation) uses **2px solid `--rule`** with a 1px companion `box-shadow` to create visible, readable separation between sections. Internal rules (dividers inside the article) stay hairline.

| Use                                  | Style                                                                |
|--------------------------------------|----------------------------------------------------------------------|
| Masthead bottom rule                 | `2px solid var(--rule)` + `box-shadow: 0 1px 0 var(--rule-soft)`     |
| Footer top rule                      | `2px solid var(--rule)` + `box-shadow: 0 -1px 0 var(--rule-soft)`    |
| Section dividers (`<hr class="thin">`) | `1px solid var(--rule)`                                            |
| Card outlines (mental-model)         | `1px solid var(--rule)`                                              |
| Question-block frame                 | `1px solid var(--rule-soft)` + `3px solid var(--mint)` on `border-left` |
| Episode prev/next cards              | `1px solid var(--rule)`                                              |
| Meta-strip separator dots            | inline `·` glyph in `var(--rule)`                                    |

The 2px outer rules + box-shadow combination is what makes the masthead and footer *visibly separate* from the article body without resorting to background-color shifts. The 1px internal rules and card outlines stay subtle so they don't compete with the type.

`--rule` (#c9c1ad in light mode) is **deliberately darker than a typical hairline** — a 1.7:1 contrast against the cream background, enough to read clearly without being stark. Pure beige `#e6e1d8` (the previous value) was too subtle for the masthead/footer separation; the darker tone solves that without losing the warm beige character.

No double-borders, no rounded corners above **6px** radius. Cards get `border-radius: 4px` for a hint of softness; the question-block gets `border-radius: 6px`. Anything more pronounced reads as terminal-aesthetic (rounded chrome panels), which is the sibling site's territory.

## Mobile breakpoints

The site is mobile-first. Default styles target ≤480px; media queries scale up.

```css
/* mobile (default) — ≤480px */
/* large mobile / small tablet — 481–767px */
@media (min-width: 481px) { ... }

/* tablet — 768–1023px */
@media (min-width: 768px) { ... }

/* desktop — 1024px+ */
@media (min-width: 1024px) { ... }
```

What changes per breakpoint:

| Element                         | Mobile (≤480)         | Tablet (768+)       | Desktop (1024+)      |
|---------------------------------|-----------------------|---------------------|----------------------|
| Page horizontal padding         | 20px each             | 32px each           | 48px each            |
| Body font size                  | 17px                  | 18px                | 18px                 |
| H1 (episode title)              | 36px                  | 44px                | 44px                 |
| H2                              | 28px                  | 32px                | 36px                 |
| Reading width                   | 100% minus padding    | min(680px, 100%)    | 680px                |
| Card padding                    | 20px                  | 32px                | 32px                 |
| Section spacing (H2→H2)         | 48px                  | 64px                | 64px                 |
| Season grid                     | 1 column              | 2 columns           | 2 columns            |
| Prev/next nav layout            | stacked               | side-by-side        | side-by-side         |

Note: 17px body on mobile (not 16) — Source Serif 4 reads slightly lighter than the system serif fallback at the same size; 17 compensates without crossing into "large text" territory that would cramp lines.

## Touch targets

Per the checklist: minimum **44×44px** on touch surfaces.

- Episode rows in season/arc lists: minimum 60px tall (comfortably exceeds the floor).
- Prev/next nav cards: minimum 80px tall on mobile, 96px on desktop.
- Inline links inside body prose: native height (no padding), but the line-height of 1.65 gives 30px vertical hit area in body text — borderline at 18px. For mobile, add 4px vertical padding to links: `padding: 2px 0`. Adds up to ~34px hit area, acceptable for in-prose links where the surrounding text disambiguates the target.

## Scroll behaviour

```css
html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

In-page anchor links (future: arc-section links from a season-index TOC) honour reduced-motion.

No scroll-jacking, no parallax, no scroll-driven animations. The reading surface is calm.

## Print stylesheet

Episodes are printable — the editorial-publication convention. A platform-engineering serial that gets read in the morning earns a print stylesheet for offline reading, note-taking, archival, or sharing in environments where opening a URL isn't an option.

The print stylesheet:

- **Forces black-on-white** for legibility and ink economy (no cream background; no mint/amber accents on paper).
- **Strips on-screen chrome**: navigation links, back-nav, prev/next cards, footer social links, decorative `hr.thin` dividers.
- **Compacts the masthead** to just the publication title in a 10pt single-line above the article.
- **Sets ink-friendly type sizes**: 11pt body, 22pt title, 12pt lead, 10pt section headers.
- **Prints citation URLs** after every external link via `a[href^="http"]::after { content: " (" attr(href) ")"; }`. In-site links (anchor, relative) don't get this treatment.
- **Avoids awkward page breaks** with `break-inside: avoid` on the mental-model card, the question block, and lists; `break-after: avoid` on section headers (keeps them with their following paragraph); `orphans: 3; widows: 3` on body paragraphs.
- **Mental-model card** prints as a plain bordered box (no background tint) — the table data is what matters in print.
- **Question block** prints as a bordered box with a 3pt black left border (preserves the emphasis-callout shape using ink, not color).
- **Footer** compacts to a single-line attribution; social handles + RSS link are hidden in print.

Page margins: 2cm on every side via `@page { margin: 2cm; }`. The page-number and running-header are left to the browser default — no custom paged-media chrome (Chrome and Firefox handle this well by default; trying to override leads to inconsistent results across PDF exporters).

A reader who hits `Cmd+P` on any episode page should get a clean, archival-quality printout without further configuration.

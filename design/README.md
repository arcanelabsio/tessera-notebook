# Design system — tessera.arcanelabs.info

The editorial-imprint design language for The Tessera Notebook. This is a *self-documenting snapshot* of the design system in this site's repo; the canonical source lives in [`arcanelabsio/dispatch/notebook/design/`](https://github.com/arcanelabsio/dispatch/tree/main/notebook/design).

## The visual contract

[`episode-reader.html`](./episode-reader.html) is the **binding visual contract**. Open it in a browser to see the canonical editorial-imprint design. Every rendered episode in `season-*/*.html` embeds the CSS from this file verbatim, so design changes in dispatch propagate here on the next render run.

If you want to know what an episode page looks like — open `episode-reader.html`.

## Files

| File | What it documents |
|---|---|
| [`episode-reader.html`](./episode-reader.html) | The binding visual mockup. The CSS in its `<style>` block is the entire theme; the HTML body is the canonical episode-reader structure. Renders day-01 ("Two regions by Friday") as a representative example. |
| [`typography.md`](./typography.md) | Source Serif 4 (body) + JetBrains Mono (accents). 10-step type scale, leading, letter-spacing, color tokens. Contrast checks for both light + (future) dark modes. |
| [`spacing.md`](./spacing.md) | 4px base spacing scale, 680px body reading measure, 880px breakout for tables/diagrams. Print stylesheet rules. Mobile breakpoints (375 / 768 / 1024). |
| [`components.md`](./components.md) | 14-component inventory: masthead, scene-type badge, episode meta strip, section header, mental-model card, question block, episode prev/next nav, footer, season card, episode row, etc. Each with visual contract, props, mobile-collapse rules. |
| [`wireframes.md`](./wireframes.md) | Five page layouts as ASCII wireframes: home, season index, episode reader, future arc page, future branch-series page. Plus the cross-site "From the Notebook" card spec that arcanelabs.info consumes. |

## Quick design facts

- **Reading-first editorial layout.** Source Serif 4 body, 18px, line-height 1.65, 680px measure. Designed for sustained morning reading.
- **Warm cream paper background** (`#faf7f2`) with deep charcoal ink (`#1a1d22`). 13.5:1 contrast — AAA.
- **JetBrains Mono accents** for masthead chrome, scene-type badges, section labels, and meta strips. The connective tissue back to the sibling site arcanelabs.info.
- **Mental-model breakout.** Body text stays at 680px for serif reading rhythm; tables and diagrams break out to 880px so they don't sidescroll.
- **Question block** gets a 3px mint left-accent + narrower (520px) measure to signal "this is the takeaway." Per ADR-0007, this section carries the Staff-engineer takeaway implicitly — there is no narrator-essay "Staff reflex" section.
- **Visible chrome separation.** 2px solid darker-beige rules (`#c9c1ad`) with 1px `box-shadow` companions separate masthead from body from footer.
- **Printable.** `@media print` strips chrome, forces black-on-white, prints citation URLs after external links, prevents page-break orphans in the mental-model + question blocks.

## Brand handshake with arcanelabs.info

Two sibling sites of the same publisher. Different visual surfaces, same language elements:

|  | arcanelabs.info | tessera.arcanelabs.info |
|---|---|---|
| **Content type** | Portfolio + OSS reference | Daily narrative serial |
| **Background** | Dark `#080b10` (terminal aesthetic) | Cream `#faf7f2` (editorial paper) |
| **Body type** | JetBrains Mono | Source Serif 4 |
| **Accent type** | JetBrains Mono | JetBrains Mono *(shared)* |
| **Accent hues** | `#00f0a0` / `#ffb347` (vibrant) | `#00876a` / `#a05a00` (deep tints) *(same hue family)* |
| **Footer** | Cross-link to tessera.arcanelabs.info | Cross-link to arcanelabs.info |

A reader who knows one immediately recognises the other as the same family, even before reading any words.

## How to propose a design change

The visual contract is ADR-gated. To change the design:

1. Discuss the change in a PR or issue on [`arcanelabsio/dispatch`](https://github.com/arcanelabsio/dispatch).
2. If accepted, an amendment to [ADR-0009](https://github.com/arcanelabsio/dispatch/blob/main/docs/adr/0009-tessera-notebook-as-separate-subdomain-site.md) records the decision.
3. The change lands in `arcanelabsio/dispatch/notebook/design/episode-reader.html` first.
4. The render pipeline regenerates every published episode; the changes appear at `tessera.arcanelabs.info` after the next deploy.

Direct edits to design files *in this repo* will be overwritten on the next sync from dispatch. The canonical source is dispatch; this is the snapshot.

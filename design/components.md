# Component inventory — tessera.arcanelabs.info

Components are framework-agnostic in description (the implementation is Vite + React, but the shape would be identical in Astro or Eleventy). Each entry names the *visual contract* the React app must implement against.

---

## 1. `Masthead`

Site-wide top bar.

```
> THE TESSERA NOTEBOOK · VOL. 1                       home · seasons
───────────────────────────────────────────────────────────────────
```

**Visual:**
- Mono (JetBrains Mono, 600 weight, 14px), uppercase, letter-spacing 0.12em.
- Leading `>` glyph in `--mint`; the title in `--fg`; the volume marker (` · VOL. 1`) in `--muted`.
- Right side: inline nav links `home · seasons` in mono 14px, `--muted` with hover `--mint`.
- Bottom: 1px solid `--rule` separator below.
- Height: 56px on mobile, 64px on tablet+.

**Behaviour:**
- Sticky to top on scroll? **No** — it's a reading site; the masthead scrolls away with the page.
- Volume marker (`VOL. 1`) increments when seasons reach a 4-season milestone (Season 1–4 = Vol. 1; future S5–S8 = Vol. 2). Manually maintained in code; not load-bearing.

---

## 2. `SceneTypeBadge`

`[ FEATURE ]` style inline label, used in meta strips and episode rows.

```
[ FEATURE ]      [ INCIDENT ]      [ SUPPORT ]      [ DECISION ]
```

**Visual:**
- Mono, 600 weight, 14px, letter-spacing 0.10em.
- Color by type:
  - FEATURE: `--mint` text
  - INCIDENT: `--amber` text
  - SUPPORT: `--mint-soft` text
  - DECISION: `--amber-soft` text
- Square brackets are part of the badge content (typography, not images).
- No background fill, no border — typography alone.

**Props:** `sceneType: 'feature' | 'incident' | 'support' | 'decision'`.

**Accessibility:** screen readers read the bracketed text. No `aria-label` override needed.

---

## 3. `EpisodeMetaStrip`

Multi-line mono block above episode titles. Used on episode reader and on the home-page "today" hero.

```
[ FEATURE ]  ·  DAY 01  ·  2026-05-21
concept  The 8 fallacies of distributed computing
```

**Visual:**
- Line 1: SceneTypeBadge + ` · ` + day + ` · ` + date. All mono.
- Line 2: `concept` label (mono, 12px, `--muted`, spaced caps) + concept name (serif 16px, `--fg-muted`).
- 6px vertical gap between rows.
- 24px gap below the strip before the H1.

**Behaviour:**
- On screens < 480px: line 1's three items wrap if needed (badge → newline → day · date).
- Date uses tabular-nums via `font-variant-numeric: tabular-nums`.
- "Today" version (home hero) replaces the date with literal text "Today" in `--mint`.
- **Arc is intentionally not shown here.** It stays in the episode frontmatter (drives season/arc index navigation), but doesn't appear on the episode reader page — the back-nav (`← /season-1`) already implies the section context, and arc-level grouping is the season index's job, not the episode page's.

---

## 4. `SectionHeader`

The mono spaced-caps label that replaces `## H2` in the rendered episode markdown.

```
# SCENE
```

**Visual:**
- Mono, 600 weight, 16px, letter-spacing 0.10em.
- `#` glyph in `--amber`; label text in `--fg`.
- 64px top margin (the section-to-section rhythm carrier from `spacing.md`).
- 24px bottom margin (label → body).

**Behaviour:**
- Renders at the `<h2>` slot in the markdown body. The `Markdown` component's `components.h2` prop overrides h2 to emit this shape.
- Includes an auto-generated `id` for anchor linking (via `rehype-slug`).
- Does NOT include `rehype-autolink-headings` link wrap — the labels are visual chrome, not click targets.

**Markdown source-to-render:**
- `## Scene` → `# SCENE`
- `## The concept it surfaces` → `# THE CONCEPT IT SURFACES`
- `## Mental model` → `# MENTAL MODEL`
- `## One question to journal` → `# ONE QUESTION TO JOURNAL`
- `## Tomorrow` → `# TOMORROW`

Uppercase is applied via CSS `text-transform: uppercase`; the markdown stays sentence-case (so the source still reads as prose).

---

## 5. `Lead`

The italic description line under the H1.

```
The list everyone has heard and almost nobody uses as a checklist.
```

**Visual:**
- Source Serif 4 italic, 400 weight, 22px (18px on mobile).
- `--fg-muted` color (#b1bac4).
- Line-height 1.5.
- Sits 24px below the H1, 48px above the first `<hr>` divider.
- Reading width capped at `--measure` (680px).

**Behaviour:**
- Rendered from the episode frontmatter's `description` field.
- Not part of the markdown body — composed alongside it in the route component.

---

## 6. `MentalModelCard`

The card that wraps the `## Mental model` section content. **Breaks out wider than body** — see the breakout pattern in `spacing.md`.

```
                                                                          ← .page (--measure-wide, 880px)
        ┌──────────────────────────────────────────────────────────┐
        │ Fallacy           │ Naive code           │ Survives prod  │
        │ ─────────────────────────────────────────────────────── │
        │ Network reliable  │ client.call(req)     │ Retry + ...    │
        │ ...                                                       │
        └──────────────────────────────────────────────────────────┘
                                                                          ← body content (--measure, 680px)
```

**Visual:**
- Background `--bg-2` (card surface); border `1px solid --rule`; border-radius 4px.
- **Max-width `--measure-wide` (880px)** — breaks out of the 680px body measure so 3-column tables don't side-scroll on desktop.
- Padding 32px on desktop, 20px on mobile.
- Tables inside:
  - Headers: mono 14px, 600 weight, `--amber`, spaced caps, padding-bottom 12px, border-bottom 1px solid `--rule`.
  - Cells: serif 16px, 400 weight, `--fg`, padding 12px 16px.
  - First column: weight 500 (visual emphasis).
- Code blocks inside (`<pre>`): mono 14px, `--mint-soft`, background `--bg-3`, no extra border (the card itself is the border).
- ASCII art inside `<pre>`: mono 13px, `xml:space="preserve"`, no wrap.

**Behaviour:**
- The component looks for the H2 with text exactly `Mental model` in the rendered tree and wraps the *next sibling* in this card via a remark-react walker — implementation detail, but the contract is: the H2 stays as a section header outside the card; everything *under* the H2 until the next H2 sits inside the card.
- On screens narrower than `--measure-wide + page padding` (≈928px), the card collapses to viewport-width minus padding (the breakout disappears because the viewport itself is the constraint).
- On screens narrower than ~480px (small phones), wide tables reflow to a stacked card view (each row becomes its own block with `<th>` labels) rather than horizontal-scrolling.
- **Print:** prints as a plain bordered box (no background tint), `break-inside: avoid` to keep on one page when possible.

---

## 7. `QuestionBlock`

The callout that wraps the `## One question to journal` section content.

```
┃ Pick one service you own. Walk through all 8
┃ fallacies. For each, write one sentence: "If
┃ this is violated, my service responds by ___."
```

**Visual:**
- Background `--bg-3` (#11161d); 3px solid `--mint` on `border-left`; border-radius 6px.
- Padding 32px on desktop, 24px on mobile.
- Reading width `--measure-narrow` (520px) — narrower than body, signals "single thought" weight.
- Body type: Source Serif 4, 22px (20px on mobile), italic-OFF (the question is direct, not narrative), `--fg`.
- Line-height 1.55.
- 48px above and below.

**Behaviour:**
- Same component-wrap technique as `MentalModelCard` — finds the H2, wraps the next siblings.
- The section label `# ONE QUESTION TO JOURNAL` sits *outside* the block. The block contains only the question.

---

## 8. `EpisodeNav` (prev/next)

Bottom-of-episode pagination.

```
┌────────────────────────┐    ┌────────────────────────┐
│ ← previous             │    │ next →                 │
│ — first episode —      │    │ Day 02                 │
│                        │    │ The first ocean        │
└────────────────────────┘    └────────────────────────┘
```

**Visual:**
- Two cards in a 2-column grid, 24px gap.
- Card: background `--bg-2`, border `1px solid --rule`, border-radius 4px, padding 20px.
- Minimum height 80px (mobile) / 96px (desktop).
- Direction label: mono 13px, `--muted`, spaced caps, letter-spacing 0.08em.
- Day number: mono 14px, 600 weight, `--amber`.
- Episode title: Source Serif 4, 18px, 500 weight, `--fg`.
- Hover: border-color shifts to `--mint`, day number stays amber.
- Disabled state (first/last episode): `--muted` text, no hover, cursor default.

**Behaviour:**
- Left card is the previous episode (or disabled "first episode" placeholder).
- Right card is the next episode (or disabled "latest episode" placeholder).
- On mobile (< 481px): cards stack vertically (prev above next), each full-width.
- Disabled cards are `<span>`, not `<a>`. Active cards are `<a>` with `to={...}` (react-router).

---

## 9. `Footer`

Page footer, every route.

```
───────────────────────────────────────────────────────────────────
Part of arcanelabs.info — a multi-year platform-engineering serial
by arcanelabs.

github · @labs.arcane · rss
```

**Visual:**
- Top: 1px solid `--rule`, 96px above the footer text.
- Top-rule to footer-text gap: 24px.
- Attribution: mono 13px, `--muted`, max-width 480px.
- Links row below: mono 13px, `--muted` with hover `--mint`, separated by ` · `.
- Bottom padding: 48px below the last text line.

**Behaviour:**
- "arcanelabs.info" link in the attribution is the explicit cross-brand handshake (ADR-0009 requirement).
- Future RSS button targets `/feed.xml` (designed; implemented later).

---

## 10. `SeasonCard`

Used in the home-page season grid.

```
┌────────────────────────┐
│ SEASON 1               │
│ Distributed Systems    │
│ Foundations            │
│                        │
│ POC → 10K customers    │
│ ─                      │
│ 1 episode published    │
└────────────────────────┘
```

**Visual:**
- Background `--bg-2`, border `1px solid --rule`, border-radius 4px, padding 24px.
- Season number (`SEASON 1`): mono 13px, 600 weight, `--muted`, spaced caps, letter-spacing 0.10em.
- Title (`Distributed Systems Foundations`): Source Serif 4, 22px, 600 weight, `--mint`, line-height 1.3.
- Scale-tier line (`POC → 10K customers`): mono 12px, `--amber`, letter-spacing 0.04em.
- Thin rule: 1px solid `--rule-soft`, 24px wide, centred horizontally on the card.
- Episode count: mono 12px, `--muted`, italic if "— coming —".
- Hover: border-color → `--mint`, title color stays mint.
- Minimum height 180px.

**Behaviour:**
- Active card (has episodes) is `<a>` → `/<season>`. Coming-soon card is `<div>` (no link).
- 2-column grid on tablet+; 1-column on mobile.

---

## 11. `EpisodeRow`

The list element for season index, arc page, and (future) branch series page.

```
┌──────────────────────────────────────────────────────┐
│ [ FEATURE ] · Day 01                                 │
│ Two regions by Friday                                │
│ The 8 fallacies of distributed computing             │
│ 2026-05-21 · read →                                  │
└──────────────────────────────────────────────────────┘
```

**Visual:**
- Background `--bg-2`, border `1px solid --rule`, border-radius 4px, padding 20px.
- Minimum height 60px (well above the 44px touch-target floor).
- Top row: SceneTypeBadge + ` · ` + `Day NN` (mono 14px, 500, `--fg`).
- Title: Source Serif 4, 22px, 500 weight, `--fg`.
- Concept line: Source Serif 4, 16px italic, `--fg-muted`.
- Bottom row: date (mono 12px, `--muted`, tabular-nums) + ` · ` + CTA (`read →` in mono 12px, `--mint`).
- Hover: border-color → `--mint`, title color → `--mint`.

**State variants:**
- **Published** (date present): full styling as shown, card is `<a>`.
- **Coming soon** (no date): CTA becomes `— coming soon —` in `--muted`, card is `<div>` (not a link), opacity 0.85.
- **Today** (date == today): adds a 3px left border in `--mint` (matches the question-block accent style).

---

## 12. `ArcHeader`

Inline arc heading inside the season index.

```
# ARC 1 · THE PREMISES OF DISTRIBUTED COMPUTING

Reader gains the vocabulary to discuss tradeoffs and the reflex
to design against partial failure.
```

**Visual:**
- Mono label: 14px, 600 weight, `--muted`, spaced caps, letter-spacing 0.10em.
- `#` in `--amber`; arc number (`ARC 1`) in `--mint`; ` · ` separator + arc name in `--muted`.
- Tagline: Source Serif 4 italic, 18px, `--fg-muted`, 12px below the label.
- 48px above the heading; 24px below the tagline before the first EpisodeRow.

**Behaviour:**
- Anchored id for future TOC jump links (`#arc-1`).

---

## 13. `TodayHero` (home-page only)

The card-shaped hero above the intro body on the home route.

```
─── TODAY ───────────────────────────────────────────────

┌───────────────────────────────────────────────────────┐
│  [ FEATURE ]  ·  DAY 01  ·  2026-05-21               │
│                                                       │
│  Two regions by Friday                                │
│                                                       │
│  The list everyone has heard and almost nobody        │
│  uses as a checklist.                                 │
│                                                       │
│                                                       │
│  READ THIS EPISODE →                                  │
└───────────────────────────────────────────────────────┘
```

**Visual:**
- Card: background `--bg-2`, border `1px solid --rule`, border-radius 6px, padding 40px on desktop, 24px on mobile.
- 3px solid `--mint` on the top border (a thicker version of the question-block accent — signals "this is today's").
- Section label `─── TODAY ───`: 16px above the card.
- Title inside the card: Source Serif 4, 44px (32px on mobile), 700 weight, `--mint`.
- Description: Source Serif 4 italic, 22px, `--fg-muted`.
- CTA (`READ THIS EPISODE →`): mono 14px, 600 weight, `--mint`, spaced caps, letter-spacing 0.10em.
- Whole card is a link to `/<season>/<slug>` — hover: border-color all sides shift to `--mint`.

**Behaviour:**
- Sourced from the same `latestNotebookEpisode` getter that powers `/latest.json`.
- If no episodes are published yet, renders a placeholder ("First episode lands soon.") with no CTA.

---

## 14. `FromNotebookCard` *(lives on arcanelabs.info, not on this site)*

The cross-brand handshake card. Implemented on arcanelabs.info; consumes `/latest.json` from `tessera.arcanelabs.info`.

```
─── FROM THE NOTEBOOK ───────────────────────────────────

┌───────────────────────────────────────────────────────┐
│  [ FEATURE ]  ·  Today  ·  Day 01                    │
│                                                       │
│  Two regions by Friday                                │
│                                                       │
│  The list everyone has heard and almost nobody uses   │
│  as a checklist.                                      │
│                                                       │
│  →  Read at tessera.arcanelabs.info                    │
└───────────────────────────────────────────────────────┘

The Tessera Notebook is a daily platform-engineering serial,
published as its own imprint of arcanelabs.
```

**Visual:**
- Inherits arcanelabs.info's terminal aesthetic *for the surrounding chrome* (lh__sep, lh__card-link).
- Card body uses notebook palette for the badge and title (`--mint` title, scene-type accent) so the visitor *previews* the notebook's identity.
- The "Read at tessera.arcanelabs.info" link is the destination CTA.

**Behaviour:**
- Fetches `https://tessera.arcanelabs.info/latest.json` on mount.
- Cache: `Cache-Control: public, max-age=300` on `/latest.json` (5-min cache, refreshed on notebook publish).
- Failure mode: if the fetch errors or times out at 2s, render a generic "→ Visit the Notebook at tessera.arcanelabs.info" card without the episode details.

---

## Component → file map (Vite + React, post-migration)

```
src/components/
├── Masthead.tsx
├── Footer.tsx
├── SceneTypeBadge.tsx
├── EpisodeMetaStrip.tsx
├── Lead.tsx
├── SectionHeader.tsx           (used as components.h2 in Markdown)
├── MentalModelCard.tsx
├── QuestionBlock.tsx
├── EpisodeNav.tsx              (prev/next at episode bottom)
├── SeasonCard.tsx
├── EpisodeRow.tsx
├── ArcHeader.tsx
└── TodayHero.tsx               (home-page only)

src/routes/
├── Home.tsx                    (was: NotebookIndex.tsx on arcanelabs.info)
├── SeasonIndex.tsx             (was: NotebookSeason.tsx)
├── Episode.tsx                 (was: NotebookEpisode.tsx)
├── ArcIndex.tsx                (future)
└── BranchSeries.tsx            (future)
```

The `Markdown` component from arcanelabs.info ports unchanged, but with a different `components.h2` prop (the SectionHeader) and a post-render walker that wraps the Mental model and One question to journal sections in their respective cards.

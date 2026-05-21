---
id: ADR-0009
title: The Tessera Notebook moves to `tessera.arcanelabs.info` as a separate public site with its own editorial-imprint visual identity
status: Accepted
date: 2026-05-21
supersedes:
superseded_by:
---

## Context

The Tessera Notebook is daily narrative editorial content with a stated multi-year cadence ("no finale" per `notebook/README.md`). It currently renders at `arcanelabs.info/notebook/...`, sharing a site with arcanelabs's portfolio, OSS-project pages, and long-form essays.

That co-habitation has worked because there was only one published episode. As the notebook accumulates — fifty, a hundred, several seasons across multiple years — three pressures show up:

1. **Visual idiom mismatch.** The arcanelabs.info site is built on a *terminal aesthetic*: dense reference layouts, JetBrains Mono throughout, terminal-chrome separators, code-doc-coloured palette. That style serves portfolio/OSS content well (where the reader is browsing repos, install commands, schema references). It serves *narrative reading* poorly. A 7-minute daily story wants reading-first typography: a serif body for paragraph rhythm, generous line measure, scene/concept hierarchy framed by typographic weight rather than terminal separators. Trying to make both styles work inside one site means either compromise (the notebook reads as a misshapen reference doc) or branching conditional logic (the home page is terminal, the notebook is editorial, every shared component carries a variant flag). Neither resolves cleanly.

2. **Identity confusion.** Visitors to `arcanelabs.info` see a portfolio site that *also* serves a daily serial. The serial doesn't have a stable identity at that URL — it's a sub-path, not a destination. For a multi-year-cadence serial, the destination matters: readers should be able to land at *one place* that *is* the notebook, not at a sub-section of someone's portfolio.

3. **Independent evolution.** As the notebook earns its own surface area (branch series, an arc navigator, future audio/video versions, RSS, search, an episode-of-the-week recap), each of those features either gets built inside arcanelabs.info — bloating a portfolio site with serial-publication tooling — or as half-built sub-pages whose features don't compose. A site whose mission is *being a daily reading destination* can build all of those cleanly; a portfolio site that also serves notebook content carries them as exceptions.

The single architectural commitment in `AGENTS.md` is *"`arcanelabs.info` is the canonical destination."* That commitment is about *destination*, not *topology* — a subdomain of `arcanelabs.info` (`tessera.arcanelabs.info`) is structurally still part of the canonical destination. The commitment is preserved; only the path changes.

The timing is genuinely load-bearing. With one episode published, URL migration costs are nearly zero (no inbound links, no SEO equity to preserve, no RSS subscribers to inform). With sixty episodes published a year from now, the same split costs a meaningful migration: 301 redirects per episode, RSS-feed compatibility, inbound link audits. *"Do it now or never."*

## Options Considered

### Option A: Keep notebook at `arcanelabs.info/notebook/...`

The current state. Notebook renders inside the portfolio site, sharing visual treatment.

- **Pro:** Zero migration. Recent work (the notebook intro loader at `_intro.md`, `NotebookIndex.tsx`, the markdown-driven page) stays where it is.
- **Pro:** Single deployment surface, single analytics property, single SEO property.
- **Con:** Visual-idiom mismatch persists indefinitely. The notebook either compromises on its own ideal layout, or arcanelabs.info accumulates conditional logic for variant rendering.
- **Con:** No path to making the notebook a *destination* in its own right. It remains a sub-section of a portfolio site, which under-sells what it is.
- **Con:** Every future notebook feature (RSS, season navigator, branch-series page type, episode-of-the-week recap) is built inside arcanelabs.info, accreting serial-publication tooling onto a portfolio site that wasn't designed for it.

### Option B: Move notebook to a fully separate domain (`tessera.io` / `tessera-notebook.com`)

Full brand separation.

- **Pro:** Maximum visual freedom. No constraint from arcanelabs's existing palette or typography.
- **Pro:** SEO operates on a separate property without any inherited noise from arcanelabs.info.
- **Con:** Loses brand consolidation. Visitors who know `arcanelabs.info` have no obvious path to discovering the notebook; visitors who land on tessera.io don't see the broader arcanelabs body of work.
- **Con:** Costs a new domain registration, ongoing renewal, separate trust establishment ("who is tessera?"), separate certificate management.
- **Con:** Implies the notebook is a *product* (with its own brand identity), not an *editorial work by arcanelabs*. The latter is the truth; the former misrepresents the relationship.

### Option C: Move notebook to `tessera.arcanelabs.info` as a separate public site (chosen)

Subdomain split. The notebook lives at `tessera.arcanelabs.info` as a separate GitHub Pages site, public repo `arcanelabsio/tessera-notebook`, with an editorial-imprint visual identity that is recognisably part of the arcanelabs brand family (shared palette base, cross-linking footer, "From the Notebook" callout on `arcanelabs.info`) while having its own layout, typography, and information architecture.

- **Pro:** Visual freedom for an editorial reading layout (serif body, generous measure, typographic hierarchy) without forcing arcanelabs.info to compromise its terminal identity.
- **Pro:** Identity clarity. `tessera.arcanelabs.info` *is* the notebook; landing there means you're at the destination, not in a sub-section.
- **Pro:** Brand consolidation preserved. The subdomain says clearly "part of arcanelabs"; the footer reinforces it; arcanelabs.info gets a "From the Notebook" hero card that routes traffic in.
- **Pro:** Public repo (`arcanelabsio/tessera-notebook`) becomes part of arcanelabs's visible body of work. The site implementation is itself evidence of craft.
- **Pro:** No new domain cost. GitHub Pages supports custom subdomains via CNAME, zero ongoing cost.
- **Pro:** Independent deploy cadence. A change to the notebook reader doesn't touch arcanelabs.info; a change to arcanelabs.info doesn't risk notebook publication.
- **Pro:** Editorial discipline doesn't move. Episodes still live in `dispatch/notebook/days/`; `dispatch/scripts/publish.mjs` retargets its destination from `../arcanelabs.info/content/notebook/...` to `../tessera-notebook/content/...`. The voice-pass gate, ADR-0007 implicit-Staff framing, and ADR-0008 carousel discipline are all enforced in `dispatch` and unaffected by which site renders the output.
- **Con:** New repo to maintain. One more git remote to keep current, one more CI surface (when CI exists), one more dependabot to drown in.
- **Con:** The `_intro.md` loader work just shipped on `arcanelabs.info` becomes migration material — moved to the new repo, leaving a small "From the Notebook" callout in its place.
- **Con:** The single published episode at `arcanelabs.info/notebook/season-1/two-regions-by-friday` becomes a redirect (or deletion + cross-link, since no inbound traffic exists today).

## Decision

**Option C.**

The Tessera Notebook is published at `tessera.arcanelabs.info` via a new public GitHub repo `arcanelabsio/tessera-notebook`. The notebook gains its own *editorial imprint* visual identity — a reading-first layout that shares the arcanelabs palette base (background, accent colours, monospace accent type) while introducing a serif body type and editorial-magazine typographic hierarchy. Cross-links between the two sites are mutual: arcanelabs.info gets a "From the Notebook" card that routes to the subdomain; tessera.arcanelabs.info's footer attributes the work to arcanelabs.info.

The decision beats the alternatives because it gives the notebook *visual freedom under one brand* — the same reason a publisher's literary imprint looks different from its tech imprint while remaining clearly the same publisher.

### What this changes

The migration is one-time and shaped by the fact that almost nothing has accumulated at `arcanelabs.info/notebook` yet.

- **New repo:** `arcanelabsio/tessera-notebook`, public, GitHub Pages enabled, CNAME `tessera.arcanelabs.info`. DNS record `tessera CNAME arcanelabsio.github.io` (or the org's existing GH Pages target).
- **Stack:** Vite + React + react-markdown, matching `arcanelabs.info`'s existing stack. Rationale: the markdown rendering pipeline (`Markdown` component, frontmatter parser, content-loader patterns) is already built and works well — porting it is faster than building from scratch in Astro/11ty, and the React app surfaces (intro page, season nav, episode reader) compose cleanly. If the site outgrows React, a future ADR can record a migration to Astro for static-content gains; we don't pre-optimise for that today.
- **Files that migrate from `arcanelabs.info` to `tessera-notebook`:**
  - `content/notebook/_intro.md` → `content/_intro.md` (now at the site root)
  - `content/notebook/season-1/two-regions-by-friday.md` → `content/season-1/two-regions-by-friday.md`
  - `src/routes/NotebookIndex.tsx` → `src/routes/Home.tsx` (becomes the new site's home page)
  - `src/routes/NotebookSeason.tsx` → `src/routes/SeasonIndex.tsx`
  - `src/routes/NotebookEpisode.tsx` → `src/routes/Episode.tsx`
  - The notebook-specific portions of `src/content/loader.ts` (`NotebookIntro`, `NotebookEpisode`, `NotebookSeasonSummary` parsing + indexes)
  - The notebook-specific portions of `src/content/types.ts`
  - `Markdown` component, `frontmatter` parser, `head` helpers — copied over (cross-repo template-reference pattern from ADR-0006: copy-on-use, not live-imported)
- **Files that change on `arcanelabs.info`:**
  - Notebook routes removed; `getNotebookEpisode`, `getNotebookSeason`, `notebookSeasons`, `latestNotebookEpisode` removed from `loader.ts`
  - `Nav.tsx` notebook link retargeted to `https://tessera.arcanelabs.info`
  - Home page gains a "From the Notebook" hero card linking out to today's episode at the subdomain (the card pulls live from `tessera.arcanelabs.info`'s `/latest.json` endpoint, which is generated at notebook build time)
  - `content/notebook/season-1/two-regions-by-friday.md` deleted (no inbound traffic to preserve); a `_redirects` entry sends `/notebook/*` → `https://tessera.arcanelabs.info/$1` for any hand-typed legacy URLs
- **Files that change in `dispatch`:**
  - `scripts/publish.mjs`: `ARCANELABS_REPO` env var renamed to `TESSERA_SITE_REPO`; default path `../arcanelabs.info` → `../tessera-notebook`; destination path inside the site repo simplified from `content/notebook/<season>/<slug>.md` to `content/<season>/<slug>.md`
  - `notebook/PUBLISHING.md`: orchestrator's downstream-repo reference updated
  - `AGENTS.md` invariant #6 ("arcanelabs.info is the canonical destination") clarified to say "`tessera.arcanelabs.info` is the canonical reading destination for the notebook; `arcanelabs.info` is the canonical destination for arcanelabs at large." Both subdomains are part of one canonical brand.

### Visual brief (binding for the design phase)

The new site is an **editorial imprint** in the literal publishing sense: same publisher (arcanelabs), distinct identity from its other surfaces (portfolio, OSS docs, long-form essays). The constraints below are non-negotiable for the design phase; everything else is open.

**Brand handshake (must preserve):**

- **Background:** warm cream (`#faf7f2` or similar), *light-default*. The notebook is editorial — and editorial reading surfaces are light by genre convention (Stratechery, Substack reading view, the New Yorker, Longform.org are all light-default). Brand consistency with arcanelabs.info lives in the **typography and accent language**, not the background colour. Dark mode is preserved as an optional override via `@media (prefers-color-scheme: dark)` that flips the palette back to arcanelabs.info's dark scheme — night readers and users with system dark mode set get it automatically.
- **Accent palette (translated for light backgrounds):** the arcanelabs.info hues carry over, in deeper tints that meet WCAG AA on the cream — mint becomes a deep teal-green (~`#00876a`), amber becomes a deep burnt-orange (~`#a05a00`). On dark mode the original vibrant tints (`#00f0a0`, `#ffb347`) are restored. Same hue *family*, two tint sets per mode.
- **Monospace accent type:** JetBrains Mono retained for chrome, scene-type badges (`[FEATURE]` / `[INCIDENT]` / `[SUPPORT]` / `[DECISION]`), code snippets, frontmatter/meta lines, the footer attribution. It is the *connective tissue* that makes the site read as the same family regardless of background.
- **Footer attribution:** every page footer reads (or equivalent): *"Part of arcanelabs.info — a multi-year platform-engineering serial by arcanelabs."* Mutual cross-link.
- **Header chrome:** a thin top bar identifying the publication ("The Tessera Notebook · Vol. 1") with subtle terminal-style hint (a single mono accent line, perhaps a `>` prompt glyph) — present but not dominant.

**Editorial idiom (must achieve):**

- **Body type:** a workhorse serif optimised for screen reading. Candidates: *Source Serif 4*, *Charter*, *iA Writer Quattro*, *Tiempos Text*, *EB Garamond*. Loaded via Google Fonts (consistent with the arcanelabs setup). Choose one; don't fall back to system serif.
- **Reading measure:** 640–720 px on desktop, full-width minus generous padding on mobile. The episode body sits in a single column; no side rails, no sticky navs in the reader view.
- **Typographic hierarchy:** the five episode sections (Scene → Concept → Mental Model → Question → Tomorrow) are visually distinct beats. Recommended approach: scene type renders as a small caps section label in mono+amber above each H2; the H2 itself in serif, slightly larger than the body, more weight than colour. The *question* slide-equivalent gets its own visual treatment — possibly a pull-quote-style rule, more whitespace, a different leading.
- **Episode meta:** day number, scene type, arc, concept, date — all rendered in JetBrains Mono in a quiet metadata strip above the title. Reads like a magazine masthead, not like a YAML dump.
- **No scene-type badge inside body content.** The metadata strip carries it; once. Repeating it on every section is the kind of redundancy a reading site doesn't earn.

**Information architecture (must support):**

- **Home:** the intro markdown (already drafted at `dispatch/notebook/intro.md`) renders as the landing page body. Above it: a small "today's episode" hero card. Below: a season-nav strip (Season 1 · Distributed Systems Foundations / Season 2 / Season 3 / Season 4) that shows progress.
- **Season index:** a list of arcs, each arc as a sub-section, each arc lists its episodes in numerical order. Future-proof for branch series (a season can have a "branch series" subsection alongside its arcs).
- **Episode reader:** the canonical content surface. Reader-focused: title, masthead-style meta, the 5-section body in editorial layout, a previous/next slider at the bottom (already wired in `NotebookEpisode.tsx`), an "answer the journal question" hint that links to nothing today but reserves the affordance for a future feature (saved-journal feature, or a discussion thread, or a public-question feature — not committed now).
- **Future-reserved page types (designed but not implemented today):**
  - `/arc/<arc-slug>` — pull a single arc out for focused reading
  - `/concept/<concept-tag>` — a future tag-driven index (idempotency, OAuth, runbooks, etc.)
  - `/branches/<branch-slug>` — the future branch-series surface (The CRD Season, The Identity Season, etc., per `notebook/curriculum.md`)
- **JSON endpoints:** `/latest.json` (today's episode metadata, consumed by arcanelabs.info's "From the Notebook" card), `/feed.xml` (RSS — designed in this phase, implemented as a follow-up).

**Visual mode preferences:**

- **Light mode default** (warm cream + deep charcoal ink), matching editorial-reading genre conventions. Dark mode auto-activates via `@media (prefers-color-scheme: dark)`, reinstating arcanelabs.info's dark palette. No UI toggle in v1 — the system preference is the contract; we'll add a toggle only if usage data shows readers wanting to override system preference.
- **No animation chrome.** Smooth transitions are fine; carousel/scroll-jacking/parallax is forbidden. This is a reading surface.
- **No social-share widgets in the reading view.** A footer share row (`copy link · view on github · @labs.arcane`) is fine; in-line modal nags are not.

**Mobile-first.** A meaningful fraction of daily reading happens on phones over morning coffee, per `PUBLISHING.md`. Designs that work only on desktop are rejected by default.

## Consequences

### Positive

- Visual freedom for the notebook (editorial reading layout) without compromising arcanelabs.info's terminal identity.
- The notebook gains a destination identity. `tessera.arcanelabs.info` *is* the notebook — not a sub-section of a portfolio site.
- Cross-brand handshake (palette + mono accent + footer attribution + mutual cross-links) preserves the "same family" reading without enforcing visual sameness.
- New public repo `arcanelabsio/tessera-notebook` becomes part of arcanelabs's visible body of work.
- Migration cost is essentially zero today (one episode, no SEO equity) and grows quickly with time; doing it now is meaningfully cheaper than doing it later.

### Negative

- One more repo to maintain. Two-site upkeep instead of one — though the editorial discipline (`dispatch`) and the OSS-promotion discipline (`arcanelabsio/social`) are separate concerns anyway, so this isn't a *new* coordination cost.
- Cross-site references in `arcanelabs.info`'s navigation and home page need to be reasoned about by hand; there's no shared component library between the two.
- The `_intro.md` loader work shipped earlier in this session moves to the new repo. ~30 minutes of porting time; no architectural cost.

### Risks

- **Brand fragmentation if the visual handshake weakens.** If a future design iteration on tessera.arcanelabs.info drops the JetBrains Mono accent or the cross-link footer, the family connection erodes. Mitigation: the brand-handshake requirements above are enumerated in this ADR; PR review enforces.
- **`/latest.json` contract drift.** The "From the Notebook" card on arcanelabs.info consumes `tessera.arcanelabs.info/latest.json`. If that schema changes silently, arcanelabs.info's card breaks. Mitigation: schema lives in a shared markdown doc in `dispatch/` (future task: `notebook/contracts/latest-json.schema.md`); both sides validate.
- **DNS/Pages misconfiguration breaking the subdomain.** GitHub Pages custom-subdomain setup occasionally has surprises (HTTPS-cert provisioning delay, CNAME conflicts with apex domain). Mitigation: standard playbook (CNAME file in repo, Pages settings, DNS propagation check); failure modes are documented and self-resolving within ~24h.
- **Editorial discipline drift across two sites.** Voice-pass, ADR-0007 implicit-Staff framing, ADR-0008 carousel discipline are enforced in `dispatch`. Future contributors may assume the new site can edit episode markdown directly — bypassing the voice-pass gate. Mitigation: `tessera-notebook` repo's README will state explicitly: "*Episode content is sourced from `arcanelabsio/dispatch`. Do not hand-edit `content/<season>/<slug>.md` here — those files are regenerated by `dispatch/scripts/publish.mjs`.*"

## Related Decisions

- [ADR-0006](0006-editorial-publishing-hub-separate-from-oss-social.md) — established that editorial work lives in `dispatch`; this ADR extends the topology by giving editorial content its own *rendering* site, separate from arcanelabs.info's portfolio surface.
- [ADR-0007](0007-implicit-staff-perspective-in-notebook-episodes.md) — the implicit-Staff framing discipline. Carries over to the new site unchanged.
- [ADR-0008](0008-carousel-slide-rendering-per-purpose.md) — the per-purpose carousel rendering. Carries over to the new site unchanged (carousels are not part of the notebook site; they live in `arcanelabsio/social`).
- `AGENTS.md` invariant #6 — clarified by this ADR to recognise `tessera.arcanelabs.info` as the notebook's canonical destination, alongside `arcanelabs.info` as the broader brand's canonical destination.
- Future ADR-0010 (anticipated) — would record a stack migration (React → Astro) if the notebook outgrows React's content-site fit. Not committed today.

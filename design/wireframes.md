# Page wireframes — tessera.arcanelabs.info

Five pages, ASCII at desktop width. Mobile layouts collapse to single columns; key collapses are noted under each wireframe.

Common chrome (every page):

```
┌─────────────────────────────────────────────────────────────┐
│   > THE TESSERA NOTEBOOK · VOL. 1            home · seasons │  ← MASTHEAD (mono, spaced caps)
│   ───────────────────────────────────────────────────────── │     ↑ 1px rule var(--rule)
│                                                             │
│   [page content]                                            │
│                                                             │
│   ───────────────────────────────────────────────────────── │     ↑ 1px rule var(--rule)
│   Part of arcanelabs.info — a multi-year                    │  ← FOOTER ATTRIBUTION (mono, muted)
│   platform-engineering serial by arcanelabs.                │
│                                                             │
│   github · @labs.arcane · rss                               │
└─────────────────────────────────────────────────────────────┘
```

Right-side nav links (`home · seasons`) collapse to icons on mobile, with a hamburger-free top bar (the site has only 3 top-level routes, so an inline mono link strip works at every breakpoint).

---

## 1. Home — `/`

```
┌─────────────────────────────────────────────────────────────┐
│ [masthead]                                                  │
│                                                             │
│   ─── TODAY ─────────────────────────────────────────────── │  ← mono section label (amber)
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │  [ FEATURE ]  ·  DAY 01  ·  2026-05-21               │ │  ← episode meta strip (mono)
│   │                                                       │ │
│   │  Two regions by Friday                                │ │  ← serif h1 (mint)
│   │                                                       │ │
│   │  The list everyone has heard and almost nobody        │ │  ← lead (serif italic, fg-muted)
│   │  uses as a checklist.                                 │ │
│   │                                                       │ │
│   │                                                       │ │
│   │  READ THIS EPISODE →                                  │ │  ← mono CTA (mint, hover amber)
│   └───────────────────────────────────────────────────────┘ │
│                                                             │
│   ─── THE NOTEBOOK ──────────────────────────────────────── │
│                                                             │
│   [intro.md body renders here — serif body, ~680px measure] │
│                                                             │
│   A fictional engineering team at a fictional company       │
│   called Tessera — a Bangalore-founded multi-tenant         │
│   developer-infrastructure SaaS...                          │
│                                                             │
│   ─── WHAT YOU'LL READ EACH MORNING ─────────────────────── │  ← H2 from intro.md
│                                                             │
│   Every episode opens with a scene from Tessera's life...   │
│                                                             │
│   [the 3-row scene-type table]                              │
│                                                             │
│   ─── HOW TO READ IT ─────────────────────────────────────  │
│   [...]                                                     │
│                                                             │
│   ─── FOUR SEASONS. NO FINALE. ────────────────────────────  │
│   [seasons table]                                           │
│                                                             │
│   ─── WHO YOU'LL MEET ────────────────────────────────────  │
│   [cast list]                                               │
│                                                             │
│   ─── WHAT THIS IS NOT ───────────────────────────────────  │
│   [...]                                                     │
│                                                             │
│   ─── WHERE TO START ────────────────────────────────────── │
│   [...]                                                     │
│                                                             │
│   ─── BROWSE BY SEASON ─────────────────────────────────── │
│                                                             │
│   ┌────────────────────────┐  ┌────────────────────────┐    │
│   │ SEASON 1               │  │ SEASON 2               │    │  ← season cards (2-col grid)
│   │ Distributed Systems    │  │ Platform Engineering   │    │
│   │ Foundations            │  │ as a Discipline        │    │
│   │                        │  │                        │    │
│   │ POC → 10K customers    │  │ 10K → 1M               │    │
│   │ ─                      │  │ ─                      │    │
│   │ 1 episode published    │  │ — coming —             │    │
│   └────────────────────────┘  └────────────────────────┘    │
│                                                             │
│   ┌────────────────────────┐  ┌────────────────────────┐    │
│   │ SEASON 3               │  │ SEASON 4               │    │
│   │ System Design at       │  │ Identity, Compliance,  │    │
│   │ Staff Bar              │  │ and the Agentic Era    │    │
│   │                        │  │                        │    │
│   │ 1M → 10M               │  │ 10M → 1B               │    │
│   │ ─                      │  │ ─                      │    │
│   │ — coming —             │  │ — coming —             │    │
│   └────────────────────────┘  └────────────────────────┘    │
│                                                             │
│ [footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Loader source:** `_intro.md` (the file shipped in arcanelabs.info this session — moves to the new repo at `content/_intro.md`).

**Mobile collapse:** season grid → 1 column. Episode hero card stays full-width minus padding.

**Why TODAY sits above the intro:** returning daily readers see today's episode immediately. First-time visitors see the same hero card *before* the intro and form a quick mental model (it's a daily thing, with today's episode prominent) before reading what the notebook is.

---

## 2. Season index — `/season-1`

```
┌─────────────────────────────────────────────────────────────┐
│ [masthead]                                                  │
│                                                             │
│   ← /                                                       │  ← back-nav (mono, small)
│                                                             │
│   SEASON 1                                                  │  ← mono section label
│                                                             │
│   Distributed Systems Foundations                           │  ← serif h1 (mint, 36px)
│                                                             │
│   Take a reader who builds correct single-machine code      │  ← lead (serif italic, fg-muted)
│   and give them the mental scaffold for thinking in         │
│   distributed primitives — where every interaction is       │
│   over a network and every component can fail.              │
│                                                             │
│   POC → MVP → 10K customers. Cast forming this season:      │  ← body (fg-muted, smaller serif)
│   Kiran (CTO), Anjali (founding eng), Diego (founding eng → │
│   SRE), Wim (longest-tenured), Rohan (DX, mid-season).      │
│                                                             │
│   ────────────────────────────────────────────              │  ← thin rule
│                                                             │
│   # ARC 1 · THE PREMISES OF DISTRIBUTED COMPUTING           │  ← arc heading (mono spaced caps)
│                                                             │
│   Reader gains the vocabulary to discuss tradeoffs and the  │  ← arc tagline (serif italic, small)
│   reflex to design against partial failure.                 │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ [ FEATURE ] · Day 01                                 │  │  ← episode row
│   │ Two regions by Friday                                │  │
│   │ The 8 fallacies of distributed computing             │  │
│   │ 2026-05-21 · read →                                  │  │
│   └──────────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ [ INCIDENT ] · Day 02                                │  │
│   │ The first ocean                                      │  │
│   │ CAP / PACELC, learned through pain                   │  │
│   │ — coming soon —                                      │  │  ← unread/upcoming variant
│   └──────────────────────────────────────────────────────┘  │
│   [... episodes 3, 4, 5 ...]                                │
│                                                             │
│   # ARC 2 · WHERE DATA LIVES ACROSS MACHINES                │
│                                                             │
│   Reader gains the ability to defend a database topology    │
│   in a design review.                                       │
│                                                             │
│   [... episode rows ...]                                    │
│                                                             │
│   [ARCS 3–6 follow the same shape]                          │
│                                                             │
│ [footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Loader source:** all episodes whose `season: season-1` is set in frontmatter; arcs come from frontmatter `arc:` field; arc tagline from a future `_season.md` file (or hardcoded in the loader's SEASON_LABELS for now).

**Mobile collapse:** episode rows stay full-width. The mono arc heading wraps to two lines if needed.

**Read state:** episodes with `date` in the past show normal styling. Episodes without a `date` (not yet published) show `— coming soon —` in muted, and the row is not a link.

---

## 3. Episode reader — `/season-1/two-regions-by-friday`

```
┌─────────────────────────────────────────────────────────────┐
│ [masthead]                                                  │
│                                                             │
│   ← /season-1                                               │  ← back-nav
│                                                             │
│   ╔══════════════════════════════════════════════════════╗  │
│   ║ [ FEATURE ]  ·  DAY 01  ·  2026-05-21               ║  │  ← episode meta strip
│   ║ concept  The 8 fallacies of distributed computing   ║  │     (mono, left-aligned, no bg)
│   ╚══════════════════════════════════════════════════════╝  │
│                                                             │
│   Two regions by Friday                                     │  ← serif h1 (mint, 44px)
│                                                             │
│   The list everyone has heard and almost nobody uses as     │  ← lead (serif italic, fg-muted, 22px)
│   a checklist.                                              │
│                                                             │
│   ──────────                                                │  ← thin centred rule
│                                                             │
│   # SCENE                                                   │  ← section label (mono, spaced caps)
│                                                             │     amber `#` + label
│   Tessera's eu-west-1 dashboard has been green for          │  ← body (serif, 18px, 1.65 lh)
│   three weeks. Kiran stops by the engineering room a        │
│   little after 11 with the news: Ledgerline Tech signed     │
│   on Tuesday, they're in New York, and they want sub-       │
│   100ms latency from a US-east endpoint by Friday.          │
│                                                             │
│   Diego looks up from his terminal. "Friday this week?"     │
│                                                             │
│   "Friday this week."                                       │
│                                                             │
│   The room goes quiet, the way rooms do when an ambitious   │
│   schedule meets the physics of distributed systems...      │
│                                                             │
│   # THE CONCEPT IT SURFACES                                 │
│                                                             │
│   Peter Deutsch (and later James Gosling) at Sun            │
│   Microsystems in the 90s noticed that engineers building   │
│   distributed systems repeatedly made the same wrong        │
│   assumptions...                                            │
│                                                             │
│   1. The network is reliable. Packets drop. Routes flap.    │  ← ordered list items in body
│   2. Latency is zero. Even in the same datacenter...        │
│   ...                                                       │
│                                                             │
│   The fallacies aren't a theorem. They're a vibe check...   │
│                                                             │
│   # MENTAL MODEL                                            │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ Fallacy        │ Naive code         │ Survives prod  │  │  ← mental model card
│   │ ─────────────────────────────────────────────────── │  │     (bordered, bg-2 fill,
│   │ Network        │ client.call(req)   │ Retry+backoff  │  │      mono+serif mix)
│   │ reliable       │                    │ +idem.key+     │  │
│   │                │                    │ circuit breaker│  │
│   │ ...                                                  │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                             │
│   # ONE QUESTION TO JOURNAL                                 │
│                                                             │
│   ┃ Pick one service you own. Walk through all 8           │  ← question block
│   ┃ fallacies. For each, write one sentence: "If this is   │     (mint left-border 3px,
│   ┃ violated, my service responds by ___." If you can't    │      bg-3 fill, serif 22px,
│   ┃ finish a sentence — that's the gap to close this week. │      narrower measure 520px)
│                                                             │
│   # TOMORROW                                                │
│                                                             │
│   Day 2 — The first ocean. Sunday's postmortem after the   │  ← serif italic 18px, fg
│   Friday push. Retry-without-backoff amplifies a network    │
│   blip 12× across the Atlantic. CAP arrives through pain.   │
│                                                             │
│   ──────────                                                │
│                                                             │
│   ┌────────────────────────┐    ┌────────────────────────┐  │
│   │ ← previous             │    │ next →                 │  │  ← prev/next nav
│   │ — first episode —      │    │ Day 02                 │  │     (mono dir + serif title)
│   │                        │    │ The first ocean        │  │
│   └────────────────────────┘    └────────────────────────┘  │
│                                                             │
│ [footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Loader source:** the episode's markdown body (parsed and rendered by react-markdown). Section labels (`# SCENE`, `# THE CONCEPT IT SURFACES`, etc.) are H2s in the markdown — re-styled at render time to look like mono spaced-caps labels rather than serif headings.

**Mobile collapse:** prev/next nav stacks vertically (prev above next). Mental model card scrolls horizontally only if it must — otherwise the table reflows to a stacked card view (`<thead>` becomes per-row labels). Question block stays full width minus padding.

**Why the question gets a callout treatment:** ADR-0007 made the journal question load-bearing — it's where the Staff-engineer takeaway lands now that the explicit "Staff reflex" section is gone. The visual treatment matches that semantic weight.

---

## 4. Arc page — `/season-1/arcs/the-premises-of-distributed-computing` (future)

```
┌─────────────────────────────────────────────────────────────┐
│ [masthead]                                                  │
│                                                             │
│   ← /season-1                                               │
│                                                             │
│   SEASON 1 · ARC 1                                          │  ← breadcrumb (mono)
│                                                             │
│   The Premises of Distributed Computing                     │  ← serif h1 (mint, 36px)
│                                                             │
│   Reader gains the vocabulary to discuss tradeoffs and      │  ← arc tagline (serif italic)
│   the reflex to design against partial failure.             │
│                                                             │
│   ────────────────────────────────────────────              │
│                                                             │
│   5 episodes in this arc                                    │  ← meta line (mono small)
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ [ FEATURE ] · Day 01                                 │  │  ← same episode-row component
│   │ Two regions by Friday                                │  │     as season index
│   │ The 8 fallacies of distributed computing             │  │
│   │ 2026-05-21 · read →                                  │  │
│   └──────────────────────────────────────────────────────┘  │
│   [... episodes 2–5 ...]                                    │
│                                                             │
│   ────────────────────────────────────────────              │
│                                                             │
│   ┌────────────────────────┐    ┌────────────────────────┐  │
│   │ ← previous arc         │    │ next arc →             │  │
│   │ — first arc —          │    │ Where Data Lives       │  │
│   │                        │    │ Across Machines        │  │
│   └────────────────────────┘    └────────────────────────┘  │
│                                                             │
│ [footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Why this page exists separately from the season index:** the season index is for *finding what to read next*. The arc page is for *reading an arc as a unit* — useful when a reader has time for 4–5 episodes in one sitting (Sunday review, study session, prepping for an interview on the arc's topic).

**Reuses:** the EpisodeRow component, the prev/next nav component (with arc-level data instead of episode-level).

---

## 5. Branch series page — `/branches/the-crd-season` (future)

```
┌─────────────────────────────────────────────────────────────┐
│ [masthead]                                                  │
│                                                             │
│   ← /                                                       │
│                                                             │
│   BRANCH SERIES                                             │  ← mono section label
│                                                             │
│   The CRD Season                                            │  ← serif h1 (mint, 36px)
│                                                             │
│   A focused 12-episode deep dive into operator patterns:    │  ← lead (serif italic)
│   every CRD design choice, error mode, and finalizer       │
│   corner case Tessera has walked through, in one place.     │
│                                                             │
│   ────────────────────────────────────────────              │
│                                                             │
│   # WHY THIS BRANCH EXISTS                                  │  ← H2 (section header)
│                                                             │
│   The main story surfaced CRDs three times before earning   │  ← body
│   this depth. The 80% case (Atlas, Tessera's tenant CRD)   │
│   is one shape. The remaining 20% — finalizer corner cases, │
│   webhook ordering, multi-cluster operators — needs its     │
│   own arc to be done justice without disrupting the main    │
│   thread's daily cadence.                                   │
│                                                             │
│   # THE 12 EPISODES                                         │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 01 · Atlas, the first CRD                            │  │  ← branch-episode rows
│   │     Designing Tessera's TenantNamespace CRD          │  │     (different left ornament
│   │     — coming soon —                                  │  │      than main-thread rows)
│   └──────────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ 02 · Kubebuilder day                                 │  │
│   │     ...                                              │  │
│   └──────────────────────────────────────────────────────┘  │
│   [... 03–12 ...]                                           │
│                                                             │
│   # RELATED MAIN-THREAD EPISODES                            │
│                                                             │
│   →  Season 2 / Arc 2 — Kubernetes as a Control-Loop Engine │  ← cross-refs (mono → + serif)
│   →  Season 2 / Day 32 — When CRDs grow up                  │
│                                                             │
│   ────────────────────────────────────────────              │
│                                                             │
│   ← /                                                       │  ← back to home
│                                                             │
│ [footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Branch episodes are numbered locally to the branch** (01 → 12), not by main-thread day number. This is the visual cue that says "you're inside a branch" — the user reads in branch sequence, not in calendar sequence.

**Cross-references at the bottom** route back to the main thread, so a reader who arrived from a season-index link to "The CRD Season" can step back into the main story at the right episode.

---

## Cross-site: "From the Notebook" card (lives on arcanelabs.info, not here)

```
On arcanelabs.info's home page, in the place where the current
notebook intro lives, a single card replaces the section:

  ─── FROM THE NOTEBOOK ───────────────────────────────────

  ┌───────────────────────────────────────────────────────┐
  │  [ FEATURE ]  ·  Today  ·  Day 01                    │  ← consumed from
  │                                                       │     tessera.arcanelabs.info/latest.json
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

**Schema:** `/latest.json` returns
```json
{
  "title": "Two regions by Friday",
  "episode": 1,
  "season": "season-1",
  "slug": "two-regions-by-friday",
  "scene_type": "feature",
  "date": "2026-05-21",
  "description": "The list everyone has heard and almost nobody uses as a checklist.",
  "url": "https://tessera.arcanelabs.info/season-1/two-regions-by-friday"
}
```

Generated at notebook-site build time from `latestNotebookEpisode` (the same getter the home-page hero uses). The card on `arcanelabs.info` fetches it client-side on mount (fast, cacheable, fails gracefully to a generic "→ Visit the Notebook" link if the fetch errors).

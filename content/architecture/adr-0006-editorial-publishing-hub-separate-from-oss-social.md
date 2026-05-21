---
id: ADR-0006
title: Create a separate `dispatch` repo for editorial content; do not extend `arcanelabsio/social`
status: Accepted
date: 2026-05-21
supersedes:
superseded_by:
---

## Context

Arcane Labs is starting daily publishing of platform-engineering narrative content (*The Tessera Notebook*) on `arcanelabs.info` + Instagram, in addition to the existing slow-cadence long-form essays. Both are editorial content. Both need a home that supports:

- Markdown source for episodes / essays
- HTML carousel sources + JSON manifests + PNG exports for Instagram distribution
- Editorial-discipline tooling (voice-pass enforcement, no-AI-in-essays rule)
- Cross-platform distribution metadata (Instagram, X, LinkedIn handles, hashtag blocks)

The existing `arcanelabsio/social/` repo (ADR-0001 there) already implements a clean layered model — `brand/`, `system/`, `projects/<repo>/<subject>/<campaign>/` — for archiving social campaigns. Its existing campaigns (e.g., `projects/cloud_sync/cloud_sync_drive/2026-04-20-drive-scope-launch/`) all share one shape: they promote a specific OSS library or app, with a clear *source repo* the campaign is *about*.

The Tessera Notebook is fundamentally different content. It is *narrative editorial work* with daily cadence — there is no "source repo it promotes." Forcing it into the existing `projects/<repo>/<subject>/<campaign>/` shape would either require inventing a fake source repo, or stretching the "subject" slot to hold a season of episodes, or both. Either way, the editorial content would pollute a structure built for OSS promotion, and the OSS promotion structure would be diluted by a content type it wasn't designed for.

Separately, the editorial work has its own *source* layer (notebook episodes, essay drafts) that doesn't exist in `social/` at all — `social/` only holds finished distribution artifacts, not source content. The Tessera Notebook is half source-content and half distribution; the existing repo only models the second half.

## Options Considered

### Option A: Extend `arcanelabsio/social/` to host editorial content

- **Pro:** One repo for everything visual/distribution-shaped. Brand assets and templates already live there.
- **Pro:** No new repo to maintain.
- **Con:** Forces editorial *source* (notebook Markdown, essay drafts) into a repo whose layered model has no slot for source content — only campaigns.
- **Con:** Dilutes the OSS-promotion focus of `social/`. The repo's ADR-0001 specifically named "OSS posts route to a real next click: repo, package page, docs page" as a goal. Editorial content has a different routing target (the canonical post on `arcanelabs.info`).
- **Con:** Mixes two content types with different cadences (daily editorial vs. per-release OSS) and different disciplines (voice-pass for notebook, hand-written-only for essays, terminal-docs-v1 carousel for both).
- **Con:** Project boundary becomes blurry — when a new contributor opens the repo, "is this for the cloud_sync library launch or for today's notebook episode?" is a confusing question.

### Option B: Keep editorial content in `~/workspace/career/profile/workbook/`

- **Pro:** Already exists; no migration.
- **Con:** The `career/` workspace is *career-private* (resume, performance reviews, salary history). Mixing public-publishing content with career-private state means the repo can't be made public, and `career/` has to remain a single-purpose private workspace.
- **Con:** No place for distribution artifacts (carousel HTML, exports). They'd have to go in `social/` while the source stayed in `career/`. Two repos, drift risk.
- **Con:** Editorial content lacks first-class governance — no AGENTS.md, no ADRs, no PR template specific to the editorial workflow.

### Option C: Create a new `dispatch` repo, with `notebook/`, `essays/`, and `social/` subfolders (chosen)

- **Pro:** Editorial source and distribution live together (source flows naturally into a carousel campaign without a cross-repo dance).
- **Pro:** The existing `social/` repo's ADR-0001 layered model is *reused* inside `dispatch/social/projects/tessera-notebook/<season>/<campaign>/`, so we inherit the system contracts (post.html canonical, post.json manifest, exports/ derivatives, terminal-docs-v1 template) without duplicating them.
- **Pro:** Clean repo boundary. `arcanelabsio/social/` keeps its OSS-promotion focus. `arcanelabsio/dispatch/` owns editorial content. Both private, both Arcane Labs.
- **Pro:** Repo-template inheritance gives us PROJECT.md, AGENTS.md, SECURITY_MODEL.md, the ADR system, and conventional-commits discipline from day one.
- **Pro:** Future essays and other editorial content (transcripts, talk drafts) have an obvious home — `dispatch/essays/` and future siblings — without further repo proliferation.
- **Con:** Slightly more repo overhead (the `arcanelabsio` org now has `social/` AND `dispatch/` as separate editorial-adjacent repos).
- **Con:** The `terminal-docs-v1` template lives in `social/` and is referenced from `dispatch/` — cross-repo dependency. Mitigated by the template being copy-on-use, not live-imported.

## Decision

**Option C.**

The Tessera Notebook and Arcane Labs long-form essays live in a new private repo `arcanelabsio/dispatch`, scaffolded from `arcanelabsio/repo-template`. Inside dispatch:

- `notebook/` holds Markdown source for daily episodes plus the curriculum, template, and publishing workflow.
- `essays/` holds long-form hand-written posts (initially empty; populated per Track C cadence).
- `social/` holds per-episode/per-essay campaign archives following `arcanelabsio/social/`'s ADR-0001 layered model — `post.html` canonical source, `post.json` manifest, `exports/` derivatives.

The existing `arcanelabsio/social/` repo is unchanged; it continues to own OSS library promotion campaigns. The `terminal-docs-v1` template family is referenced (not copied) from `arcanelabsio/social/system/templates/` — when a notebook campaign needs the template, it's copy-on-use into the campaign's `post.html`, not a live import.

The decision beats the alternatives because it preserves both repos' purposes cleanly: `social/` stays focused on OSS promotion (its existing ADR-0001 model intact), and `dispatch/` gets first-class editorial governance (PROJECT.md, AGENTS.md, ADRs, voice-pass discipline) without polluting either side.

## Consequences

### Positive

- Editorial source + distribution live together; daily publishing workflow has one repo to navigate
- Existing `social/` repo unchanged; its OSS-promotion focus protected
- Editorial discipline (voice-pass for notebook, hand-written-only for essays) gets first-class enforcement via AGENTS.md invariants
- Repo-template inheritance gives the new repo professional governance from commit one
- Future editorial content types (transcripts, talk drafts) have an obvious home
- `career/` workspace stays single-purpose (career-private only)

### Negative

- Two `arcanelabsio` org repos now host editorial-adjacent content (`social/` for OSS, `dispatch/` for editorial)
- Cross-repo dependency on `social/system/templates/terminal-docs-v1/` for the carousel template (mitigated: copy-on-use, not live-imported)
- Existing `career/profile/workbook/` content was migrated into `dispatch/notebook/`; the career path now contains only a pointer

### Risks

- **Template drift.** If `arcanelabsio/social/system/templates/terminal-docs-v1/` evolves and `dispatch/` campaigns don't pull the changes, carousels will look inconsistent. Mitigation: a tracking issue in `dispatch/` when `social/`'s template ADR changes. Opportunistic adoption, not synced.
- **Boundary creep.** Future contributors may try to put OSS-library campaign work in `dispatch/social/projects/`. Mitigation: AGENTS.md explicitly states "Not for OSS library promotion (that lives in `arcanelabsio/social/`)." PR review enforces.
- **Editorial discipline drift.** Voice-pass invariant and hand-written-essay rule are enforced by review, not tooling. Mitigation: AGENTS.md invariants are numbered; SECURITY_MODEL.md threat table includes "AI scaffolding published without voice pass" as a tracked threat.

## Related Decisions

- [ADR-0001 (this repo)](0001-record-architecture-decisions.md) — establishes the ADR practice
- `arcanelabsio/social/`'s ADR-0001 — the layered `brand/`/`system/`/`projects/` model this repo reuses inside `dispatch/social/`
- `~/workspace/career/profile/growth/upskilling-plan.md` Track C — the hand-written essay discipline that this repo's `essays/` folder operationalises

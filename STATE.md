# STATE — tessera-notebook

## Active workstream — Algorithmic art as episode interaction layer

**Phase:** **SHIPPED** — Day 1 (`two-regions-by-friday`) live on `main` via commit `a3fcc97`. Four-agent publish pipeline in place. Next phase: pipeline-driven authoring of subsequent episodes.

**Last verified end-to-end:** episode-orchestrator pipeline run on Day 1 returned `PUBLISHED` with verifier outcome `PASSED` (typecheck, build, HTTP smoke, headless DOM all green; ambient + concept canvases mounted; 4 sliders rendered; zero console errors).

### Architecture decisions

| Decision | Choice | Rationale |
|---|---|---|
| Interaction depth | Ambient default + opt-in concept widgets | Universal coverage with a low ceiling on per-episode authoring cost |
| Stack | `p5.js` lazy-loaded via dynamic `import()` | Authoring velocity beats bundle leanness for sketches; isolation contains the cost |
| Authoring path | Render-side only (no upstream directive) | Avoids cross-repo coordination with `arcanelabsio/dispatch`; opt-in is filesystem-driven |
| Opt-in mechanism | Slug-keyed registry: `src/components/sketches/concepts/<slug>.tsx` exists ⇒ concept widget renders | Zero markdown changes; episode picks itself up automatically when a sketch is added |
| Ambient seed | `scene_type + day + slug-hash` | Deterministic per episode; varies by editorial type (feature/incident/support/decision) |
| Placement | Ambient: above title (band). Concept: after the "Mental model" beat | Ambient sets tone before reading; concept reinforces after the abstract model is introduced |
| Motion policy | `prefers-reduced-motion: reduce` ⇒ static first-frame only | Honour existing site discipline (theme.css, ReadingProgressBar) |
| Visibility gating | `IntersectionObserver` ⇒ `loop()`/`noLoop()` | Don't burn CPU when sketch is offscreen |
| Bundle isolation | Manual chunk `vendor-sketches` | Non-episode routes (Home, Archive, etc.) never download p5 |

### Component shape

```
src/components/sketches/
├── SketchCanvas.tsx          ← p5 mount primitive (dynamic import, RM-aware, IO-gated)
├── ambient.tsx               ← scene-type-driven generative band, applies to every episode
├── registry.ts               ← slug → lazy component map for concept widgets
└── concepts/
    └── two-regions-by-friday.tsx   ← Day 1 widget: drop-prob + latency sliders
```

`EpisodeBody.tsx` is extended to:
1. Accept the `Episode` object (not just `body`) so frontmatter flows down.
2. Render `<AmbientSketch episode={ep} />` once before `EpisodeTOC`.
3. After the `Mental model` section, inject `<ConceptSketch slug={ep.slug} />` if the registry has an entry.

### What this is NOT

- Not an MDX migration. Markdown stays markdown; React composition happens in the section-splitter, not the markdown pipeline.
- Not a directive parser (`:::sketch …`). Render-side only — frontmatter and slug pick the sketches.
- Not load-bearing on the editorial pipeline in `dispatch`. Sketches can be added/removed without re-syncing content.

### Done when

- [x] Architecture recorded
- [x] `p5` added, `vendor-sketches` chunk verified in `vite build` output
- [x] `SketchCanvas` primitive renders, respects RM, gates on visibility
- [x] Ambient sketch renders deterministically (same slug ⇒ same output across reloads)
- [x] Day 1 concept widget interactive (slider drives sim)
- [x] `make typecheck` and `make build` clean
- [x] Dev server smoke-tested: Day 1 shows both; home page renders no sketches

### Verified bundle behaviour (vite build output — p5 v1.11.13)

| Chunk | Size (min) | Size (gz) | When fetched |
|---|---|---|---|
| `index` (app shell + ambient + registry refs) | 46.14 kB | 16.19 kB | Every route |
| `vendor-react` | 163.07 kB | 53.13 kB | Every route |
| `vendor-markdown` | 172.74 kB | 53.44 kB | Routes that render markdown |
| `vendor-yaml` | 97.04 kB | 30.27 kB | Episode loader |
| **`vendor-sketches` (p5)** | **1,065.63 kB** | **267.97 kB** | **First episode visit only** |
| `two-regions-by-friday` (Day 1 concept) | 3.90 kB | 1.73 kB | Day 1 only |

Note: the v2 → v1 downgrade only saved ~52kB gz (16%), not the ~50% I'd estimated. p5's core (rendering, math, color, shape, dom) dominates regardless of version. If 268kB gz per first-episode visit feels too heavy *after* you see the prototype, the realistic next lever is replacing p5 with hand-rolled canvas primitives (~5kB), not chasing a smaller p5.

### Notes from the build / runtime

- p5 v1's Friendly Error System (FES) tries to fetch the calling script's source over the network to produce nicer dev-time errors. Under Vite this fails noisily (modules served as HMR transforms, not standalone scripts). `SketchCanvas` disables FES once at module load — production behaviour is unchanged.
- Two canvases on one page (ambient + concept) requires p5 *instance mode*. Global mode would have them clobber each other on `window`.

## Publish pipeline — four agents in `.claude/agents/`

| Agent | Model | Tools | Role |
|---|---|---|---|
| `episode-orchestrator` | sonnet | Read, Glob, Grep, Bash, Agent | Coordinator. 6 phases: pre-flight → editor → sketch-author → verifier → stage+commit+push → final report. |
| `episode-editor` | opus | All tools | Presentation editor. Produces a structured brief (5 sections incl. `CONCEPT WIDGET BRIEF` block). May edit frontmatter + non-prose structural defects; never prose. |
| `episode-sketch-author` | opus | Read, Glob, Grep, Edit, Write, Bash | Implements the editor's brief into a TSX widget under `src/components/sketches/concepts/<slug>.tsx`; registers via one-line addition to `registry.ts`. |
| `episode-verifier` | sonnet | Read, Glob, Grep, Bash, Edit, Write | Runtime smoke: typecheck → build → HTTP smoke → headless DOM via Claude Preview MCP. Returns PASSED / PASSED-WITH-CAVEATS / FAILED. |

Pipeline contract is the CONCEPT WIDGET BRIEF block (Slug, Thesis, Metaphor, Controls 1–4, Readout 1–3, Aspect, Caption) — the editor produces it, the orchestrator passes it verbatim, the sketch-author implements mechanically.

Commit + push safeguards encoded in orchestrator prompt: only pipeline-touched files staged (no `-A`), conventional commits format, **no `Co-Authored-By: Claude`** (per global CLAUDE.md), no force push, no `--amend` after pre-commit hook failure, push only if verifier ≠ FAILED.

## Open follow-ups

1. **Author follow-up: Day 1's §"The concept it surfaces" runs 958 words** (envelope: 400–600; ceiling: 700). The fibre-floor calculation + AWS latency table + "Most engineers can recite…" commentary together push past the 7-min density brand. Editor flagged on the last run; author resolves. Suggested split point: the "Most engineers can recite…" paragraph as a future-episode aside.
2. **More concept widgets.** The architecture is proven against Day 1. The next high-leverage candidates are episodes whose concept is intrinsically visual (queues, retry storms, consistent hashing, gossip topologies).
3. **Reading-progress hookup.** Currently the ambient sketch ignores `useReadingProgress`. Could bind particle behaviour to the beat the reader is on — e.g., particles converge as the reader hits "Mental model", scatter on "Tomorrow". Adds genuine interactivity to the ambient layer.
4. **Reduced-motion polish.** Currently the sketch suspends after one frame. Could instead render a deterministic "still-life" composition computed analytically (no draw loop) for a sharper static reading.
5. **Mental model table — row-by-row scroll reveal.** Editor flagged as a non-sketch enhancement opportunity. Requires CSS + a small IntersectionObserver hook; not yet implemented.
6. **Agent registry refresh.** Newly-authored agents (`episode-orchestrator`, `episode-editor`, `episode-sketch-author`, `episode-verifier`) are not visible to the `Agent` dispatcher until the session is restarted. After `/clear` or restart, `Agent({ subagent_type: 'episode-orchestrator', … })` will dispatch the real agent.

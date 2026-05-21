# STATE — tessera-notebook

## Active workstream — Algorithmic art as episode interaction layer

**Phase:** prototype against Day 1 (`two-regions-by-friday`) to validate the architecture before generalising.

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

### Open follow-ups

1. **Bundle decision.** 320kb gz is real for first-episode visit. Three options worth weighing:
   - Keep p5 v2 (authoring velocity wins)
   - Downgrade to `p5@1.11.x` (~half the size; same API for our use)
   - Replace with hand-rolled canvas primitives (~5kb; loses p5's vector/noise/color helpers)
2. **More concept widgets.** The architecture is proven against Day 1. The next high-leverage candidates are likely episodes whose concept is intrinsically visual (queues, retry storms, consistent hashing, gossip topologies).
3. **Reading-progress hookup.** Currently the ambient sketch ignores `useReadingProgress`. Could bind particle behaviour to the beat the reader is on — e.g., particles converge as the reader hits "Mental model", scatter on "Tomorrow". Adds genuine interactivity to the ambient layer.
4. **Reduced-motion polish.** Currently the sketch suspends after one frame. Could instead render a deterministic "still-life" composition computed analytically (no draw loop) for a sharper static reading.

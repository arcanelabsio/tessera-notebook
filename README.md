# The Tessera Notebook — published site

[**tessera.arcanelabs.info**](https://tessera.arcanelabs.info)

A daily platform-engineering serial. Fictional team, real concepts. Seven minutes each morning.

This is the **published site repo** — a public GitHub Pages site that serves the rendered HTML for [The Tessera Notebook](https://tessera.arcanelabs.info). The editorial source (episode markdown, the publish discipline) lives elsewhere.

## What this is, technically

A **Vite + React Single Page Application** with **client-side routing** (react-router) and **markdown-driven content**. Built artifacts deploy to GitHub Pages at the repo root via a CNAME → `tessera.arcanelabs.info`.

## What's in this repo

```
tessera-notebook/
├── index.html              ← Vite app entry
├── src/                    ← React + TypeScript source
│   ├── main.tsx            ← entry point + BrowserRouter
│   ├── App.tsx             ← route table
│   ├── routes/             ← Home, SeasonIndex, Episode, DocsIndex, Doc, NotFound
│   ├── components/         ← Masthead, EpisodeBody, MentalModelCard, etc.
│   ├── content/            ← markdown loader + types + frontmatter parser
│   ├── state/              ← ReadingProgress context + usePersisted hook
│   └── styles/             ← theme.css (from design contract) + app.css
├── content/                ← markdown source — synced from arcanelabsio/dispatch
│   ├── _intro.md           ← home-page intro
│   ├── episodes/<season>/<slug>.md
│   └── architecture/<adr>.md
├── public/                 ← static assets copied verbatim to dist/
│   ├── CNAME               ← tessera.arcanelabs.info
│   ├── .nojekyll           ← don't process via Jekyll
│   └── 404.html            ← GH Pages SPA-fallback for deep URLs
├── design/                 ← visual contract (snapshot from dispatch)
├── dist/                   ← build output — git-ignored; deployed to GH Pages
├── package.json            ← deps: react, react-router, react-markdown, …
├── vite.config.ts          ← build config + manual chunk splitting
├── tsconfig*.json          ← typescript config
└── Makefile                ← convenience targets (see below)
```

## Don't hand-edit the content

Files in `content/` are **synced from** [`arcanelabsio/dispatch`](https://github.com/arcanelabsio/dispatch) via the [`tessera-publisher`](https://github.com/arcanelabsio/dispatch/blob/main/.claude/agents/tessera-publisher.md) agent + `scripts/sync-to-tessera.mjs`. Hand-edits in this repo's `content/` will be overwritten on the next sync.

Source-of-truth lives at:

- `dispatch/notebook/intro.md` → `content/_intro.md`
- `dispatch/notebook/days/day-NN.md` → `content/episodes/<season>/<slug>.md`
- `dispatch/docs/adr/NNNN-*.md` → `content/architecture/adr-NNNN-*.md` (curated subset)

App code (`src/`, `vite.config.ts`, etc.) is owned **here** — that's site implementation, not editorial content, and it changes through normal PRs on this repo.

## Local dev

```bash
make install            # one-time
make dev                # http://localhost:5173 — hot reload
make build              # build dist/
make preview            # serve dist/ at http://localhost:5173 for verification
make typecheck          # tsc -b --noEmit
make sync               # pull content from sibling dispatch repo
make publish            # sync + build (does not push — humans push)
make help               # all targets
```

## First-time deployment

A single make target sets everything up: commits the working tree, creates the public GH repo, pushes, and switches GitHub Pages to use the `.github/workflows/deploy.yml` workflow.

```bash
make deploy-init        # requires gh CLI authenticated to arcanelabsio org
```

What you do *after* `deploy-init`:

1. Add a DNS CNAME record at your DNS provider for `arcanelabs.info`:
   - **Type**: `CNAME`
   - **Name**: `tessera`
   - **Value**: `arcanelabsio.github.io.`
2. Wait ~5–30 minutes for DNS propagation.
3. Visit `https://tessera.arcanelabs.info/`.

After the first deploy, every push to `main` triggers the workflow and redeploys.

## How routing works on GitHub Pages

This is an SPA: client-side routes like `/season-1/two-regions-by-friday` exist only in the React router, not on the filesystem. When a reader refreshes a deep URL, GitHub Pages returns 404 (because there's no real file at that path).

The standard SPA-fallback trick handles this:

1. `public/404.html` (deployed as `404.html` at the site root) catches GH's 404, encodes the URL as a query string, and bounces back to `/`.
2. `index.html` has a tiny inline script (top of `<head>`) that decodes the query string and rewrites the URL back to the real path *before* React boots.
3. The React router picks up the path normally and renders the right route.

Result: deep-link refreshes work transparently.

## State management

Client-side state is minimal and persisted to `localStorage`:

- **Reading progress** — set of episode URLs the reader has opened. Surfaced as a `✓` indicator on already-read rows in season indexes, and as a `N of M read` line on home-page season cards. See `src/state/ReadingProgress.tsx`.
- **Last visited** — surfaced as the home-page "Continue reading" affordance via `src/components/ResumeCard.tsx`; dismissible per-episode.

Keyboard shortcuts (`?` opens the help dialog): `/` search, `J` / `→` next, `K` / `←` previous, `S` save/unsave, `G` home.

Catalog navigation:

- `/archive` — flat chronological list of every published episode.
- `/concepts` — episodes grouped by their `concept` frontmatter value.
- `/saved` — episodes the reader has starred (localStorage only; no account / sync).

Theme honors **`prefers-color-scheme`** — light is the default, dark is rendered automatically for readers whose OS prefers dark. Both palettes live in `src/styles/theme.css` and stay in sync through semantic color tokens.

No Redux/Zustand — `React.Context` + a `usePersisted` hook is enough until the state model grows non-trivially.

## How the publish flow works

```
                       ┌──────────────────────────────────────────┐
                       │  arcanelabsio/dispatch (editorial repo)  │
                       │                                          │
                       │   notebook/days/day-NN.md                │
                       │   ├ voice_pass: ✓ (hand-edited)          │
                       │   └ scripts/sync-to-tessera.mjs          │
                       │                                          │
                       └────────────────────┬─────────────────────┘
                                            │ markdown sync
                                            ▼
                       ┌──────────────────────────────────────────┐
                       │  arcanelabsio/tessera-notebook (here)    │
                       │                                          │
                       │   content/episodes/<season>/<slug>.md    │
                       │   └ npm run build  →  dist/              │
                       │                                          │
                       └────────────────────┬─────────────────────┘
                                            │ git push
                                            ▼
                       ┌──────────────────────────────────────────┐
                       │  GitHub Pages → tessera.arcanelabs.info  │
                       └──────────────────────────────────────────┘
```

## Design system

See [`design/`](./design/) for the editorial-imprint system that defines this site's visual language. Highlights:

- **Reading-first editorial layout** — Source Serif 4 body at 18px, JetBrains Mono accents, warm-cream paper background.
- **Brand handshake with [arcanelabs.info](https://arcanelabs.info)** — shared accent hue family, shared mono accent type, mutual cross-link footer.
- **Mental-model breakout** — body text at 680px reading measure, tables/diagrams break out to 880px so they don't sidescroll.
- **Printable** — every episode prints cleanly via `Cmd+P` with citation URLs after external links.

The canonical visual contract is [`design/episode-reader.html`](./design/episode-reader.html). Every rendered episode embeds the CSS from that file verbatim, so design changes propagate automatically on the next render.

## Why a separate repo from arcanelabs.info?

[ADR-0009 in dispatch](https://github.com/arcanelabsio/dispatch/blob/main/docs/adr/0009-tessera-notebook-as-separate-subdomain-site.md) records the architectural decision. Short version: the notebook is daily narrative editorial content; `arcanelabs.info` is portfolio + OSS reference content. The two surfaces want different visual idioms (editorial-imprint vs terminal-aesthetic). Splitting them gives each its own destination identity while preserving the family connection via shared typography and cross-links.

## License

Episode content: see [`arcanelabsio/dispatch`](https://github.com/arcanelabsio/dispatch).
Site implementation (HTML + CSS + JS at the repo root + `design/`): MIT.

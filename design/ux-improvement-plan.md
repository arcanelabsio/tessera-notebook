# UX Improvement Plan — Tessera Notebook

**Date:** 2026-05-21
**Scope:** Vite + React SPA serving daily editorial episodes at `tessera.arcanelabs.info`.
**Reader model:** senior engineers reading 7-minute episodes daily, on mixed devices, with varying ambient light. High reading literacy. Low tolerance for chrome.

---

## 1. Stance — what "modern" means here

This is an **editorial reading site**, closer to *Stratechery* / *Increment* / *The Browser* than a SaaS dashboard. The modern editorial move in the 2020s has been **restraint**: removing chrome, sharpening type, adding quiet affordances that respect reading flow. Tessera already commits to this — de-boxed cards, generous measure, intentional type system, real print stylesheet.

**Therefore "modern UX constructs" here means**:

- **Yes**: dark mode, reading-progress scroll indicator, resume-reading, keyboard shortcuts, view transitions, anchor-share, sticky beat indicator, copy-link affordance, self-hosted variable fonts.
- **No** (would betray the editorial soul): bottom tab bar, modal subscribe walls, glassmorphism / brutalism / claymorphism, AI chat widgets, scroll-triggered popovers, animated marketing heroes, skeleton screens for static markdown, gamified read streaks, social-style reaction widgets.

The bar: *would this affordance survive a redesign of The Atlantic's reading view?* If no, it doesn't belong.

---

## 2. What's already excellent (do not regress)

| Aspect | Where | Why it works |
|---|---|---|
| De-boxed cards | `today-card`, `season-card`, `ep-row` in `src/styles/app.css` | Top-rule + breathing room reads as editorial list, not UI |
| Reading-measure system | `--measure 720` / `--measure-wide 960` / `--measure-narrow 560` in `theme.css:52-54` | Wide tables don't sidescroll; body stays at serif rhythm |
| Type pairing | Source Serif 4 + JetBrains Mono, `theme.css:57-58` | Strong editorial identity; mono accents are diegetic to engineering |
| Print stylesheet | `theme.css:604-769` | Citation URLs after external links, page-break protection on cards |
| Reading progress | `src/state/ReadingProgress.tsx` | Already persisted, ✓ already on read rows |
| Reduced-motion respect | `theme.css:83-85` | scroll-behavior gated correctly |
| Mobile-first font scale | `theme.css:92-104` | 18 → 19 → 20px progression keeps base readable |

**Discipline to keep:** no Tailwind, no design-system framework, no CSS-in-JS. Plain CSS with semantic tokens. This is correct for content-first surface.

---

## 3. Issues by severity

### P0 — CRITICAL (ship in the next pass)

#### 3.1 Dark mode is designed but not wired up
**Where:** `index.html:6` (`color-scheme: light only`), `theme.css:68-77` (palette commented out).
**Why it matters:** daily readers consume at low ambient light (6am, late evening). Forcing light is a real friction and contradicts the "respect the reader" stance the rest of the design takes.
**Fix:** uncomment the dark palette block; change `meta name="color-scheme"` to `light dark`; verify all components against the dark palette; double-check `--mint` and `--amber` contrast on `--bg: #080b10`. Hold a separate review pass on tables (`.mm-card`) and the question block (`.question`) in dark — those are the surfaces most likely to need per-mode tuning.

#### 3.2 No skip-link to main content
**Where:** `src/App.tsx` (no skip anchor before `<Masthead />`).
**Why it matters:** WCAG 2.4.1. Keyboard users must tab through the masthead nav on every page.
**Fix:** add `<a class="skip-link" href="#main">Skip to content</a>` immediately inside `App`, visually hidden until focused; add `id="main"` to `<main className="page">` in each route. ~20 lines of CSS.

#### 3.3 Home page has no `<h1>`
**Where:** `src/routes/Home.tsx` uses `<h2 class="home-section">` only.
**Why it matters:** breaks heading hierarchy (skips h1 → h2). Screen-reader landmark scan misses the page's primary heading.
**Fix:** either promote the greeting to a visually styled `<h1>`, or add a visually-hidden `<h1>The Tessera Notebook</h1>` at the top of `Home`. Episode + SeasonIndex already have h1s — Home is the outlier.

#### 3.4 Muted text contrast borderline
**Where:** `--muted: #6c7480` on `--bg: #faf7f2` (`theme.css:12`). Used in masthead nav, footer, captions, read-time, ep-row date.
**Why it matters:** measured ~4.2:1 contrast. Below WCAG AA (4.5:1) for normal text. The mono-uppercase tracking compresses character shapes further, making it feel dimmer than the number suggests.
**Fix:** darken to `#5b6470` or `#525a66`. Re-test in dark mode (`--muted` is `#7d8590` there — currently passes against `#080b10`, but worth verifying after palette adjustments).

#### 3.5 Tap targets under 44px on chrome links
**Where:** masthead nav links, footer links, `.back-nav` (`padding: var(--space-1) 0` = 4px vertical).
**Why it matters:** WCAG 2.5.5; Apple HIG 44pt minimum.
**Fix:** add `padding: var(--space-3) var(--space-2)` on masthead/footer/back-nav links; use negative margin on parent to keep visual layout intact. Hit area expands without visible chrome.

---

### P1 — HIGH (the "modern reading site" affordances)

#### 3.6 Reading-progress scroll indicator
**What:** thin mint bar across the top of the viewport, filling as the reader scrolls through an episode body. The de-facto modern reading construct (Medium, Stratechery, NYT longform).
**Why it fits Tessera:** episodes are 7-minute pieces with 5 beats — a quiet progress indicator answers "how much is left?" without breaking reading flow.
**Implementation:**
- New component `EpisodeProgress.tsx`, mounted only on `/season/:slug`.
- Uses `IntersectionObserver` on `.prose > div` section wrappers OR a `scroll` listener throttled to `requestAnimationFrame` measuring `scrollTop / (scrollHeight - innerHeight)`.
- 2px fixed bar at `top: 0`, `var(--mint)`, `transform: scaleX(progress)`, `transform-origin: left`.
- Disable when `prefers-reduced-motion: reduce` (snap to discrete states) or hide entirely.

#### 3.7 Resume-reading slot
**What:** Home shows a quiet "Continue reading: Day 03 — *The first ocean*" affordance when `lastVisited` is set and ≠ `latestEpisode`.
**Where:** `src/state/ReadingProgress.tsx` already tracks `lastVisited`. Currently unused.
**Why it fits:** wired-up-but-unsurfaced features are technical debt. This pays back the investment that's already made.
**Implementation:**
- In `Home.tsx`, after `<TodayHero />`, conditionally render a `<ResumeCard />` if `lastVisited && lastVisited !== latestEpisode.url`.
- Single line of mono text + small serif title, styled like the `back-nav` (no card chrome). Editorial restraint.
- Dismissible (×) — store `dismissedAt` in localStorage so it doesn't reappear forever after the reader catches up.

#### 3.8 Keyboard shortcuts for episode navigation
**What:** `J` / `K` or `←` / `→` to jump to prev/next episode. `G` then `H` to home (Vim/Gmail/HN convention). `?` to open a small shortcuts overlay.
**Why it fits:** the audience is senior engineers. Many use HN/Gmail/Vim daily. Shortcuts are a quiet power-affordance that costs zero visual real estate.
**Implementation:**
- New hook `useKeyboardShortcuts.ts`.
- Listen on `document.keydown`; respect `e.target` being an input/textarea (skip).
- Episode route binds `J`/`←` → `prev.url`, `K`/`→` → `next.url`.
- Global binds `G H` → `/`, `?` → toggle shortcuts dialog.
- Shortcuts dialog: native `<dialog>` element with editorial typography. Lists the 4-5 bindings. ESC to close.

#### 3.9 Self-host variable fonts
**Where:** `index.html:8-9` blocks on Google Fonts CDN.
**Why it matters:** ~150-200KB of font weights, blocking on Google's DNS + edge. For an editorial site whose first impression is the type, this is the largest perf miss.
**Fix:**
- Download Source Serif 4 (variable, italic + roman) and JetBrains Mono (variable) `.woff2` files.
- Place in `public/fonts/`.
- Add `@font-face` rules to `theme.css` with `font-display: swap` and `unicode-range` subsets for Latin + Latin-ext.
- Preload critical weights in `index.html` (`<link rel="preload" as="font" type="font/woff2" crossorigin>`).
- Remove the Google Fonts link.
- License check: Source Serif 4 is SIL OFL ✓; JetBrains Mono is Apache 2.0 ✓ — both bundle-safe.

#### 3.10 Sticky beat indicator on long episodes
**What:** as the reader scrolls into a new section (Scene / Concept / Mental model / Question / Tomorrow), a small mono label appears in the top-right or fades into the masthead, showing the current section name. Disappears at section boundaries via fade.
**Why it fits:** the 5-beat template *is* the structure of the reading. A quiet "you are in: THE CONCEPT IT SURFACES" pin makes the structure legible without a heavy TOC.
**Implementation:**
- `IntersectionObserver` on each `.section-h`, with `rootMargin: '-20% 0px -70% 0px'` so the "current" section is the one near the top of the viewport.
- Render the current heading text in a `position: sticky` mono label inside the masthead, right side, opacity 0 → 1 once scrolled past the title.
- Reduced-motion: skip the fade, just swap text.

---

### P2 — MEDIUM (depth — once P0+P1 ships)

#### 3.11 In-episode mini-TOC at the top
**What:** between the lead and the first section, a small mono link strip: `SCENE · CONCEPT · MENTAL MODEL · QUESTION · TOMORROW` — each anchored to the section. Reads as a beat map; doubles as a TOC.
**Why it fits:** `rehype-slug` already adds IDs (`#scene`, `#mental-model`). Surfacing them adds nothing visually noisy but gives reference readers a way back.
**Implementation:** new sub-component in `EpisodeBody.tsx` rendered above the section loop. List the 5 known section names; render only the ones that exist in `sections`.

#### 3.12 Copy-link affordance on H2 anchors
**What:** hovering an H2 reveals a tiny `#` link (the standard GitHub-style anchor). Click copies the URL with hash to clipboard, shows a brief inline confirmation.
**Why it fits:** the audience cites concepts. Anchor URLs are how engineers share specific paragraphs. `rehype-autolink-headings` already wraps headings in `<a href="#slug">` (behavior: 'wrap') — needs a small visual + clipboard handler.
**Implementation:** override the `section-h` wrapping anchor to render a `#` icon that's `opacity: 0` until parent `:hover`, with a click handler that calls `navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#' + id)` and pulses a "copied" tooltip.

#### 3.13 View Transitions API for episode-to-episode nav
**What:** when the reader clicks `Next →` at the end of an episode, the title cross-fades and the body slides; the masthead stays put. Uses the native View Transitions API in Chromium / Safari 18+; falls back gracefully to instant.
**Why it fits:** episodes are a sequence; spatial continuity helps the reader feel they're walking through the same notebook.
**Implementation:**
- Wrap navigation in `document.startViewTransition(() => navigate(url))` when available.
- Add `view-transition-name: episode-title` on `.title` so the title is the shared element.
- One feature-detect; no polyfill.
- Reduced-motion: skip the wrapper entirely.

#### 3.14 Read-count on season cards
**What:** on Home, season cards currently say "1 episode published". Add a quiet secondary line: "0 of 1 read" (or `1 of 1 read ✓` when caught up).
**Why it fits:** reading progress already tracked; surfacing it on the season card converts the silent state into a gentle goal-affordance without nagging.
**Implementation:** `SeasonCard.tsx` accepts `readCount` from `useReadingProgress()`; render below the published-count line in `--muted`.

#### 3.15 Multi-line code block styling
**Where:** `.prose code` styles inline code only; `<pre>` blocks are unstyled.
**Why it matters:** no episode uses fenced code blocks yet, but the curriculum (distributed systems, Kubernetes, OAuth flows) will. Without styling, the first multi-line code block will render as raw browser default and break the editorial surface.
**Fix:** add `.prose pre` and `.prose pre code` rules to `theme.css` — same bg as `.bg-3`, generous padding, horizontal scroll for overflow, the same mono-soft mint accent for keywords (if highlighting is ever added). Hold off on syntax highlighting; the editorial style would prefer no highlighter to a colorful one.

#### 3.16 RSS link in masthead
**Where:** RSS is in the footer only (`Footer.tsx:13`).
**Why it matters:** the most engaged readers will be RSS subscribers. A small RSS icon in the masthead converts them faster than a footer link.
**Fix:** add a tiny RSS glyph (use the standard orange-rect SVG, or just `[RSS]` in mono) next to "seasons" in the masthead nav. Keep it monochrome to match the editorial palette.

---

### P3 — FUTURE (built ahead of the catalog gate)

The original recommendation was to defer these until catalog growth forced them. They were built anyway in the same pass — the maintainer asked for completion, so the infrastructure is in place even though most surfaces will land on empty states until episode count grows. **At catalog size 1, expect every route below to look sparse**; the design assumes catalog growth.

| Originally gated on | Construct | Status |
|---|---|---|
| Catalog > 20 episodes | Flat chronological archive `/archive` | **Built.** `src/routes/Archive.tsx`. Reuses `EpisodeRow`, sorted by date desc with episode-number tiebreak. |
| Catalog > 30 episodes | Client-side search | **Built.** Dependency-free linear scan in `src/lib/search.ts` (weighted: title 10× / concept 5× / description 3× / body 1×). Opens via `/` key or the masthead search button. Native `<dialog>` overlay with arrow-key navigation. Promote to MiniSearch only if relevance complaints arrive past ~500 episodes. |
| Cross-season concept reference | Concept index `/concepts` | **Built.** `groupEpisodesByConcept()` in loader; renders the same `arc-block` chrome as the season index. |
| Reader requests it | Save-for-later star + `/saved` view | **Built.** `savedUrls` (ordered array, most-recent-first) added to `ReadingProgress`. Star button below the read-time on episode pages; `s` keyboard shortcut. |
| Multi-author | Per-author pages | **Skipped** — single author. Re-evaluate when contributor model changes. |

---

## 4. Modern constructs explicitly rejected (with reasoning)

| Construct | Why rejected |
|---|---|
| Bottom tab bar (mobile) | Not an app; would cost reading real estate. The audience scrolls long-form. |
| Modal subscribe wall | "Subscribe to keep reading" is anti-editorial. RSS + the daily cadence are the subscription model. |
| Floating "subscribe" CTA | Same — friction without payoff. |
| Glassmorphism / claymorphism / brutalism | Betrays the editorial-imprint visual contract. |
| Bento grid for home | Not a portfolio; not a marketing site. The list-of-pieces idiom is correct. |
| Animated hero | This isn't a landing page; it's a daily reading destination. |
| Skeleton screens / shimmer | Content is bundled markdown — synchronous. No async to mask. |
| AI chat widget | Diegetic to a notebook? No. Off-brand. |
| Reaction emojis / claps / hearts | Editorial restraint says no. RSS engagement is the metric. |
| Read-streak gamification | Cheapens the daily ritual. The cadence is the ritual. |
| Cookie banner | No cookies set beyond localStorage. No banner needed. |
| Newsletter form | RSS covers this; the cadence is daily so email lists add no signal. |

---

## 5. Recommended phasing

**Phase A — A11y + perf foundation (1 sitting):**
- 3.1 dark mode wire-up
- 3.2 skip-link
- 3.3 Home h1
- 3.4 muted contrast bump
- 3.5 tap-target enlargement
- 3.9 self-host fonts

**Phase B — Core reading affordances (1 sitting):**
- 3.6 reading-progress scroll indicator
- 3.7 resume-reading slot
- 3.8 keyboard shortcuts
- 3.10 sticky beat indicator

**Phase C — Depth (1 sitting):**
- 3.11 in-episode mini-TOC
- 3.12 anchor copy-link
- 3.13 view transitions
- 3.14 read-count on season cards
- 3.15 multi-line code styling
- 3.16 RSS in masthead

**Phase D — Defer until catalog growth forces them:**
- All P3 items.

Each phase is reviewable as one PR and has no blocking dependency on the next phase.

---

## 6. Risk register

| Risk | Mitigation |
|---|---|
| Dark mode wire-up reveals contrast bugs not caught in the commented palette | Phase A includes explicit dark-mode review pass on all surfaces (tables, question block, mental-model card) |
| Self-hosting fonts changes FOIT/FOUT behavior | Use `font-display: swap`; preload critical weights; verify on Slow 3G throttle |
| Keyboard shortcuts collide with browser shortcuts | Bind only J/K/G/?/← /→ — none of these conflict with platform shortcuts; never override Cmd/Ctrl combinations |
| Reading-progress bar feels like a UI widget in editorial context | 2px, mint, no track — single line, no chrome. Visible only on episode routes. |
| View Transitions create disorientation on older browsers | Feature-detect; no polyfill; reduced-motion bypass |
| Resume-reading card nags returning users | Dismissible; suppress when `lastVisited === latestEpisode.url` (already caught up) |

---

## 7. What this plan deliberately omits

- **Component library / design system docs.** The CSS is already token-driven and the components are small enough that a heavy design system would be over-engineering.
- **Storybook.** Same — single contributor surface, no preview-driven workflow required.
- **Testing strategy.** Out of scope for a UX plan; if added, it's component-level (testing-library) for the new interaction hooks.
- **Analytics.** Editorial restraint — no third-party scripts. The site is small enough that GitHub Pages access logs + RSS-reader stats are sufficient.
- **Newsletter.** RSS is the subscription model. Adding email is a separate editorial decision, not a UX one.

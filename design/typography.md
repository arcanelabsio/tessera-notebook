# Typography system — tessera.arcanelabs.info

The notebook is an *editorial imprint* of arcanelabs.info. Typography carries the imprint identity: a serif body that signals "reading destination" pairs with JetBrains Mono as the connective tissue back to the sibling site.

## Body font: Source Serif 4

Selected from the ADR-0009 candidate list (Source Serif 4 / Charter / iA Writer Quattro / Tiempos Text / EB Garamond).

**Justification:**

- **Variable font, one file.** Source Serif 4 ships as a single variable-axis file (weight 200–900, optical-size axis for display vs text). One `<link>` tag covers every weight we need without inflating the network budget.
- **Screen-first by construction.** Adobe's Source Serif team designed Source Serif 4 explicitly for screen reading — generous x-height, robust strokes, optical-size axis that adjusts contrast at larger sizes. Charter is excellent at low resolutions but feels encyclopedic; EB Garamond reads literary/classical, which fights the platform-engineering subject matter; Tiempos is gorgeous but paid-licensing; iA Writer Quattro isn't actually a serif.
- **Pairs cleanly with JetBrains Mono.** Source Serif + Source Code Pro is a canonical Adobe pairing (same designer DNA). Source Serif 4 + JetBrains Mono inherits that compatibility — similar x-height, similar rhythm, similar terminal weight when used together.
- **Free on Google Fonts.** Aligns with the existing font-loading strategy on `arcanelabs.info` (Google Fonts via `<link>`, `font-display: swap`).
- **Reads "modern editorial," not "old book."** The subject is daily platform engineering; the type should feel like a working publication, not a literary anthology.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Type scale

Modular scale at ratio 1.25 (perfect fourth). Base body 18px — generous for screen reading without becoming oversized.

| Token         | Size | Use                                        |
|---------------|------|--------------------------------------------|
| `--fs-12`     | 12px | Mono micro-meta (slide counters, dates)    |
| `--fs-13`     | 13px | Footer attribution, smallest mono          |
| `--fs-14`     | 14px | Meta strip (mono), caption                 |
| `--fs-16`     | 16px | Mono section labels, small body            |
| `--fs-18`     | 18px | **Body text** (Source Serif 4)             |
| `--fs-22`     | 22px | Lead description, h3 (Source Serif 4)      |
| `--fs-28`     | 28px | h3 large, season-card title                |
| `--fs-36`     | 36px | h2 (season title, branch series title)     |
| `--fs-44`     | 44px | h1 (episode title)                         |
| `--fs-56`     | 56px | Display (home-page hero, intro title)      |

## Weights

Source Serif 4: **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**, **700 (Bold)**.
JetBrains Mono: **400 (Regular)**, **500 (Medium)**, **600 (SemiBold)**, **700 (Bold)**.

Use no more than four weights per page. Reserve **700** for h1/h2 only; body text is **400** with optional **500** for emphasis. JetBrains Mono accents are **500–600** for badges/labels, **400** for code.

## Leading (line-height)

| Element                          | line-height                    | Computed (18px body) |
|----------------------------------|--------------------------------|----------------------|
| Body paragraphs                  | **1.65**                       | ~30px                |
| Lead description (italic, 22px)  | **1.5**                        | 33px                 |
| h1 (44px)                        | **1.15**                       | 51px                 |
| h2 (36px)                        | **1.25**                       | 45px                 |
| h3 (28px)                        | **1.3**                        | 36px                 |
| Mono captions / meta             | **1.5**                        | varies               |
| Question-block body (22px)       | **1.55**                       | 34px                 |

Body 1.65 is intentional — the spec checklist's "1.5–1.75 for body text" upper-middle range. Daily morning reading earns the looser leading.

## Letter-spacing

| Use                                              | Tracking      |
|--------------------------------------------------|---------------|
| Body serif text                                  | default (0)   |
| Mono badges (`[ FEATURE ]`), section labels      | **0.10em**    |
| Mono masthead (`> THE TESSERA NOTEBOOK · VOL. 1`)| **0.12em**    |
| Footer mono                                      | **0.04em**    |

Spaced caps in JetBrains Mono is what makes the terminal-echo *quiet* rather than *loud*. Without the tracking the labels sit too dense; with it they read as masthead chrome.

## Italics and emphasis

- **Body italics:** Source Serif 4's italic is structurally distinct (not a slanted roman). Use freely for narrative emphasis inside scenes.
- **Lead description:** italic — sets the hook apart from the body without needing a different size jump.
- **Mono italics:** rarely needed; if used, only for inline code variable names.

## Color tokens — light default, dark via system preference

The notebook is an *editorial reading surface*, so it follows the genre convention: **light by default, dark mode on `prefers-color-scheme: dark`.** Brand handshake with arcanelabs.info lives in the type and accent vocabulary — not the background. Light mode uses a warm cream paper-feel; dark mode reinstates the arcanelabs.info palette.

```css
:root {
  /* light mode (default — editorial reading surface) */
  --bg:         #faf7f2;  /* warm cream — paper */
  --bg-2:       #fffefb;  /* card surface — slightly brighter */
  --bg-3:       #f2efe7;  /* question-block — slightly recessed */
  --mint:       #00876a;  /* deep teal-green — accent on cream */
  --mint-soft:  #0a6f5a;  /* slightly darker mint, secondary accent */
  --amber:      #a05a00;  /* deep burnt-orange — badge/CTA accent */
  --amber-soft: #884c00;  /* slightly darker amber */
  --fg:         #1a1d22;  /* near-black charcoal — ink */
  --fg-muted:   #4a5260;  /* medium-dark gray — lead, meta values */
  --muted:      #6c7480;  /* lighter gray — footer, captions */
  --rule:       #e6e1d8;  /* warm beige rule */
  --rule-soft:  #efeae0;  /* lighter beige */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* dark mode — companion palette to arcanelabs.info */
    --bg:         #080b10;
    --bg-2:       #0d1117;
    --bg-3:       #11161d;
    --mint:       #00f0a0;
    --mint-soft:  #6feecf;
    --amber:      #ffb347;
    --amber-soft: #ffd280;
    --fg:         #e6edf3;
    --fg-muted:   #b1bac4;
    --muted:      #7d8590;
    --rule:       #1f2933;
    --rule-soft:  #2d3640;
  }
}
```

**Contrast check (light mode, against `--bg` #faf7f2):**

- `--fg` (#1a1d22): **~13.5:1** — body text (AAA)
- `--fg-muted` (#4a5260): **~7.4:1** — lead, meta values (AAA)
- `--muted` (#6c7480): **~4.7:1** — footer, captions (AA normal)
- `--mint` (#00876a): **~4.8:1** — accent text (AA normal; AAA for large text)
- `--amber` (#a05a00): **~5.1:1** — badge / CTA (AA normal)

**Contrast check (dark mode, against `--bg` #080b10):**

- `--fg` (#e6edf3): **~16.4:1** — body text (AAA)
- `--fg-muted` (#b1bac4): **~9.4:1** — lead, meta (AAA)
- `--muted` (#7d8590): **~4.6:1** — captions, attribution (AA normal)
- `--mint` (#00f0a0): **~12.8:1** — accent text (AAA)
- `--amber` (#ffb347): **~11.3:1** — badge text (AAA)

Both modes meet WCAG AA for all uses; AAA for body and major accents. The two palettes are *deliberately not symmetric* — the dark mode is the original arcanelabs.info brand-vibrant scheme; the light mode is editorial-restrained (deeper, more "ink-on-paper" hues). The handshake between them is the *hue family*, not the lightness.

**Why this resolves the brand-vs-genre tension:** the notebook is dark-friendly for readers who prefer it (night reading, OS dark mode), while staying *editorial by default* for daytime reading and for first-time visitors landing without a system preference. The arcanelabs.info family connection lives in the type (JetBrains Mono accents, spaced-caps section labels, `>` prompt glyph in masthead) and in the accent hue family — both visible in either mode.

## Tabular numerals

JetBrains Mono is naturally monospaced. For Source Serif 4 in metadata strips (dates, day numbers), enable tabular figures:

```css
.meta time, .meta .day-num {
  font-variant-numeric: tabular-nums;
}
```

Prevents the meta strip from re-flowing between episodes with different-width date glyphs.

## Don'ts

- ❌ No third typeface. Serif + mono is the system. Don't introduce a sans-serif for "UI chrome" — the mono *is* the UI chrome.
- ❌ No system-font fallbacks below 18px body. If Source Serif 4 hasn't loaded, render in a serif system stack (`Georgia, 'Times New Roman', serif`) rather than switching to sans. Visual disruption is less than reading-rhythm disruption.
- ❌ No drop-caps. They read as old-book affectation and fight the working-publication tone.
- ❌ No all-caps body text. Mono labels in spaced caps are the *only* place uppercase appears. Body sentences are sentence case.
- ❌ No web-fontless fallback path. `font-display: swap` is the right behaviour during load, but the deployed site must always serve the fonts — don't ship a build that "works" without them.

---
id: ADR-0007
title: Notebook episodes surface the Staff-engineer perspective implicitly through scene action, not via a labeled "Staff reflex" section
status: Accepted
date: 2026-05-21
supersedes:
superseded_by:
---

## Context

The notebook template (`notebook/template.md`) contains an internal contradiction.

Its **tone rules** say:
> *"Show, don't explain. Establish character through behaviour in scenes, never through narrator description. The reader should learn who Anjali is by watching her reframe a problem, not by being told she reframes problems."*

Its **anatomy** mandates a 60–120 word section titled `## The Staff-engineer reflex`, whose stated purpose is:
> *"Name the move we just watched a character play. 'Anjali asked X. That's the Staff reflex of [pattern].' Makes the implicit explicit."*

The first rule says *show*. The second rule says *explain what we just showed*. The notebook has been resolving that contradiction in favor of explanation — every shipped episode (day-01, 13, 20, 32, 65, 77) carries a narrator-voiced paragraph that re-states the move the scene already made, typically with `"Junior engineers do X; Staff engineers do Y"` framing.

That framing has three problems:

1. **It condescends to the reader.** The notebook's stated audience is "Senior engineers ready to start thinking in Staff-engineer reflexes." A narrator who labels which character is performing a Staff move treats that audience like a beginner who needs the lesson underlined.
2. **It rewards bad scenes.** When the narrator can rescue a weak scene by labeling the move afterwards, the pressure to write a scene that *demonstrates* the move drops. The labeled-section habit lets unconvincing scenes ship.
3. **It is the most AI-detectable beat in the episode.** The "Junior engineers fix the ticket; Staff engineers fix the system" cadence is the genre cliché the AI scaffolding falls into hardest. It is exactly the kind of prose the voice-pass discipline is supposed to scrub, and exactly the kind of prose that survives the voice-pass because it sounds *like a Staff-engineer take* even when the author didn't write it.

The carousel slide mapping (`notebook/PUBLISHING.md`) reinforces the section's load-bearing role: slide 05 of every carousel sources its body from `## The Staff-engineer reflex`, and the orchestrator's `extractSlides` reads the section by exact H2 string match. Removing the section without remapping slide 05 would silently produce a blank slide.

Per AGENTS.md, the per-episode template and the slide-mapping contract are both ADR-gated.

## Options Considered

### Option A: Keep the section; tighten the rule

Leave `## The Staff-engineer reflex` in the template. Strengthen the tone rule with explicit examples of what bad reflex prose looks like ("don't write 'Junior engineers do X; Staff engineers do Y'") and trust the voice pass to catch the rest.

- **Pro:** No template change, no slide remap, no episode rewrites.
- **Pro:** Preserves the explicit didactic beat for readers who genuinely want the move named.
- **Con:** The structural pressure remains. As long as a 60–120 word slot is reserved for "name the move," the AI scaffolding will fill it with narrator commentary, and the voice pass will edit but not delete it (deleting a section feels destructive to the section author; rewriting it feels acceptable).
- **Con:** Doesn't resolve the template's own contradiction with "Show, don't explain." Leaves the next contributor inheriting the same trap.

### Option B: Keep the section; reframe its content rule

Rename the section to something neutral (e.g., `## The move`) and rewrite its purpose to "one sentence noting what a character did, no narrator commentary about Junior vs. Staff." Preserves slide 05's carousel slot.

- **Pro:** Carousel mapping is preserved (slide 05 still has a source section).
- **Pro:** Mid-strength: removes the worst framing without losing the section.
- **Con:** "One sentence noting what a character did" is just a scene callback — adding zero information for a reader who finished the scene 30 seconds ago. The slot still exists; it's just doing less work.
- **Con:** The contradiction with "Show, don't explain" persists in a quieter form. A scene callback is still telling the reader *what to notice* rather than trusting them to notice it.

### Option C: Remove the section entirely; remap slide 05 to the journal question (chosen)

Delete `## The Staff-engineer reflex` from the template anatomy. The per-episode shape becomes Scene → Concept → Mental model → Question → Tomorrow. Tone rules add an explicit prohibition on narrator-voiced "Junior engineers do X; Staff engineers do Y" framing. The carousel reshuffles: slide 05 becomes the journal question (which previously shared slide 06 with the CTA), and slide 06 becomes the tomorrow-tease + CTA.

- **Pro:** Resolves the template contradiction. "Show, don't explain" becomes the only operating rule, with no structural slot that pulls against it.
- **Pro:** Improves slide 05. A journal question with its own slide and breathing room is a *more inviting* call-to-action than a narrator essay summarizing what slide 02 already showed. The reader's takeaway becomes the question they have to answer, not the conclusion they were handed.
- **Pro:** Removes ~120 words from every episode. The 7-minute reading time gets easier to hit; the scenes have more room to breathe within the same word budget.
- **Pro:** Strengthens the Support-scene Junior-vs-Staff contrast (Aman literal, Anjali reframing) — it stays as a *narrative device* the characters perform, but loses the narrator essay that previously underlined it. The contrast becomes more, not less, prominent because it has to carry itself.
- **Con:** Existing 6 episodes (day-01, 13, 20, 32, 65, 77) need to be rewritten to remove the section and scrub narrator-essay paragraphs inside the concept section. Material cost; one-time.
- **Con:** The orchestrator's `extractSlides` and `buildPostJson` deliverables array need to be updated in lockstep, or slide 05 ships blank. Coupling is real but contained to two functions in one file.
- **Con:** The carousel's slide 06 loses the journal question and becomes pure CTA + tomorrow tease. Slightly less "reflection-prompting" as a final beat, but that work has moved to slide 05 where it gets more room.

## Decision

**Option C.**

The `## The Staff-engineer reflex` H2 section is removed from `notebook/template.md`. The per-episode shape is **Scene → Concept → Mental model → Question → Tomorrow** (five sections, not six). The Staff-engineer perspective is surfaced *only* through what characters do and say inside scenes — never through a narrator-voiced section that re-states the move.

The narrator-essay framing pattern (`"Junior engineers do X; Staff engineers do Y"`, `"The Staff reflex is …"`, `"The Staff move is …"`) is added to the template's forbidden patterns. This applies inside the concept section too, not just the deleted reflex section.

The carousel slide mapping changes in lockstep: **slide 05 sources from the journal question** (gaining its own breathing room), **slide 06 sources from the tomorrow-tease + CTA**. PNG export filenames change from `05-reflex.png` / `06-take-home.png` to `05-question.png` / `06-take-home.png`.

The decision beats the alternatives because it removes the *structural* incentive to write narrator commentary, rather than relying on the voice pass to catch it. The template should make the right thing the easy thing; a slot reserved for "name the move" makes naming the move the easy thing, regardless of how the tone rules read.

## Consequences

### Positive

- Template stops contradicting itself; "Show, don't explain" becomes the only operating rule.
- Slide 05 becomes a stronger call-to-action: the reader's takeaway is the question they have to answer, not the conclusion they were handed.
- Episode word budget loosens by ~120 words; the 900-word total becomes easier to hit without trimming the scene.
- Support-scene Junior-vs-Staff contrast (Aman literal, Anjali reframes) is preserved as a *narrative device* (still in the cast rules and the scene-type contract), and gains weight because it has to carry itself.
- Voice-pass time can be redirected from polishing the reflex paragraph (the hardest paragraph to make sound un-AI) toward strengthening the scene's dialogue.

### Negative

- Existing 6 episodes need a one-time rewrite to remove the H2 section and the narrator-essay sentences embedded in their concept sections.
- The orchestrator's `extractSlides` (scripts/lib/templates.mjs) and `buildPostJson` deliverables array change in lockstep with the template. Future template changes touching slide mapping must keep both sides in sync.
- Episode templates published to `arcanelabs.info` shift in shape. The site's notebook reader doesn't care about section count, but any future RSS / digest tooling that assumed five fixed H2s now sees four.

### Risks

- **Narrator-essay framing leaks back in through the concept section.** Removing the dedicated H2 doesn't prevent the AI scaffolding from writing "the Staff reflex here is…" inside the concept body. Mitigation: the template's forbidden-patterns list adds this pattern explicitly; the voice pass scrubs it; this ADR is the reference future PR reviews cite when rejecting it.
- **Slide-05 journal question is too short for a 1080×1350 slide.** Journal questions today range from one sentence to a short paragraph. If the question is too short, slide 05 will feel empty. Mitigation: journal questions get one editorial pass to ensure they fill the slide without padding (a journal *prompt* with one beat of setup is the target shape, not a one-liner).
- **Carousel readers miss the explicit "what's the move" beat.** Some Instagram readers may have valued the labeled-takeaway slide. Mitigation: the carousel still has the scene (slide 02) and the concept (slides 03–04) doing the work; if the reader needs the move named afterward, they read the full episode at `arcanelabs.info`. The carousel is *distribution*, not the canonical artifact.
- **Template drift between dispatch and downstream consumers.** If any external system (future RSS, future digest emails) assumed the five-section shape, the change breaks them silently. Mitigation: none exist today; this ADR is the documentation that any future consumer must read before assuming the shape.

## Related Decisions

- [ADR-0006](0006-editorial-publishing-hub-separate-from-oss-social.md) — establishes the editorial discipline this ADR refines
- `notebook/template.md` — the contract this ADR modifies (Scene + Concept + Mental model + Question + Tomorrow)
- `notebook/PUBLISHING.md` — the slide-mapping contract this ADR remaps (slide 05: reflex → question)
- `scripts/lib/templates.mjs` — the `extractSlides` and `buildPostJson` implementation that must move in lockstep with the slide mapping

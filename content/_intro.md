---
title: The Tessera Notebook
description: A daily platform-engineering story. One episode a day, roughly seven minutes. Read every morning; watch how senior engineers actually think.
greeting: The Tessera Notebook — a daily platform-engineering story.
---

# The Tessera Notebook

A fictional engineering team at a fictional company called **Tessera** — a Bangalore-founded multi-tenant developer-infrastructure SaaS — and we watch them grow. POC. MVP. Ten thousand customers. A million. Ten million. A billion. Each rung of that ladder breaks something the previous rung relied on, and the team has to design the next thing.

That's the whole conceit. The platform-engineering canon — distributed systems, Kubernetes as a control-loop engine, system design at Staff bar, enterprise identity, the agentic stack — is not a textbook here. It's the territory the team walks across as the scale forces it to.

## What you'll read each morning

Every episode opens with a scene from Tessera's life, and the scene surfaces a concept. The scene comes first because in working engineering teams the concept arrives when the team needs it, not when a curriculum says it's time.

Three scene types alternate by feel:

| Type | What you watch | Example |
|---|---|---|
| **Feature** | Tessera is shipping something and has to answer a design question first | *Day 1 — Two regions by Friday*: the eight fallacies of distributed computing land on the whiteboard before the architecture diagram does |
| **Incident** | Something broke at this tier of scale and the war room is open | *Two leaders, briefly*: leases and fencing tokens save the next incident |
| **Support** | A customer reported something and the team has to decide what class of bug it actually is | *Day 13 — The duplicate charge*: refund the ticket, or fix the contract that produced it |

A fourth shape — **Decision** rooms — covers internal design reviews with no shipping urgency: the team picks the data store, defends the queue choice, writes the ADR that gets cited three years later.

Each episode is a 7-minute read with the same five beats: a scene (200–350 words), the concept it surfaces (400–600 words), one mental model you keep, one question to journal, and a one-line tease for tomorrow. Density is the brand.

## How to read it

| When | Time | What |
|---|---|---|
| **Morning, with coffee** | 10 min | Today's episode |
| **Mid-day, between meetings** | 2 min | Glance at the mental model again |
| **Evening, before logging off** | 3 min | Answer the journal question against a real system you own |
| **Sunday** | 15 min | Re-read the week's episodes; notice which ones changed how you'd argue in a design review |

Skipping a day is normal. Skipping two in a row is the failure mode the cadence is designed to prevent.

The journal question is where the takeaway lives. The episodes don't conclude with a tidy lesson; they hand you a question that only makes sense if you answer it about a service you actually maintain. That's the reading practice — and it compounds.

## Four seasons. No finale.

| Season | Scale tier | The mental scaffold it builds |
|---|---|---|
| **Season 1** · Distributed Systems Foundations | POC → 10K customers | Every interaction is over a network, and every component can fail. By the end of Season 1 you reflexively ask: *what does this do when the network blips for 800ms?* |
| **Season 2** · Platform Engineering as a Discipline | 10K → 1M | Platform engineering is product management for developers. Kubernetes is a generic control-loop engine that happens to ship with container scheduling. Multi-tenancy is an architectural choice, not a feature flag. |
| **Season 3** · System Design at Staff Bar | 1M → 10M | Frame an ambiguous problem under time pressure. Estimate at scale with three anchor numbers. Defend a data-store choice in a design review. Write the ADR that gets cited three years later. |
| **Season 4** · Identity, Compliance, and the Agentic Era | 10M → 1B | Enterprise identity — OAuth, OIDC, SAML, mTLS, SPIFFE, zero trust — at the depth a Fortune 500 security team will push you on. The agentic literacy for designing LLM-backed services under cost and latency budgets. |

A season ends when its conceptual scaffold is complete, not when an episode count is reached. There is no Day 100 finale. New scenes will keep arriving as Tessera's surface area grows — federation, edge compute, AI-native architectures, the messy realities of being a 500-engineer company.

When a topic has surfaced three times in the main story, that's the signal to consider a **branch series** — a focused 10–15 episode deep-dive that returns to Tessera but drills deeper than the main thread permits. *The CRD Season*, *The Identity Season*, *The Postmortem Season* are the likely first three. Branches are written when the main story has earned them.

## Who you'll meet

Tessera's crew is fixed; behaviour is the texture. You learn who each character is by watching them work, not from narrator essays.

- **Kiran** (CTO, co-founder) sets ambitious schedules and means them.
- **Anjali** (founding engineer, later titled Staff) is the one who pauses for five seconds in a design review before answering — and the conversation reframes.
- **Diego** (founding engineer, later SRE lead) speaks last in the war room, decisively.
- **Wim** (longest-tenured) knows where the bodies are buried in the legacy code.
- **Sara** (Platform PM, joins at 1M) tracks adoption metrics like treasure maps.
- **Hassan** (CISO, joins at the enterprise mark) is the one who says "we can ship Tuesday — without the audit log, we cannot ship at all."
- **Lior** (AI infra lead, joins in the AI era) ships first and scales after.
- **Aman** (first junior hire, joins around 1M) is the one taking the customer ticket at face value when Anjali walks past.

The Support scenes lean on the contrast between Aman and Anjali — the same ticket, two different approaches, and you watch the delta between them play out in dialogue. It is the most legible way to see Staff-engineer thinking happen: by watching what it *isn't* alongside what it *is*. The notebook never tells you which is which. The scene shows you, and you decide.

There are no villains. The antagonists are scale, complexity, technical debt, and customer pressure — never people.

## What this is not

- **Not a transformation arc.** Nobody becomes a Staff engineer in 100 episodes. Recognition is the goal: when you've watched Anjali reframe a problem twenty times, you start catching yourself doing the same kind of reframe in your own design reviews. That's the win.
- **Not a course with an exam.** The episodes are 7 minutes by design. They are not lectures. The work is in the journal question and the second cup of coffee where you argue with what you just read.
- **Not safe positions only.** Every episode takes one position and defends it. If you disagree with a position, that disagreement is the most useful thing the episode produced for you.
- **Not a 1:1 retelling.** Every Tessera incident is a composite of patterns that appear in DDIA, the Google SRE book, CNCF talks, and the wider public technical literature. No specific employer is depicted.

## Where to start

If you have time today, start at [**Day 1 — Two regions by Friday**](./season-1/two-regions-by-friday). It opens with Tessera's CTO walking into the engineering room with a new customer in New York, a Friday deadline, and a single-region architecture that won't survive the trip. Anjali walks to the whiteboard before anyone touches the architecture diagram. That's the texture; the rest of Season 1 builds from there.

If you only have a minute, scroll down — the latest episode is below.

The journal question waits at the end. Don't skip it.

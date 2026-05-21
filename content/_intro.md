---
title: The Tessera Notebook
description: A daily platform-engineering story. One episode a day, roughly seven minutes. Read every morning; watch how senior engineers actually think.
greeting: The Tessera Notebook — a daily platform-engineering story.
---

# The Tessera Notebook

A fictional engineering team at a fictional company called **Tessera** — a Bangalore-founded multi-tenant developer-infrastructure SaaS — and we watch them grow. POC. MVP. Ten thousand customers. A million. Ten million. A billion. Each rung of that ladder breaks something the previous rung relied on, and the team has to design the next thing.

The platform-engineering canon — distributed systems, Kubernetes as a control-loop engine, system design at Staff bar, enterprise identity, the agentic stack — is not a textbook here. It's the territory the team walks across as the scale forces it to.

## What you'll read each morning

Every episode opens with a scene from Tessera's life, and the scene surfaces a concept. The scene comes first.

Four scene types alternate by feel:

| Type | What you watch | Example |
|---|---|---|
| **Feature** | Tessera is shipping something and has to answer a design question first | *Day 1 — Two regions by Friday*: the eight fallacies of distributed computing land on the whiteboard before the architecture diagram does |
| **Incident** | Something broke at this tier of scale and the war room is open | *Two leaders, briefly*: leases and fencing tokens save the next incident |
| **Support** | A customer reported something and the team has to decide what class of bug it actually is | *Day 13 — The duplicate charge*: refund the ticket, or fix the contract that produced it |
| **Decision** | An internal design review with no shipping urgency — the team picks the data store and defends the queue choice | *Choosing the queue*: write the ADR that gets cited three years later |

Each episode is roughly a 7-minute read with the same five beats: a scene (200–350 words), the concept it surfaces (400–600 words), one mental model you keep, one question to journal, and a one-line tease for tomorrow. Density is the brand.

## Who you'll meet

- **Kiran** (CTO, co-founder) sets ambitious schedules and means them.
- **Anjali** (founding engineer, later titled Staff) is the one who pauses for five seconds in a design review before answering — and the conversation reframes.
- **Diego** (founding engineer, later SRE lead) speaks last in the war room, decisively.
- **Wim** (longest-tenured) knows where the bodies are buried in the legacy code.

## Where to start

If you have time today, start at [**Day 1 — Two regions by Friday**](./season-1/two-regions-by-friday). It opens with Tessera's CTO walking into the engineering room with a new customer in New York, a Friday deadline, and a single-region architecture that won't survive the trip. Anjali walks to the whiteboard before anyone touches the architecture diagram. That's the texture; the rest of Season 1 builds from there.

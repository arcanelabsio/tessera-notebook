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

| Type | What you watch | What it surfaces |
|---|---|---|
| **Feature** | Tessera is shipping something and has to answer a design question first | *Distributed-systems fundamentals* — fallacies, latency budgets, CAP, the physics of a round-trip drawn on the whiteboard before the first line of code |
| **Incident** | Something broke at this tier of scale and the war room is open | *Failure modes that scale* — retry storms, split-brain, cache stampedes; the same outage repeating in new clothes at each tier of growth |
| **Support** | A customer reported something and the team has to decide what class of bug it actually is | *Contracts vs. accidents* — idempotency, exactly-once myths, multi-tenancy boundaries, the bug-versus-design call that defines the SLA |
| **Decision** | An internal design review with no shipping urgency — the team picks the data store and defends the queue choice | *Architecture under constraint* — queues, data stores, schema evolution, the ADRs cited three years later and the ones that ought to have been |

Each episode is roughly a 7-minute read with the same five beats: a scene (200–350 words), the concept it surfaces (400–600 words), one mental model you keep, one question to journal, and a one-line tease for tomorrow. Density is the brand.

## Who you'll meet

- **Kiran** (CTO, co-founder) sets ambitious schedules and means them.
- **Anjali** (founding engineer, later titled Staff) is the one who pauses for five seconds in a design review before answering — and the conversation reframes.
- **Diego** (founding engineer, later SRE lead) speaks last in the war room, decisively.
- **Wim** (longest-tenured) knows where the bodies are buried in the legacy code.

## Where to start

If you have time today, start at [**Day 1 — Two regions by Friday**](./season-1/two-regions-by-friday). It opens with Tessera's CTO walking into the engineering room with a new customer in New York, a Friday deadline, and a single-region architecture that won't survive the trip. Anjali walks to the whiteboard before anyone touches the architecture diagram. That's the texture; the rest of Season 1 builds from there.

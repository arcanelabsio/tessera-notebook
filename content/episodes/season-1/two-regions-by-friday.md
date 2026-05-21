---
day: 1
title: Two regions by Friday
slug: two-regions-by-friday
series: tessera-notebook
season: season-1
scene_type: feature
arc: Arc 1 — The Premises of Distributed Computing
concept: The 8 fallacies of distributed computing
description: The list everyone has heard and almost nobody uses as a checklist.
date: 2026-05-21
voice_pass: 2026-05-21
---

# Day 1 — Two regions by Friday *(feature)*

## Scene

Tessera's eu-west-1 dashboard has been green for three weeks. Kiran stops by the engineering room a little after 11 with the news: Ledgerline Tech signed on Tuesday, they're in New York, and they want sub-100ms latency from a US-east endpoint by Friday.

Diego looks up from his terminal. "Friday this week?"

"Friday this week."

The room goes quiet, the way rooms do when an ambitious schedule meets the physics of distributed systems. Kiran pulls up the architecture diagram on the wall display: one VM, one Postgres, one Go service, one region — twelve thousand miles from where Ledgerline Tech's traffic is about to originate.

Anjali, three weeks into the job, closes her laptop and walks to the whiteboard. "Before we talk about what we're going to build," she says, "we should write down what we already know we're going to get wrong."

She uncaps the marker. On the whiteboard, in steady hand: *The eight fallacies of distributed computing.*

Wim, who has been at Tessera longest of anyone — twenty-two months — recognises the list immediately. He pulls a chair closer. "Let's go through them," he says. "All of them. Before we touch the diagram."

## The concept it surfaces

Peter Deutsch (and later James Gosling) at Sun Microsystems in the 90s noticed that engineers building distributed systems repeatedly made the same wrong assumptions. They wrote them down — eight assumptions, each of which is *false in production* and *invisible in dev*:

1. **The network is reliable.** Packets drop. Routes flap. Cloud providers have bad days. Every network call is a *probability* of success, never a certainty.
2. **Latency is zero.** Even in the same datacenter, a round-trip is ~0.5ms. Across regions, 50–200ms. Stacking ten sequential calls burns the user's patience before the request finishes.
3. **Bandwidth is infinite.** You can saturate a 10Gbps link. You will, the day someone uploads a video.
4. **The network is secure.** There is no "internal network" — only the network, with varying degrees of compromise.
5. **Topology doesn't change.** Pods get rescheduled. IPs get recycled. DNS caches lie. The map you cached 10 seconds ago is already stale.
6. **There is one administrator.** Other teams own the services you depend on. They will deploy without telling you. They will rename things.
7. **Transport cost is zero.** Marshalling, encryption, kernel buffer copies — at scale, this dominates CPU.
8. **The network is homogeneous.** Mobile clients have different MTUs than desktop. Some users are on satellite Internet from a moving train. Your protocol must survive all of it.

The fallacies aren't a *theorem*. They're a *vibe check*. Before any distributed-systems design ships, walk the list and ask: *what does my system do when this is violated?* If the answer for any item is "it crashes" or "it returns wrong data silently" — that's a design bug, not an edge case.

The list earns its keep as a habit, not a theorem. Walked before the diagram, it forces failure modes into the design phase. Walked only after an outage, it's a postmortem checklist.

## Mental model

| Fallacy | What naive code looks like | What survives production |
|---|---|---|
| Network reliable | `client.call(req)` | Retry + backoff + idempotency key + circuit breaker |
| Latency zero | 5 sequential remote calls | Parallel + cached + with a budget |
| Bandwidth infinite | Send full payload always | Deltas + compression + pagination |
| Network secure | Trust internal IPs | mTLS + identity check + zero trust |
| Topology stable | Cache resolved IP | Re-resolve + connection draining + health checks |
| One admin | Hard-code dependency endpoints | Service discovery + versioned APIs + graceful degradation |
| Transport free | JSON everywhere | Schema + binary protocol on hot paths |
| Homogeneous | Assume HTTP/2 + TLS 1.3 | Negotiate + fallback + measure |

## One question to journal

Pick one service you own. Walk through all 8 fallacies. For each, write one sentence: "If this is violated, my service responds by ___." If you can't finish a sentence — that's the gap to close this week.

## Tomorrow

**Day 2 — The first ocean.** Sunday's postmortem after the Friday push. Retry-without-backoff amplifies a network blip 12× across the Atlantic. CAP arrives through pain.

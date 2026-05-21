---
day: 1
title: Two regions by Friday
slug: two-regions-by-friday
series: tessera-notebook
season: season-1
scene_type: feature
arc: Arc 1 — The Premises of Distributed Computing
concept: The 8 fallacies of distributed computing
description: The list everyone has heard and almost nobody walks before the diagram
date: 2026-05-22
voice_pass: 2026-05-22
---

# Day 1 — Two regions by Friday *(feature)*

## Scene

Tessera's eu-west-1 dashboard has been green for three weeks. Kiran stops by the engineering room a little after 11 with the news: Ledgerline Tech signed on Tuesday, they're in New York, and they want sub-100ms latency from a US-east endpoint by Friday.

Diego looks up from his terminal. "Friday this week?"

"Friday this week."

The room goes quiet, the way rooms do when an ambitious schedule meets the physics of distributed systems. Kiran pulls up the architecture diagram on the wall display: one VM, one Postgres, one Go service, one region — twelve thousand kilometres from where Ledgerline Tech's traffic is about to originate.

Diego opens a calculator on his second monitor. Kiran sees him do it and doesn't say anything; this is the part of Diego's process you don't interrupt. After thirty seconds Diego closes the calculator without showing anyone the number, leans back, and exhales through his nose.

Anjali, three weeks into the job, closes her laptop and walks to the whiteboard. "Before we talk about what we're going to build," she says, "we should write down what we already know we're going to get wrong."

She uncaps the marker. On the whiteboard, in steady hand: *The eight fallacies of distributed computing.*

Wim, who has been at Tessera longest of anyone — twenty-two months — recognises the list immediately. He pulls a chair closer. "Walk them with us," he says. "All eight. Before we touch the diagram. Whatever Diego just computed and didn't say, the list is the right place to start."

## The concept it surfaces

Peter Deutsch wrote the first seven fallacies at Sun in the 90s, watching the same distributed-system bugs appear in CORBA, RPC, and early distributed object systems. James Gosling added the eighth. The bugs clustered at specific assumption points — not random failures, but *predictable bias*. The list has been stable for thirty years because the bias has been stable for thirty years.

The fallacies are not *bad knowledge.* They are *inherited bias from the development environment.* Engineers test on the same machine, on loopback, with no latency, on a network they trust, with one administrator (themselves) deploying the whole system. The dev environment hides production reality. The fallacies are the eight specific points where that hidden reality reasserts itself, usually at the worst possible time:

1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

The list is memorable enough that engineers have been reciting it for thirty years. Reciting it is not the discipline. The discipline is what Anjali was doing at the whiteboard: walking each line *before* the architecture diagram is drawn, asking "what does my system do when this assumption is violated, and what specifically am I going to do about it?"

To see why that question is the load-bearing part, walk one fallacy mechanically. Take #2 — *latency is zero* — as the worked example, because the scene set it up.

Tessera's eu-west-1 region is in Frankfurt. Ledgerline Tech's endpoint will originate in New York. The physical RTT floor in fibre between them — distance over the speed of light in glass — is ~62 ms. Special relativity is the constraint. No engineering reduces it; the only levers past this floor are moving the data closer or moving the computation closer.

On top of physics, the protocol stack and the real production network add their own time. The relevant numbers for an architecture conversation are not theoretical handshake counts — they are what AWS actually measures between region pairs today:

| Layer | RTT (NYC↔FRA) | Notes |
|---|---|---|
| Physical floor (fibre) | ~62 ms | Speed of light in glass; irreducible |
| Measured AWS us-east-1 ↔ eu-west-1 | 85–95 ms typical, 110–140 ms p99 | ~25 ms over floor from router queueing, ECMP rehashing, BGP convergence |
| TLS 1.3 handshake | +1 RTT warm / +2 RTT cold | Session resumption hits ~70% in real load balancers, not the 95%+ benchmarks suggest |
| Application + database | 10–80 ms | Application is the only fully-compressible layer; cross-AZ DB writes add ~2 ms intra-region |

A single cross-region call lands around 100 ms on a warm connection, ~200 ms on a cold one. The deeper number is not the median — it is the *tail*. P99 across a sustained workload runs 110–140 ms; outage-day p99 can hit 250 ms when BGP reconverges across the path. That tail is not normal-distributed, because BGP events and queueing spikes are bimodal, not Gaussian. The operational consequence: a latency budget that absorbs the *median* is the wrong budget. Absorb the *p99*, or your client-facing SLA is a coin flip on outage days. The fallacy "latency is zero" is not the engineer's problem; the engineer's problem is "the latency I measured once does not predict the latency I will see at the worst minute of next quarter."

Once you see this number, the design space *narrows.* Sub-100ms from a single eu-west origin to a client in New York is physically impossible. The available levers are: move the data closer (a us-east read replica, with eventual-consistency consequences); move the computation closer (cache at the edge, with staleness consequences); or renegotiate the latency SLA before signing the contract. "Optimise the application" is not on the list — application processing is already under 10% of the budget.

That is what walking the framework before the diagram produces. Not a list to recite. *A number that constrains the architecture before any code is written.* Walked here, fallacy #2 immediately rules out the cheap design (single region, hope for the best) and forces the conversation toward multi-region. The remaining seven do the same job for their respective concerns: #1 forces retry-and-idempotency design; #5 forces connection management and health-checking; #6 forces an explicit service contract with Ledgerline Tech instead of an implicit one; and so on. Each fallacy resolves into a specific design constraint and a specific set of mitigations, each with a known cost.

The framework earns its keep at one specific moment: *before the architecture diagram is drawn.* Walked then, each fallacy is a design constraint that narrows the space of acceptable designs. Walked after an outage, each fallacy is a postmortem checklist — still useful, but the design has already shipped, and the cost of changing it is the cost of migration plus the cost of the customer impact already incurred. The same eight items; very different return on the time spent.

Most engineers can recite the eight fallacies and still ship systems that ignore them. The gap is not intellectual. It is social. Walking the framework at Tuesday's meeting *slows the room down* — visibly, with a marker and a whiteboard, while the deadline is still on everyone's screen. The person who slows the room is, on the surface, the person blocking progress. That is why the framework is recited at interviews and ignored at design reviews: not because the engineers do not know it, but because applying it is a social move that requires the standing to make. The framework's actual users are the engineers who have learned to pay that cost on purpose.

## Mental model

Each row below is one walked fallacy. The middle column is what code looks like when an engineer hasn't asked the question; the right column is the mitigation pattern that survives a production environment that didn't honour the assumption. The mitigations have costs of their own — retries cost latency on the unhappy path, parallel calls cost coordination overhead, mTLS costs CPU on every connection. The framework's whole job is to make those costs deliberate, named, and present in the design before code ships.

| Fallacy | What naive code looks like | What survives production |
|---|---|---|
| Network reliable | `client.call(req)` | Retry + backoff + idempotency key + circuit breaker |
| Latency zero | 5 sequential remote calls | Compute the floor; parallel + cached within a budget |
| Bandwidth infinite | Send full payload always | Deltas + compression + pagination |
| Network secure | Trust internal IPs | mTLS + identity check + zero trust |
| Topology stable | Cache resolved IP | Re-resolve + connection draining + health checks |
| One admin | Hard-code dependency endpoints | Service discovery + versioned APIs + graceful degradation |
| Transport free | JSON everywhere | Schema + binary protocol on hot paths |
| Homogeneous | Assume HTTP/2 + TLS 1.3 | Negotiate + fallback + measure |

## One question to journal

Pick a latency-critical endpoint your team owns. Compute the speed-of-light round-trip floor between the client and the data store: great-circle distance in kilometres, divided by 200 (fibre-optic speed in km/ms), times two for the round trip. Then look at your current p99 latency. If your p99 is within 2× the floor, you are *at* the physics wall — anything further requires architectural change, not optimisation. Where is your endpoint?

## Tomorrow

Tuesday afternoon. Anjali and Diego at the whiteboard, walking the remaining seven fallacies one by one. By 4 PM the design has acquired a us-east read replica, several new failure modes nobody had named on Monday, and one question that nobody wants to answer.

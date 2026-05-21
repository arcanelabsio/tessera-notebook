---
day: 2
title: Two failures, one shape
slug: two-failures-one-shape
series: tessera-notebook
season: season-1
scene_type: feature
arc: Arc 1 — The Premises of Distributed Computing
concept: Fallacies #1 + #5 — what survives when the network blips and the topology drifts
description: Retries assume the wire still exists; DNS-TTL assumes the endpoint still answers. The us-east replica needs both to be true.
date: 2026-05-23
voice_pass: 2026-05-23
---

# Day 2 — Two failures, one shape *(feature)*

## Scene

Tuesday, just after 2 PM. The whiteboard from Monday is still up — the eight-line list down the left, the us-east replica drawn in cyan at the right where Anjali added it last night. Wim is in the same chair as yesterday, coffee in hand, watching. Diego is at the marker tray, calculator open on his laptop. Anjali has the marker.

"Number one," she says, and underlines *the network is reliable.* "Ledgerline Tech's client opens a connection to the us-east replica. What does our code do when that connection silently dies mid-request?"

Diego looks up. "Right now? It hangs until the OS-level TCP timeout fires. Two minutes, default."

"And if we wrap it in a retry?"

"Then it hangs for two minutes, fires a second request, and hangs again. Two POSTs land on the replica."

Anjali draws an arrow from the client to the replica, then a second arrow beside it. "So we need idempotency keys on writes before we ship the retry, or we double-charge somebody on packet loss." She writes *idempotency key (required on POST)* under the arrow. "Cost?"

"One extra column on every write table. One extra lookup per request." Diego types something into his calculator, then stops typing. "Cheap."

She moves down the list. Lines two through four already have notes from Monday. She skips to five. *Topology doesn't change.*

"Same scenario. The replica's AWS instance dies at 3 AM. RDS spins up a replacement in about thirty seconds. How long is Ledgerline Tech's client down?"

Diego doesn't answer immediately. He pulls up a config file on his laptop, scrolls. "The endpoint is a DNS name. We resolve it once on connection-pool init and cache the IP. The TTL on the record is —" he scrolls again — "three hundred seconds."

"So thirty seconds of AWS event, five minutes of us."

Wim sets his coffee down.

## The concept it surfaces

Fallacies #1 and #5 sound like two separate items on a checklist — *the network is reliable*, *topology doesn't change* — and most teams treat them that way. Retry logic gets added by the application team. DNS TTL gets set by whoever wrote the Terraform six months ago. The two decisions live in different repos, owned by different people, reviewed in different PRs.

In production they are one design problem. The reason: every mitigation for one of them either depends on or undermines a mitigation for the other.

The retry pattern that survives #1 — *try the call again with a fresh connection* — assumes the endpoint the client is dialing still answers. If the endpoint has moved (failover, scale-out, instance replacement, anything that violates #5), the retry redials the dead address until the client's DNS cache expires. The retry isn't broken; the *assumption underneath the retry* is broken. The application engineer who added the retry never thought about the DNS layer; the platform engineer who set the TTL never thought about the retry budget.

Walk the RDS read-replica failover concretely. AWS RDS detects an unhealthy instance and replaces it in roughly thirty seconds — the endpoint name stays the same, the underlying IP changes. From the client's side, three things now race:

The client's DNS resolver holds the old IP until its TTL expires. The application's connection pool holds open TCP connections to the old IP regardless of DNS, because pooled connections were established by IP and are reused as long as they look healthy. The pool's health check polls each connection on some interval — typically every 30–60 seconds — and only evicts a connection after it has failed some threshold of consecutive checks, typically three.

The client-perceived MTTR is `max(DNS_TTL, health_check_interval × failure_threshold) + connection_drain_time`. AWS replaced the instance in thirty seconds; the client sits in some combination of timeout, retry, and stale-pool purgatory for as long as the slowest of those three layers takes to give up. The fallacy "topology doesn't change" doesn't bite when topology changes — it bites when your three independent eviction mechanisms don't agree on *when* topology changed.

The available knobs trade against each other:

| TTL / health check | Client-perceived MTTR | What it costs |
|---|---|---|
| TTL 300 s, hc 60s × 3 | ~5 min (TTL dominates) | Baseline; DNS bill negligible |
| TTL 5 s, hc 60s × 3 | ~3 min (hc dominates) | DNS QPS ×60; pool still stale 3 min |
| TTL 5 s, hc 5s × 2 | ~15 s | DNS bill + health-check chatter + false-positive flapping on slow queries |
| TTL 5 s, hc 5s × 2, retry on conn error | ~5 s (retry covers the gap) | Above + duplicate writes unless idempotency keys are enforced |

The bottom row is the only configuration that gets you near AWS's thirty-second floor. It works *only because* every write endpoint enforces an idempotency key — the #1 mitigation. Drop the key and the same configuration starts double-charging customers the first time a connection drops mid-POST. The #5 fix breaks without the #1 fix in place.

That is the shape. Retries assume the wire still exists; DNS-TTL assumes the endpoint still answers. In a partial-failure world both assumptions fail at the same time, for the same underlying reason — *a thing the client believed about the network has stopped being true.* The mitigations have to be designed together because their costs share a budget: aggressive TTLs and tight health checks eat into your false-positive tolerance; idempotency keys add write-path latency and storage; connection draining adds in-flight request loss during failover. Pick the wrong combination and you're paying for all of them while still seeing five-minute outages.

## Mental model

The us-east replica failing over is not a network event and a topology event. It is one event the client observes through several lenses. Each lens has its own eviction clock; the slowest clock determines the outage.

| Layer | Holds stale state for | Mitigation has a cost |
|---|---|---|
| DNS resolver cache | TTL seconds | Low TTL → DNS QPS bill + cache-miss latency |
| Connection pool | `hc_interval × hc_failures` | Tight health check → false-positive flapping |
| In-flight request | until timeout fires | Retry-on-error → duplicate writes without idempotency |

The cost row matters as much as the mitigation row. Every knob you tighten on the left buys you MTTR; every knob you tighten on the right adds a different cost. The Tessera answer is not "pick the tightest setting" — it's "pick the slowest layer's eviction clock to match your SLA, then pay for the costs that buys."

## One question to journal

Pick one service your team owns that talks to a managed database or an internal service behind a load balancer. Write down: (a) the DNS TTL on the endpoint, (b) the connection pool's health-check interval and failure threshold, (c) whether the client retries on connection error. Compute the worst-case client-perceived MTTR from those three numbers. Now ask: does that number match what your SLA promises, and which of the three knobs would you turn first?

## Tomorrow

Wednesday morning, Diego at his desk with a cost projection open. He's added retry budget, replica reads, and idempotency-key storage to the model — and the number at the bottom right of his sheet is three times what he showed Kiran on Monday.

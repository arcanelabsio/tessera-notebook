---
day: 3
title: Where the data lives
slug: where-the-data-lives
series: tessera-notebook
season: season-1
scene_type: feature
arc: Arc 1 — The Premises of Distributed Computing
concept: "Strong vs eventual consistency — the load-bearing axis, and which reads sit on which end"
description: The expensive lines on Diego's cost sheet aren't replicas or retries. They're the reads he hasn't yet decided are strong.
date: 2026-05-22
voice_pass: 2026-05-22
---

# Day 3 — Where the data lives *(feature)*

## Scene

Wednesday, 9:14 AM. Diego is at his desk before the standup with a spreadsheet open: retry budget, replica reads, idempotency-key storage, connection-pool sizing, DNS QPS. The number in the bottom-right cell is three times what he showed Kiran on Monday. He has been staring at it for eleven minutes.

Anjali drops into the chair beside him, sees the sheet, and reads it from the top without saying anything. She gets two-thirds of the way down before she points at one line.

"Synchronous cross-region replication. That's most of it."

"Yeah." Diego doesn't look up. "If every write goes to both regions and waits for both to ack, that line is half the bill. If we drop it to async, the line is almost nothing."

"And if we drop it to async, what reads break?"

Diego thinks. "Ledgerline Tech's idempotency-key lookup. Their payment gateway hits `/charges` with a key before processing — we answer *seen* or *go ahead.* If that read goes to an async replica and the write from a hundred milliseconds ago hasn't propagated, we answer *go ahead* twice. They charge the customer twice. And the two retries aren't coming from the same session — it's two of their gateway boxes racing the same upstream retry. Neither of them is 'the writer.'"

"Right. So that read is strong. Which other reads are?"

He scrolls back through the API surface. Most of it is reporting — *yesterday's transactions, this month's volume, the audit log.* He stops on one row. "None of these, actually. They're all snapshots of older state. A few seconds stale is fine."

Anjali finds a blank corner of the whiteboard. "So you don't need every read to be strong. You need *that one* to be strong." She draws two columns. "On the left, every endpoint Ledgerline Tech hits. On the right, what kind of read it actually is. Then the cost line on your sheet goes down by — I don't know — let's see."

Wim, walking past with coffee, glances at the columns and slows. "The expensive part isn't replicas," he says. "The expensive part is the reads you haven't yet decided are strong."

## The concept it surfaces

A single-machine database has one consistency model: whatever you wrote last is what you read next. There is no replication, so there is no question.

The moment data lives on more than one machine, that guarantee splits, and the system designer has to pick which guarantee each read needs. The load-bearing axis runs from **strong** consistency at one end to **eventual** consistency at the other. There are finer-grained models that subdivide the middle of that axis — they earn their own treatment — but the load-bearing design call lives on the axis itself: which reads pay for freshness everywhere, and which reads accept "good enough for now" in exchange for an order of magnitude less cost.

**Strong consistency.** Every read sees the latest committed write, regardless of which replica it hits. There are two mechanisms in practice. The first is *synchronous quorum replication*: the write isn't acknowledged until a majority of replicas have durably stored it, and reads also touch a majority — Spanner, etcd, CockroachDB. The second is *single-primary routing*: all writes go to one node, and either all reads also go to that node, or reads to followers are explicitly serialised against the primary's commit log — classical Postgres, MySQL with synchronous replication on. Cost is the same in both shapes: every write pays the cross-replica RTT (~85 ms for us-east ↔ eu-west), and reads either pay the same RTT or burn the local replica's latency advantage. Strong consistency is also the shape that gives up the most availability under partition — if the quorum can't be reached or the primary is unreachable, writes stall.

Strong consistency is the right call when the *next read* of a value depends on the *most recent write*, **and the next reader is not the writer.** Money. Inventory. Idempotency-key lookups across racing gateway boxes. Single-source-of-truth answers like "is this user already enrolled in MFA" when the answer drives a security branch. The defining property is that two unrelated callers can race for the same answer and the system must give them the same one — not "the same eventually," the same *now*.

**Eventual consistency.** Replicas converge to the same value *eventually*, with no bound on how long that takes. Writes propagate asynchronously; reads return whatever the local replica has. Some reads will see stale data, and the system does not promise how stale or for how long. The mechanism is the absence of coordination on the write path — a write is acknowledged as soon as the local replica has it, and propagation to peers is fire-and-forget. On the read path, every replica serves locally; there is no cross-region hop. Eventually-consistent stores are also the shape that stays available under partition — a partitioned replica can keep serving reads (and even writes, in AP designs like Dynamo or Cassandra) from local state, and reconcile when the partition heals.

The cost profile is the inverse of strong: writes are roughly local-disk-fast, reads are roughly local-disk-fast, and cross-region traffic is async background work that doesn't sit on any user-facing critical path. In practice, eventual reads cost 5–10× less per request than strong reads of the same data — sometimes more, when the strong-read implementation requires a full primary hop across regions. This is the cost ratio that makes the consistency decision a *budget* decision, not just a correctness one.

Eventual consistency is the right call when staleness is operationally invisible — when the reader cannot tell, or does not care, whether the value is current to the millisecond. Yesterday's reports. Search indexes. Recommendation feeds. Activity timelines where "a few seconds behind" is indistinguishable from "current." The defining property is that the consequence of staleness is *no consequence* — no incorrect business outcome, no security boundary crossed, no duplicate side-effect.

The architecture lesson is that *consistency is not a system-wide setting.* It is an **endpoint-by-endpoint** decision. A single product surfaces strong reads and eventual reads in the same page — the cart total is strong, the "related items" carousel is eventual. Each one is priced separately. The team that picks one shape for the whole product overpays on the cheap reads and underdelivers on the expensive ones. The discipline is to walk every endpoint and ask, of each one, which end of the axis it actually sits on — and only then add up the bill.

## Mental model

| Shape | What the reader sees | When to use it |
|---|---|---|
| Strong | Every read, latest write, everywhere | Money, inventory, idempotency lookups, security branches |
| Eventual | Whatever the local replica has | Reports, search, recommendations, activity feeds |

Pricing rule of thumb: eventual reads cost 5–10× less than strong reads of the same data per cross-region request. The discipline is not "pick strong and pay for it" — it's "pick eventual everywhere it works, and pay for strong only where the next reader is not the writer and staleness produces a wrong outcome."

## One question to journal

Pick three read endpoints in a service your team owns. For each, ask: *if the response were 500 ms stale, who would notice, and what would they do?* If the answer is "money or inventory becomes wrong, or a duplicate write goes through," that read needs strong consistency. If the answer is "nobody, the next refresh catches it," eventual is enough. Which of your three reads is currently overpaying — strong when eventual would do — and what would that change cost (or save) per month?

## Tomorrow

Thursday, 11 AM. Anjali blocks Kiran's calendar for a thirty-minute review and pings Diego: *bring the endpoint table.* Kiran reads the invite title — *"Consistency, per endpoint"* — and walks in with a marker already in his hand.

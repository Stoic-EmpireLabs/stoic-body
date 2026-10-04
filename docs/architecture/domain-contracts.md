# Shared data and domain contracts

Phase 2 proposal • 2026-10-04. Normative design for later implementation. Existing TypeScript functions do not yet implement this contract.

## Records and invariants

All mutable personal entities have a random stable ID, owner ID, schema version, integer revision, created/updated timestamps and optional tombstone. Server authorization derives owner ID from the session, never trusts it from a submitted body. IDs are generated offline; server sequence numbers order accepted changes. Timestamps are UTC instants except explicitly local calendar fields. Measurements retain original value/unit and source; canonical conversions never overwrite originals.

| Entity | Essential fields and relationships |
|---|---|
| Profile | Optional demographics, units, timezone, sleep preferences, constraints, consents; each answer has answered/unknown/skipped state |
| Goal | Outcome, reason, baseline, target with unit, deadline kind, priority, effort range; may have milestones |
| Milestone / Project | Goal/milestone relationship, completion evidence, order, explicit reward budget; project groups tasks |
| Task | Goal/project links, obligation/health/recreation fallback category, duration range, earliest/latest dates, priority, energy, equipment/place requirements, dependency IDs, approved reward budget |
| Recurrence | Local start, IANA zone, supported rule, exceptions, time semantics, revision; occurrence IDs independent of current UTC offset |
| Occurrence | Task ID, recurrence key, planned UTC start/end, local date/zone, prep/travel/buffer, fixed/locked state, completion fraction, schedule revision |
| Completion | Occurrence ID, fraction 0–1, actual duration/time, notes, version and originating operation |
| XP event | Occurrence/reward-budget ID, completion version, signed delta, reason, originating operation and reversal reference; derived balance |
| Schedule proposal | Base revisions, horizon, moves, unplaced items, constraint explanations and validation result |
| Meal / Food entry / Recipe | Ingredient/portion quantities and units, nutrient source, estimate flag, timestamp, recipe version and allergen metadata |
| Training plan / Session / Set | Versioned template and exercise IDs; scheduled occurrence; targets versus actuals; effort, duration, discomfort, substitutions |
| Measurement | Type, value/unit, measured-at time, method/device/source and uncertainty; corrected/superseded links |
| Resource / Learning pathway | Real URL, title/provider, level, cost/materials/time, checked date, prerequisites and review history |
| Reflection / Quote | Date, context tags, saved text, original/paraphrase/verified classification, author/work/location where required |
| Attachment / Import batch | Private original hash, media type/size, scoped parent reference, extraction result and confirmed facts with source locations |
| Reminder | Occurrence ID, device policy, offset, local notification ID, intended time, permission/registration status and last reconciliation |
| Device / Session / Consent | Device public identifier, account, revocation epoch, refresh-token hash, allowed optional scopes and consent version |
| Operation / Change / Conflict | Idempotency key, device ID, entity/base revision, type/payload, server sequence, result; competing revisions retained |
| Export / Restore manifest | Schema, dataset ID, counts, attachment hashes, cut-off sequence, creation time and validation result |

SQLite schema must enable foreign keys on every connection and enforce owner-scoped uniqueness. Mutations that affect completion, XP and the sync outbox commit atomically. App/server use local disk, not a shared network-mounted SQLite file. [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html), [atomic commit](https://www.sqlite.org/atomiccommit.html)

## Scheduling rules

1. Validate inputs: finite positive durations, explicit zone, nonnegative buffers, legal dates, supported recurrence and acyclic dependencies. Uncertain estimates remain ranges, not zero-minute work.
2. Expand a bounded planning horizon: next 14 days for placement, 90 days for capacity overview. Longer goals retain milestones and effort forecasts without manufacturing distant detailed dates.
3. Reserve sleep, fixed appointments, locked sessions and explicitly protected family/leisure blocks first. Overlapping fixed appointments are reported; neither is silently moved.
4. Capacity uses free intervals after reserved time. Preparation/travel/buffers occupy time too. Defaults are editable suggestions; there is no mandatory 15-minute buffer for every small habit. Activities can share a declared routine container without double-counting its duration.
5. Sort eligible flexible work by explicit priority, nearest fixed deadline, dependency readiness and stable ID. Choose a fitting interval using energy/time preferences, then earliest fit. Do not move accepted work merely to improve a score.
6. Splitting is allowed only for splittable tasks and respects a user-defined minimum session length. Never split a fixed appointment, meal, workout or safety-dependent activity automatically.
7. If capacity is insufficient, return unplaced work and alternatives: reduce scope, revise deadline, change priority or free time. Show assumptions and minutes short. The owner chooses; neither sleep nor protected family time is reduced automatically.
8. Return a proposal with reasons. Apply only selected changes after validating that base revisions still match. Undo restores the prior accepted state if unchanged; otherwise it produces a new conflict-aware proposal.
9. Skipped and missed are separate from completed. A minimum viable day uses approved shorter alternatives and protected essentials, with no automatic increase in tomorrow's load.

Time intervals are half-open [start, end), so adjacent events do not overlap. Duration represents elapsed minutes; local wall times express routine preferences. Store absolute appointments in UTC plus display zone; store routine recurrence in wall time plus IANA zone. On travel, ask whether routines follow the destination or home zone; confirmed appointments retain their actual instant.

For user-created routines at a nonexistent spring-forward time, preview shifting forward by the DST gap. For ambiguous fall-back times, preview the earlier occurrence, with a later-occurrence override. Show this at recurrence creation and on affected days. Imported ICS follows its declared timezone/recurrence semantics; invalid/nonexistent generated instances are skipped according to RFC rules and disclosed. Do not silently replace unknown timezone identifiers with the device zone. Support daily/weekly/monthly rules, interval, selected weekdays, COUNT/UNTIL and exclusions first; unsupported rules remain visible as unexpanded references requiring manual review. Series edits offer this occurrence or this and future; completed history is retained. [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545)

## XP and progression

| Action | Base XP |
|---|---:|
| Meaningful small task | 5 |
| Focus/learning session | 15 |
| Planned workout | 25 |
| Planned recovery | 15 |
| Daily reflection | 10 |
| Weekly review | 30 |
| Agreed milestone | 50–150 |

No streak, punctuality, fast-length, calorie-deficit, weight-loss or exercise-volume multipliers. Streaks are optional records with configurable grace days, not financial or XP debt. Recovery can be a completed action. Attributes allocate the event's XP; they do not multiply total XP across categories.

An occurrence has an approved reward budget B. At completion fraction f, earned XP = floor(B × f). Apply only the difference from the prior earned amount. A 25-XP workout at 50% earns 12; finishing it adds 13. Undoing its full completion reverses 25 linked XP; replaying the same operation reverses nothing more. A skip makes no XP event. Correcting an accidental completion can lower the derived level; it is a transparent correction of an award, never a punishment for missing work.

Subtasks share a parent reward budget. For an equal split of 25 across three subtasks, budgets are 9, 8, 8, assigned by stable order. The parent has no additional completion award. A genuine milestone may have its separately agreed reward; auto-created subdivisions cannot masquerade as new milestones. Editing a budget after any completion requires an explicit preview and correction transaction.

Level L begins at T(L) = 100(L−1) + 25(L−1)(L−2)/2 for L≥1. Cost from L to L+1 = 100 + 25(L−1). Boundaries: Level 1 at 0; Level 2 at 100; Level 3 at 225; Level 4 at 375. Negative or nonfinite input is rejected. Derive balance from valid ledger events, not an independently editable counter.

Transaction keys prevent duplicate application of a retried command. Semantic uniqueness also prevents two devices completing the same occurrence from producing two full rewards. Completing distinct recurring occurrences legitimately earns their separate budgets. Repeating manual food-log taps, creating water entries, extending fasts or adding training sets produces no additional reward.

## Measurements and forecasts

Never infer pounds from an unlabelled number. Unit conversion tests must preserve display round trips within declared precision. Weight/waist/strength/learning outcomes remain separate from XP.

Weight trend: take one median value per local calendar day from valid user-approved records; show a seven-calendar-day mean only with at least three measured days, and display the count. This is a transparent display rule, not a validated clinical model. Missing days are missing, not zeros. Values flagged as unusual remain visible and require user review before exclusion.

Body-goal ETA remains unavailable until there is enough consistent data and an approved, evidence-reviewed forecasting method. Initial product eligibility proposal: at least 14 measured days spanning 28 days in one consistent measurement method; below this, show trends and milestones only. Phase 5 must validate range calibration on synthetic noisy/sparse series, describe assumptions and label the model experimental until validated. Do not divide a target gap by a single weigh-in change.

Project forecast uses remaining effort range [E_low,E_high] and feasible weekly capacity [C_low,C_high]. Earliest week count = ceil(E_low/C_high); latest = ceil(E_high/C_low), with C_low=0 making latest unknown. For 12–20 hours and 3–5 feasible hours/week, show roughly 3–7 weeks. Count productive effort, not time merely assigned. After at least three comparable completed sessions, propose pace adjustments with sample count; user estimates remain editable.

## Sync protocol

Commands have operationId, deviceId, entityId, baseRevision, schemaVersion, type and payload. A local transaction stores the entity change and outbox command before showing saved. Pending local results are visible immediately. The server validates authentication, owner, schema and domain invariants before committing command result, changed entities, XP events and a monotonic change sequence together.

Proposed endpoints: POST /v1/sync/commands, GET /v1/sync/changes?after=<cursor>, GET /v1/sync/snapshot, POST /v1/devices/revoke, and scoped attachment/account endpoints. One request carries at most 100 commands or 1 MiB, whichever limit is reached first. Every command receives accepted, duplicate, conflict or rejected with reason and canonical revision. Network failures retry with bounded exponential backoff and jitter; authentication/validation failures wait for resolution rather than loop.

Append-only logs with distinct IDs merge. Edits to an existing log check revision. Concurrent completions reaching the same fraction are semantic no-ops after the first acceptance. A stale partial completion, undo or reschedule conflicts with a newer version and requires resolution; it never silently reverses another device's newer work. Device clocks cannot decide winners.

For title/time/deadline/health-target edits, compare base revisions and preserve both proposals on conflict. Deleted records have tombstones; stale devices cannot resurrect them. Compacted cursors trigger a full snapshot plus a reviewed rebase of unsent operations. A locally deleted account cannot be restored through ordinary sync.

At launch, sync runs on sign-in, app foreground/resume, reconnection and immediately after local changes while running; connected foreground peers poll deltas at a provisional 15-second interval. Background refresh is best effort under OS rules. No claim that a force-closed iPhone instantly receives and reschedules a remote alarm. Show last synced time and pending operations. Users choose reminder delivery devices to avoid ringing every device by default.

## Acceptance examples to implement

- Retry one completion 100 times: one semantic award; two offline devices completing it also converge to one award.
- Completion 0 → 0.5 → 1 → undo: 0 → 12 → 25 → 0 for a 25-XP budget; duplicate undo stays 0.
- 25-XP parent split into three children: maximum total remains 25.
- Fixed 09:00–10:00 meeting and a 45-minute task with 10-minute preparation plus 10-minute buffer: never fit the task into a 60-minute gap.
- DST fixtures for America/Denver on 2026-03-08 and 2026-11-01, travel to another zone, midnight sessions and recurring edits preserve stated policies.
- Unknown unit, no data, mixed units, duplicate same-day weights and sparse history do not produce precise health forecasts.
- Reconnect after account deletion or expired cursor cannot recreate deleted data or duplicate XP.
- Accepted academic facts link to source locations; conflicting dates remain unaccepted until resolved.

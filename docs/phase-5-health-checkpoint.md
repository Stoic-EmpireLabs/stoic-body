# Phase 5 — local health workspace

Implemented in the local pilot; the full nutrition/fitness phase remains open.

| Requirement | Working behavior | Evidence |
|---|---|---|
| Diet evidence and comparisons | Fourteen distinct approaches, evidence limits, practical considerations and source/review dates; OMAD, carnivore and medical liquid diets have separate cautions | src/core/health-content.ts; docs/research/phase-5-benchmarks.md; Health → Evidence browser check |
| Daily food/water/context | Manual meals, source labels, nullable nutrients, edit/reuse/archive, hydration and subjective context; unknown totals stay unknown | tests/core/health.test.ts; scripts/test-health-pilot.ts |
| Measurement trends | Dated weight/waist/body-fat logs with units/method; daily weight means and rolling seven-day summaries, no guaranteed arrival date | health metric unit tests; browser measurement journey |
| Equipment/time-aware starter sessions | Conservative bodyweight/cable sessions, treadmill walking, shadowboxing and recovery; preview before save; insufficient screening blocks generation | tests/core/training.test.ts; 20-minute full-body restriction regression |
| Shared schedule | One saved routine creates one task; existing scheduler previews/accepts placement; workout completion awards 25 XP, recovery 15 XP | training atomicity tests; health browser journey |
| Actual workout records | Matching sets/reps/load, duration, effort, discomfort and notes; conservative progression cues; logs earn no XP | core training tests; selected-exercise advice browser regression |
| Durable local state | Same owner/revision/replay/transaction rules as core; additive SQLite migration | health core tests and existing migration/recovery suite |

Browser journey includes corrected unknown food totals, reused meals, source links, blocked unknown screening, invalidated stale routine previews and advice changing with the selected exercise. Screenshots use synthetic data under docs/evidence/phase-5/.

Still open: numerical nutrition prescriptions, food database/barcodes/photos, recipes/groceries, comprehensive adaptive multiweek programs, independent technique/video coverage, body-goal forecasts, native device verification, sync, alarms, backup/restore and full privacy/security release review. Heavy lifting, sprint, HIIT and HIT resistance options are educational boundaries rather than generated programs. The app does not infer a physique or body-fat percentage from photos.

This is a Windows loopback pilot. It has not become a remotely authenticated or publicly deployable service. Source publication dates and refresh failures remain visible where not verified.

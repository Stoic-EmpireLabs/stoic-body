# Health workspace implementation plan

> For agentic workers: use superpowers:executing-plans inline with TDD and one fresh final reviewer. The user's next-phase request authorizes implementation of the previously reviewed Phase 5 specification. Do not restart discovery or infer completion of Phase 4.

**Goal:** Add source-backed diet comparisons, durable food/body/training logs, and reviewed equipment-aware routines to the local working app.

**Architecture:** Extend the existing transaction/replay/revision contract with owner-scoped health records. Serve curated content locally. Training templates become tasks through the existing scheduler, never silently placed commitments. The Health browser module reuses the app's confirmed-response and retry flow.

**Tech stack:** Existing Node 24, SQLite, TypeScript, browser JS, native Playwright; no new product dependencies.

**Spec:** docs/architecture/product-spec.md nutrition/training contracts; docs/research/phase-5-benchmarks.md; original requirements.md.

## Global constraints

- Preserve private inputs, themes, 25-XP workouts and 15-XP recovery; no food/weight-loss XP.
- No fabricated nutrients, body typing, guaranteed goal date or remote health-data transfer.
- A stored routine is educational starter guidance, not clinical clearance. Unknown/restricted suitability cannot create a generated routine.
- Each research-backed feature must retain source dates/limitations and test evidence. No competitor revenue/rank inference from downloads.

## Review focus

1. Unknown numeric values must not become zero or complete daily totals (Task 1).
2. Unit conversion and repeated same-day measurements must not distort the trend (Task 1).
3. Health-record revision conflicts and retries must not duplicate logs or XP (Task 1).
4. Equipment, session time and suitability constraints must survive direct API calls (Task 2).
5. Browser edits, stale previews and corrected logging must preserve identity and recover after errors (Task 3).

## Task 1: Evidence catalog and durable health records

Files: src/core/health-store.ts, src/core/health-metrics.ts, src/core/health-content.ts, src/core/repository.ts, tests/core/health.test.ts.

Interfaces: Snapshot.health contains {id,kind,revision,archived,data}; health.save creates/updates a strict kind-specific record, health.archive preserves history. Migration adds core_health with owner FK. food has date/title/portion/source and optional nutrients; water uses ml; checkin stores subjective daily context; measurement has metric/value/unit/method; workout stores dated sets/effort/notes. readHealth and summarizeHealth are pure/read-only outputs. Content includes fourteen distinct diet cards with sources, evidence, practical/training considerations and exclusions.

- [x] Write failing cases for valid save/replay/edit/conflict, owner scoping, rollback, malformed dates/units/nutrients, nullable totals and weight means.
- [x] Implement additive schema and strict validation within existing transactions; catalog sources stay separate from user data.
- [x] Run targeted tests, typecheck and lint; commit.

## Task 2: Transparent routines and shared scheduling

Files: src/core/training.ts, repository.ts, tests/core/training.test.ts.

Interfaces: buildRoutine(input) validates adult/restriction/equipment/style/duration inputs and returns eligible/reasons/session/exercises. training.create stores a routine and matching task in one existing command transaction; failure rolls back both. Workout logs reference a saved routine and valid exercise. progressionAdvice uses at least three comparable dated logs and never increases load after pain/high effort; it offers a reviewable cue, not an automatic change.

- [x] RED tests for unknown screening, missing equipment, time bounds, valid cable/bodyweight options, atomic routine/task creation, replay, and conservative progression.
- [x] Implement reviewed starter full-body, upper/lower and push/pull/legs sessions, calisthenics, treadmill walking, non-contact boxing and recovery. High-intensity/sprint/heavy methods remain education with prerequisites where unscreened.
- [x] Run targeted/full tests, typecheck/lint; commit.

## Task 3: Health UI, end-to-end evidence and review

Files: apps/local-pilot/public/health.js, app.js, index.html, styles.css, server.ts, scripts/test-health-pilot.ts, docs/phase-5-health-checkpoint.md.

Interfaces: authenticated GET health-content and POST training-preview; rendering module receives snapshot/command/send helpers. Food create/edit/reuse, hydration, daily context, measurements/trends, evidence comparison, routine preview/save and actual sets are accessible in Health. Scheduling remains reviewed through Plan; routine display links to practice logs.

- [x] Write a failing browser journey for food unknowns/edit/reuse, hydration, measurements, source links, safe routine eligibility, scheduling and logged sets without duplicate XP.
- [x] Implement responsive UI and real API wiring; preserve error/retry behavior.
- [x] Run tests, TypeScript and lint; inspect desktop/mobile; retain synthetic screenshots and source/feature mapping.
- [x] Request one fresh review, grade findings and fix material issues with RED→GREEN regressions.
- [x] Commit, restart the local pilot, open Health and update progress/requirements. Distinguish implemented features from remaining Phase 4/5 acceptance.


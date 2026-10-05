# Adaptive Setup and Complete First Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Recommended execution: native in this session; wait for the user's implementation-plan review.

**Goal:** Turn adaptive choice-based setup into a complete reviewable first week and a clear next action, including recovery of existing questionnaire answers.

**Architecture:** Reuse the local Node/SQLite repository, scheduler, meal catalog, training routines and learning catalog. Add structured setup state and a deterministic plan builder; persist acceptance through the existing command/receipt transaction boundary. Build optional photo visualization separately so it cannot block basic planning.

**Tech Stack:** Existing TypeScript, Node 24, node:sqlite, vanilla browser modules, existing test tooling; no paid service or new database account.

**Spec:** [Approved design](../specs/2026-10-04-adaptive-setup-design.md). Photo implementation is in [its own plan](2026-10-04-goal-visualization.md).

## Global Constraints

- Preserve the accepted black/red/gold identity and user-selectable appearance.
- Preserve all free-text answers verbatim.
- Each account remains isolated.
- No algorithm can make a correct complete calendar from unknown availability; essential unknowns require focused follow-ups.
- No guaranteed physique, medical diagnosis or precise body-fat estimates from photos.
- No paid services, external DB accounts or silent external AI processing.
- Keep owner information under ignored private/; use synthetic test and public examples.

## Review Focus

1. Previously completed 20-question users must retain their answers and confirm mappings instead of repeating setup (Task 1).
2. Changing a parent answer must deactivate irrelevant branches without destroying their saved values (Tasks 1–2).
3. Stale setup/calendar revisions and interrupted acceptance must never create duplicates or partial plans (Task 4).
4. Overnight sleep, DST transitions and sparse available time must produce valid schedules or specific unresolved items (Task 3).
5. Older backups and offline sync peers must fail safely or migrate, never silently drop new structured state (Task 4).

## File responsibilities

- Create `src/core/setup-schema.ts`: question definitions, typed selections, branching, validation and legacy mapping candidates.
- Create `src/core/setup-store.ts`: versioned account setup, persisted branch cursor and migration.
- Create `src/core/life-plan.ts`: deterministic content selection and whole-week proposals.
- Create `src/core/life-plan-store.ts`: previews, acceptance, undo and revision guards inside repository transactions.
- Create `apps/local-pilot/public/setup.js`: shared onboarding/profile choice renderer, summary and plan preview.
- Modify `src/core/repository.ts`, `accounts.ts`, `account-bundle.ts`, `sync-protocol.ts`, `sync-client.ts`, `sync-hub.ts`: storage and command integration, compatibility.
- Modify `apps/local-pilot/server.ts`, `public/index.html`, `public/app.js`, `public/host.js`, `public/styles.css`: routes, entry points, Today and navigation.
- Modify `scripts/build-desktop.mjs`, `scripts/test-desktop.mjs`: ship new assets and verify actual desktop handoff.

## Task 1: Structured answers and existing-user recovery

**Files:** setup-schema.ts, setup-store.ts, repository.ts; tests/core/setup.test.ts.

**Interfaces:** `SetupState {version:2, revision:number, answers:Record<string,SetupAnswer>, cursor:string|null, legacyConfirmed:boolean}`; `SetupAnswer {state:'answered'|'unknown'|'skipped', selections:string[], custom?:string, number?:number, unit?:string, intervals?:AvailabilityInput[]}`. `AvailabilityInput {days:number[], start:string, end:string, timezone:string, kind:'free'|'sleep'|'fixed', title?:string}`. Days use ISO 1–7. `activeQuestions(state):QuestionDefinition[]`; `legacyCandidates(answers:Record<string,Answer>):LegacyMapping[]`; `validateSetupAnswer(questionId,answer,state):SetupAnswer`.

- [ ] Write tests for multi-selection, exclusive single-value choices, contradictory equipment, unit conversion without reinterpretation, invalid intervals, branch activation, empty/unknown answers and verbatim legacy preservation.
- [ ] Run `node --import tsx --test tests/core/setup.test.ts`; confirm missing implementation causes failure.
- [ ] Implement the schema, rules and SQLite migration. Define question IDs once and derive browser rendering from the server-supplied schema. Keep profile v1 data readable. Add `setup.answer` and `setup.confirmLegacy` commands with revision checks and idempotent receipts.
- [ ] Re-run the test file; require all cases to pass. Commit this tested unit.

## Task 2: Adaptive choice interface

**Files:** setup.js, host.js, app.js, index.html, styles.css, server.ts; tests/pilot/adaptive-setup.test.ts.

**Interfaces:** authenticated `GET /api/setup` returns `{state,questions,legacyCandidates}`. Commands use existing `/api/command`. Browser `Setup.init(context)`, `Setup.render(root)` and `Setup.edit(questionId)` share the same renderer. `context` supplies existing element/action/API/navigation helpers.

- [ ] Write UI acceptance cases for fitness-only and learning-only branches, multiple checked options, custom input, Back, Skip, Save for later, restart, changed branches and existing-user mapping confirmation. Include keyboard focus, selected-state semantics, reduced motion and a narrow mobile viewport.
- [ ] Run the new test file and confirm failure before implementation.
- [ ] Implement large selection cards, explicit single/multi-choice labels, editable summary and progress based on the active question path. Use exact numeric/time inputs behind preset/custom choices. Replace duplicate Profile text-area handling with the shared editor.
- [ ] Show **Build my plan from my answers** for completed legacy setup. Ask only unresolved follow-ups; never silently commit guessed interpretations.
- [ ] Run the new test file; require pass. Demonstrate this checkpoint for user review and commit the unit.

## Task 3: Complete week proposal and content details

**Files:** life-plan.ts, setup-schema.ts; tests/core/life-plan.test.ts. Reuse scheduler.ts, time.ts, training.ts, meals.ts and learning-content.ts.

**Interfaces:** `buildLifePlan(input:{setup:SetupState,snapshot:Snapshot,startDate:string,timezone:string,pace:'normal'|'lighter'}):LifePlanDraft`. `LifePlanDraft` includes version, setup revision, calendar revision fingerprint, week dates, proposed goals/tasks/sessions, fixed blocks, milestones, resource/workout/meal details, rationale, assumptions, missing inputs and conflicts. All proposed IDs are stable within one persisted draft. `canAccept` is false while essential scheduling inputs or hard conflicts remain.

- [ ] Write fixtures proving different selections change plan content; schedule uses only available time, protects sleep/family/obligations, includes buffers and prerequisites, and fits training recovery. Verify learning level, equipment, food choices and preparation time affect generated details.
- [ ] Cover DST gap/ambiguity, overnight sleep, no free time, excessive ambition, missing deadlines, imported schedule awaiting confirmation and unknown health inputs. Assert unresolved goals remain visible, not dropped.
- [ ] Run `node --import tsx --test tests/core/life-plan.test.ts`; confirm failure.
- [ ] Build linked goals, milestones and candidate tasks for each selected area. Schedule the first seven local dates using existing conflict/time rules; keep a longer-term roadmap with ranges. Reuse verified exercise/resource content and recipe quantities; do not invent resources or a fully personalized calorie prescription when inputs are insufficient.
- [ ] Implement normal/lighter pace, explain each placement and expose shortfalls with specific choices. Restrictive diet/suitability flags must use existing health checks; planning meal times is separate from recommending a diet.
- [ ] Re-run tests; require pass. Commit the unit.

## Task 4: Atomic acceptance, undo and data continuity

**Files:** life-plan-store.ts, repository.ts, server.ts, account-bundle.ts, sync-protocol.ts, sync-client.ts, sync-hub.ts; tests/core/life-plan-store.test.ts, tests/core/account-bundle.test.ts, tests/core/sync-review.test.ts.

**Interfaces:** `POST /api/life-plan/preview` accepts startDate/timezone/pace and persists a draft. `plan.accept` references its ID and expected revision; `plan.undo` references the accepted batch. Extend authenticated snapshot with setup/plan metadata. Store draft payload and hash for replay to sync peers; peers must validate the same content and revisions.

- [ ] Write tests for double click, repeated operation ID, concurrent edits, stale setup, accepted-plan retry, forced failure halfway through insertion, and multi-account access. Assert acceptance is all-or-nothing and current completed work/XP remains intact.
- [ ] Add backup/restore roundtrips and offline peer replay tests, including old backup migration and explicit incompatible-peer behavior.
- [ ] Run the focused files and confirm the new cases fail.
- [ ] Implement acceptance inside the repository's transaction boundary; do not wrap calls that start nested transactions. Persist goals, tasks, detailed prescriptions/resources and occurrences together. Use stable IDs and existing receipt semantics. Undo removes only untouched generated records; otherwise return a safe partial-change preview instead of erasing history.
- [ ] Re-run focused tests; require pass. Demonstrate generating, accepting, restarting and revising a complete week. Commit the unit.

## Task 5: Plan review and useful Today screen

**Files:** setup.js, app.js, host.js, styles.css; tests/pilot/life-plan.test.ts.

**Interfaces:** render Task 3 draft via `Setup.renderPlan(root,draft)`; use Task 4 acceptance. Today reads accepted occurrences and existing completion commands.

- [ ] Write tests for automatic proposal after final answer, full-week preview, editing an assumption, lighter week, one-click acceptance, first actionable session, partial completion, undo and refresh persistence.
- [ ] Run the test file and confirm failure.
- [ ] Add **Use this plan**, **Change something**, **Try a lighter week**. On acceptance, go straight to Today. Show one prominent next action, today's quests, progress and a readable schedule. Preserve access to Health/Learn/Goals via named sections. Keep details and advanced settings out of the first-action path.
- [ ] Use existing XP amounts exactly once per completion. Provide optional celebrations, reduced motion and calm mode; do not tie XP to weight changes or calorie restriction.
- [ ] Re-run tests; require pass. Demonstrate the complete first-run journey and legacy-user upgrade. Commit the unit.

## Task 6: Release and actual desktop delivery

**Files:** build-desktop.mjs, test-desktop.mjs, download-site/index.html, docs/progress.md, docs/decisions.md.

- [ ] Include new static assets and update package-manifest assertions. Add a packaged fresh-account journey that answers choices, accepts the week and verifies persistence after restart.
- [ ] Run focused new tests, full `npm test`, `npm run typecheck`, `npm run lint`, and `npm run test:desktop`. Fix actual failures; report unresolved scope honestly.
- [ ] Capture the real adaptive setup, plan preview and Today screens with synthetic accounts. Review desktop/mobile accessibility and the first action without assistance. Record measured setup time and friction, with no invented retention claim.
- [ ] Publish the reviewed release to the existing authorized GitHub/Vercel destinations, verify release hash/download, install alongside the old version, update the actual desktop launcher and verify it opens the new release. Preserve local data and a rollback route.
- [ ] Update requirement evidence and remaining launch limitations. Report core planning and photo generation as separate completion states.

## Self-review

Spec sections map to Tasks 1–6; optional photo requirements map to the separate photo plan. All five review risks have explicit tests. Existing commands/XP/time helpers remain authoritative. The image-provider decision cannot block implementation of this approved core plan. No code has been changed by writing this plan.

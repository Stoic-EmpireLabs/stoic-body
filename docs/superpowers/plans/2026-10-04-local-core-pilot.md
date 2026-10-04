# Local working-core pilot implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline. The user's “continue” authorizes further Phase 4 work; this is a reversible local integration of the existing approved design, not selection of a paid host or waiver of native/store/sync requirements.

**Goal:** Open a usable local Stoic Body with real saved onboarding answers, goals, tasks, reviewed schedules and XP.

**Architecture:** Reuse the shared Node/SQLite core behind a loopback-only server and a dependency-light browser client. Keep the separately maintained Next.js app and published Phase 3 preview untouched. Domain commands stay atomic; the client renders only confirmed responses and can recover after a failed request.

**Tech stack:** Node 24, TypeScript, SQLite, browser HTML/CSS/JS and existing Playwright. Add isolated pinned ESLint tooling so the existing shared node_modules junction is not changed.

**Spec:** docs/architecture/domain-contracts.md; docs/architecture/product-spec.md; accepted prototypes/phase-3; docs/phase-4-checkpoint.md.

## Constraints and scope

- No paid service, external database account, public exposure or personal seed data.
- Start empty. Preserve the red/black/gold identity and theme/color settings.
- Use existing core rewards 5/15/25/15/10/30. Partial 25-XP completion follows 0/12/25/0.
- User explicitly reviews a schedule proposal before any batch is saved. Preserve locked appointments and occupied buffers; no silent move of missed work.
- This pilot works while its local server runs. It does not claim native alarms, iPhone synchronization or service-worker offline storage. Automatic launch sync remains required.
- All filesystem writes are local and ignored where they contain personal data. No secrets in logs or exports.

## Review focus

1. Concurrent edits between preview and acceptance must conflict without partial writes (Task 2).
2. Existing version-1 data must survive migration and app restart (Tasks 1/3).
3. Repeated completion and repeated acceptance must not multiply XP or sessions (Tasks 2/3).
4. Untrusted page origins/host headers and user-entered HTML must not access the local account or execute scripts (Tasks 3/4).
5. Missing server, failed writes and narrow-screen/keyboard usage must have recoverable behavior (Task 4).

## Task 1: Goal/task data and real linting

Files: src/core/repository.ts, src/core/validation.ts, src/core/planning-store.ts, tests/core/planning-store.test.ts, tools/quality/, eslint.config.mjs, package.json.

Interfaces: version-2 additive schema, CoreGoal and goal/task metadata in Snapshot. Commands goal.create/update/archive and task.update/archive; task.create gains optional goalId/priority/dependencies. All use existing command receipts, revision checks and outbox transaction. Archive preserves existing history. Planned durations cannot change silently.

- [x] Write tests for goal/task create-edit-archive, owner-scoped references, dependency cycles, stale edits and reopen/migration; run RED.
- [x] Implement additive migration and commands, preserving existing balances and ledger.
- [x] Add pinned ESLint in tools/quality (isolated dependency directory); root lint checks owned core/pilot code and tests.
- [x] Run targeted tests, root tests, typecheck and lint; commit the verified foundation and goal/task slice.

## Task 2: Review, accept and undo schedules

Files: src/core/planning-store.ts, src/core/repository.ts, tests/core/planning-store.test.ts.

Interfaces: repository.proposeDay(ownerId, {date, timezone, startTime, endTime}) returns {proposalId, proposal, warnings}; command schedule.accept persists the stored proposal after verifying a canonical planning-state hash, assigning stable occurrence IDs. command schedule.undo checks every accepted occurrence revision/fraction before removing the proposal's uncompleted sessions; preserve a durable undo history. Manual occurrence creation/move shares overlap checks including prep/travel/buffer. Timezone gaps/folds are explained in preview. Single-occurrence moves require current revision; locked/completed sessions cannot silently move.

- [x] RED tests: preview no mutation; stale/duplicate/partial acceptance; occupied overlap; durable undo conflict; a late write failure rolls back every selected session.
- [x] Implement proposal storage, transactional acceptance/undo and manual movement validation.
- [x] Run targeted and complete tests, typecheck and lint; commit.

## Task 3: Local application service

Files: apps/local-pilot/server.ts, apps/local-pilot/main.ts, tests/pilot/server.test.ts.

Interfaces: startPilot({databasePath, port}) returns {url, close}. Bind only 127.0.0.1. HTTP static asset allowlist and JSON endpoints for bootstrap, snapshot, commands and day proposals. Per-run random HttpOnly SameSite=Strict session plus request token, strict Host/Origin checks, size limits and safe public errors. No external API endpoints, CORS, credentials, AI or remote data transfer. Local owner is derived by service, never request payload.

- [x] RED HTTP tests: empty boot, save/restart, hostile origin/host, absent token, unsupported paths, invalid command and bounded request body.
- [x] Implement service/launcher, local data directory and graceful shutdown; document backup boundary.
- [x] Run targeted and complete tests, typecheck and lint; commit.

## Task 4: Interactive browser pilot and evidence

Files: apps/local-pilot/public/{index.html,app.js,styles.css}, scripts/test-local-pilot.ts, docs/phase-4-local-pilot.md.

UI: Today, Goals, Plan, Profile, Settings. Goal/task forms, real partial/full/undo controls, compact progress, explicit schedule preview/accept/undo, task edit/archive, a 20-question resumable profile, existing theme controller. Local-only status is clear. No invented health forecasts, quotes or sync badges.

- [x] Write and run browser journey RED: empty profile, create goal/tasks, preview/accept, partial/full/undo, reload, edit, keyboard/narrow screen, safe rendering and service-offline error.
- [x] Implement UI consistent with accepted visual direction and labelled fields/errors; use textContent for user data.
- [x] Run browser journey, full tests, typecheck and lint; visually inspect desktop/mobile screenshots.
- [x] Request one fresh read-only review of the complete new slice; fix material findings with RED→GREEN tests.
- [x] Commit, open local pilot, save evidence and update the phase tracker. Report the working slice and remaining full Phase 4 acceptance explicitly.

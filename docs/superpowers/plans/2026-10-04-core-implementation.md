# Stoic Body Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Proposed execution is native in the current workstream; no delegation is selected. Do not execute before the applicable phase approvals.

**Goal:** Deliver a durable, offline-capable daily planner whose completion/XP and account data sync correctly across the first-release devices.

**Architecture:** Proposed Flutter client under apps/stoic_body; isolated domain modules, embedded SQLite repositories and a transactional outbox. Proposed Node/TypeScript sync service under services/sync with authenticated command processing and durable SQLite; separate native reminder adapters.

**Tech Stack:** Flutter/Dart, Node/TypeScript, SQLite, native Apple/Windows APIs; exact package versions and encryption binding validated and locked in Task C01. No paid services or accounts provisioned by this plan.

**Spec:** [Product](../../architecture/product-spec.md), [domain contracts](../../architecture/domain-contracts.md), [platform/sync](../../architecture/platform-and-sync.md), [privacy](../../architecture/privacy-and-reliability.md).

## Global constraints

- Automatic cross-device sync is now required at launch.
- Core scheduling, logging and XP remain useful offline and without AI.
- No purchases, accounts, public publication or irreversible actions without approval.
- No unsupported health personalization, fabricated sources or generated historical attributions.
- Typecheck and lint before claiming code complete; TDD for core logic.
- Preserve existing source; do not import hardcoded founder samples into production.

This is the proposed Phase 4 plan. Phase 3 visuals and this architecture require approval first. Hosting choice and Mac/build access gate relevant execution. No commits or publishing steps are implied by completing a checkbox.

## Review focus

1. Offline retries and two-device completion must converge to one award — C03/C05.
2. DST, midnight, travel and recurring edits must preserve intent — C04.
3. Disk errors and schema upgrades must not silently lose records — C01/C02.
4. Expired/revoked sessions and deletion must not leak or resurrect data — C05.
5. Notification permission and background limits must be visible — C07.

## File and interface map

Create app lib/features/{onboarding,planning,rewards}/ for feature UI and controllers; lib/domain/{models,scheduler,xp}.dart for pure rules; lib/data/{database,repository,outbox}.dart for transactional storage; lib/sync/client.dart for reconciliation; lib/platform/{notifications,secure_storage}.dart for interfaces. Native adapter code belongs under the app's ios/ and windows/ platform directories.

Create services/sync/src/{auth,commands,changes,accounts,storage}.ts and tests/{auth,commands,isolation,recovery}.test.ts. Create contracts/{command.schema.json,snapshot.schema.json} and fixtures/{xp,schedule,sync}/ to share inputs/expected results across languages. Each test file below is under apps/stoic_body/test/ unless another root is named.

Common result types: Result<T> contains value or typed DomainError; DomainError codes include invalidInput, conflict, missingConsent, unavailable and unsupported. Command contains the fields in the domain contract. Receipt contains operationId, status, canonicalRevision and optional conflictId. Profile/Task/Occurrence/Proposal/Completion/XpEvent fields are defined in that contract and serialized by versioned schemas.

## C01 — Native foundations and storage feasibility

Create apps/stoic_body/{pubspec.yaml,lib/main.dart,lib/data/database.dart,lib/platform/secure_storage.dart}; tests storage_test.dart and migrations_test.dart. Output: `Future<Database> openDatabase(DatabaseConfig config)` and `Future<void> migrate(Database db, int targetVersion)`; no global founder seed.

- [ ] Write tests for empty startup, persistence after reopen, foreign-key rejection, transaction rollback, wrong encryption key and interrupted migration preserving the previous schema/data.
- [ ] Run the new tests and record the expected failing implementation boundary.
- [ ] Pin a supported Flutter/Dart toolchain and maintained SQLite/encryption bindings only after validating iOS/Windows support and licenses. Implement local app-private paths, secure key handling and versioned migrations; retain evidence of the encryption probe before any encryption claim.
- [ ] Run `flutter analyze` and `flutter test test/storage_test.dart test/migrations_test.dart`; require zero analyzer errors and all assertions passing. Record package versions and exact build prerequisites.
- [ ] Review the deliverable; do not proceed if either target has no viable persistence/key path.

## C02 — Profiles, goals and transaction boundary

Create lib/features/onboarding/, lib/data/repository.dart and lib/domain/models.dart; tests onboarding_test.dart and repository_test.dart. Interfaces: `Future<Profile> saveAnswer(String profileId, Answer answer, int baseRevision)`; `Future<Receipt> applyLocal(Command command)`; `Stream<Snapshot> watchSnapshot(String profileId)`.

- [ ] Tests: skipped answers survive restart; unknown units block quantitative targets; a synthetic equipment edit changes eligible suggestions; invalid dependency IDs and cross-owner references fail; a forced disk error leaves both domain state and outbox unchanged.
- [ ] Run those tests failing, then implement typed records, validation and a single transaction for state plus outbox.
- [ ] Add resumable onboarding and goal/project/task CRUD using the approved prototype, with explicit empty/error states and keyboard semantics.
- [ ] Run `flutter test test/onboarding_test.dart test/repository_test.dart` and `flutter analyze`; save restart evidence.

## C03 — Completion, XP and rewards

Create lib/domain/xp.dart and lib/features/rewards/; tests xp_test.dart and completion_test.dart. Interfaces: `int thresholdForLevel(int level)`; `LevelProgress levelProgress(int totalXp)`; `int earnedXp(int budget, double fraction)`; completion commands are applied only through C02's repository.

- [ ] Write numerical fixtures: thresholds [0,100,225,375]; budget 25 at fractions [0,0.5,1] yields [0,12,25]; reversal returns zero; invalid fractions fail; equal child budgets [9,8,8] total 25; duplicate command is a no-op.
- [ ] Run failing fixtures, implement requested rules and atomic completion/ledger/outbox updates, and derive attributes/levels from the ledger.
- [ ] Implement calm mode, user-selected rewards and optional grace-day streak displays without XP multipliers or unsafe-health rewards.
- [ ] Run `flutter test test/xp_test.dart test/completion_test.dart` and `flutter analyze`; verify app restart preserves completion, corrections and the entire ledger.

## C04 — Calendar and explainable scheduling

Create lib/domain/scheduler.dart and lib/features/planning/; tests scheduler_test.dart, recurrence_test.dart and proposal_test.dart. Interfaces: `Proposal proposeSchedule(ScheduleInput input)`; `Validation validateProposal(Proposal proposal, Snapshot latest)`; accepted proposals use C02's command path.

- [ ] Tests: adjacent intervals fit; overlapping fixed events are reported unchanged; a 45+10+10 minute task does not fit a 60-minute gap; dependencies cannot cycle; unsplittable tasks stay intact; infeasible work remains unplaced.
- [ ] Add America/Denver 2026-03-08 and 2026-11-01 gap/fold fixtures, zone travel, cross-midnight intervals, exceptions, unknown ICS zone and completed-history series edits. Follow the explicit local-versus-imported recurrence rules.
- [ ] Run failing tests, then implement bounded expansion, stable placement, capacity explanations, recurrence exceptions, drag/keyboard edits, locks and revision-aware undo.
- [ ] Implement morning/evening/weekly review and minimum viable day as explicit proposals, not silent mutations.
- [ ] Run `flutter test test/scheduler_test.dart test/recurrence_test.dart test/proposal_test.dart` and `flutter analyze`; demonstrate missing a task without overloading tomorrow.

## C05 — Authenticated automatic sync

Create services/sync package, contracts/, fixtures/sync/, app lib/sync/client.dart and test/sync_test.dart. Server interfaces: `applyCommands(session: Session, commands: Command[]): Promise<Receipt[]>`; `readChanges(session: Session, cursor: string | null): Promise<ChangePage>`; `revokeDevice(session: Session, deviceId: string): Promise<void>`.

- [ ] Contract tests cover schema/ownership, password/recovery/session lifecycle, replay 100 times, concurrent full completion, stale undo conflict, append-only log merge, expired cursor, deleted-account reconnect and two customers guessing each other's IDs.
- [ ] Run failing tests. Implement reviewed auth/hash library, throttling, rotating revocable sessions, durable SQLite command/result/change transactions and bounded payloads; do not accept client-specified XP totals.
- [ ] Implement local queue replay, canonical reconciliation, 15-second foreground delta polling, resume/reconnect triggers, pending badge and explicit conflict resolution. Do not promise continuous iOS background execution.
- [ ] Define `npm test`, `npm run typecheck` and `npm run lint` for the new service; run all. Run `flutter test test/sync_test.dart` and `flutter analyze`.
- [ ] Use two isolated local clients and an isolated test database: disconnect both, complete the same task, reconnect in both orders, kill/restart server, and assert equal snapshots/one award. Public exposure is not required for this test.
- [ ] Review hosting reachability, TLS, durable disk, backup and authentication before any authorized external pilot deployment.

## C06 — Complete backup, restoration and deletion

Create lib/data/backup.dart and services/sync/src/accounts.ts; tests backup_test.dart and service recovery.test.ts. Interfaces: `Future<ExportManifest> exportData(ExportRequest request)`; `Future<RestorePreview> inspectBackup(String path)`; `Future<Receipt> applyRestore(RestoreApproval approval)`.

- [ ] Tests: round-trip every entity/ledger/reference; wrong password, changed hash, unsafe archive path and unsupported schema preserve current data; stale restore does not resurrect tombstones; credentials never export.
- [ ] Run failing tests, implement staging/confirmation/snapshot and account deletion/revocation semantics, then run app/service tests, analyze/typecheck and lint.
- [ ] Perform a restart-and-restore drill and compare record counts, hashes, XP and next-session state, not just a download alert.

## C07 — Native reminder adapters and integrated core

Create lib/platform/notifications.dart and platform-specific implementations; tests notification_contract_test.dart plus integration_test/core_journey_test.dart. Interface: `Future<ReminderRegistration> reconcileReminder(Reminder reminder, DeviceCapabilities capabilities)`; status never implies observed delivery.

- [ ] Fake-adapter tests cover denied/revoked permissions, duplicate registration, schedule edit/cancel, selected reminder device and native failure.
- [ ] Implement explicit permission flow and Apple/Windows adapters; feature-gate AlarmKit. Use elapsed-time calculations for active timers; notifications are separate OS registrations.
- [ ] Run `flutter test`, `flutter analyze`, service tests/typecheck/lint, then actual iPhone/iPad/Windows foreground/background/terminated/offline/reboot/timezone cases.
- [ ] Demonstrate onboard → accept plan → complete → restart → second-device sync → undo → reschedule → export/restore. Save real-device/build evidence and limitations for Phase 4 review.

Implementation changes trigger their own targeted tests. Do not rerun the legacy browser script against a public site to substitute for these assertions.

Contract type definitions: [interface catalog](../../architecture/interface-catalog.md).

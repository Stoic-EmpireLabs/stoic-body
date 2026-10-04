# Account recovery implementation plan

> For agentic workers: use superpowers:executing-plans inline, with one fresh final reviewer. Follow TDD and commit logical tasks. Current user phase approval authorizes this reversible local implementation; do not add a redundant internal approval gate.

Goal: a client can protect and restore their own complete pilot workspace, including when moving to another Windows computer, while actual automatic sync remains clearly unconnected.

Architecture: fixed-table account bundle, authenticated encrypted export, transactional restore with local recovery points, a Settings module and existing session/CSRF boundary. No provider, dependency installation or public service.

Tech: installed Node 24 crypto/SQLite, vanilla JS and Playwright.

Spec: docs/superpowers/specs/2026-10-04-account-recovery-design.md

## Global constraints

- Keep the current isolated codex/stoic-body-core worktree and owner data. No new external database account or paid service.
- Backup is not sync. No networking or public listening change in this recovery checkpoint. User selected an intermittently available desktop; offline clients and automatic reconnection remain launch work.
- Fixed allowlisted core records only; no SQL/database-file imports or credentials in exports/logs.
- 16 MiB raw account payload, 24 MiB encrypted request/file; two concurrent KDF operations; scrypt 32768/8/3 and AES-256-GCM.
- Seven local points; capture before edits no more than once per hour, and before each restore. Credentials and browser appearance are excluded explicitly.
- Expected workspace fingerprint, backup digest and operation ID protect restore; full transaction rollback and no extra XP.

## Review Focus

- A different account, expired session or stale request must never export/restore another person's data.
- Conflicting edits between preview and restore must preserve both the current workspace and selected file.
- Partial writes, duplicate retries, tampered content and broken relationships must never leave an incomplete workspace.
- Imported content must not execute scripts/SQL or change account credentials, roles or ownership.
- Local recovery must remain honest about disk loss, encryption and missing automatic sync.

## Task 1: Validated account bundles and encrypted files

Files: src/core/account-bundle.ts; src/core/backup-crypto.ts; tests/core/account-bundle.test.ts; research document.

Interfaces: captureBundle(repository, accounts, owner): AccountBundle; validateBundle(unknown): AccountBundle; installBundle(repository, owner, bundle): void within caller transaction; bundleDigest(bundle): string; sealBackup(bundle, passphrase): Promise<Envelope>; openBackup(unknown, passphrase): Promise<AccountBundle>. Fixed schema v1 and application-created validation database; source owner is never imported.

- [ ] Write and run failing mixed profile/goal/schedule/completion/health/learning round-trip, cross-owner exclusion, bad structure/reference/XP and encrypted tamper/passphrase/version tests. Expected: missing implementation.
- [ ] Implement fixed-table capture, allowlisted parameterized install, isolated schema validation and bounded authenticated encryption. Expected: focused tests pass.
- [ ] Run typecheck/lint; commit. Completion command: node --import tsx --test tests/core/account-bundle.test.ts

## Task 2: Transactional account recovery service

Files: src/core/recovery.ts; apps/local-pilot/server.ts; tests/core/recovery.test.ts; tests/pilot/backup.test.ts.

Interfaces: RecoveryStore(repository, accounts, now?) exposes captureBeforeEdit(owner), list(owner), export(owner,passphrase), preview(owner,source,passphrase?), restore(owner,{source,passphrase?,expectedFingerprint,digest,operationId}). Source is uploaded envelope or owner-scoped recovery-point ID. Preview returns current/import counts and fingerprint/digest. Restore returns a receipt/snapshot/guide and stores its idempotency record outside transferred core tables.

- [ ] Failing tests cover full replacement, pre-restore point, fault rollback, stale preview, duplicate retry, owner isolation, hourly capture and seven-point retention. Expected: missing recovery service.
- [ ] Implement new recovery tables, transactional restore and authenticated endpoints; capture before core/guide mutations. Route-specific request size limit and session revalidation after async crypto. Expected: focused tests pass.
- [ ] Run typecheck/lint; commit. Completion command: node --import tsx --test tests/core/recovery.test.ts tests/pilot/backup.test.ts

## Task 3: Settings workflow and delivery

Files: apps/local-pilot/public/recovery.js; app.js; host.js; index.html; styles.css; scripts/build-desktop.mjs; scripts/test-desktop.mjs; tests/pilot/recovery-ui.test.ts; release documentation.

Interfaces: Recovery.init(ctx) / render(root) receives API, DOM helpers, busy state and account-change reload/notification. UI keeps the selected file/passphrase only in memory; preview must be explicit before a restore confirmation. Local status shows no sync connection and how to protect data off-device.

- [ ] Failing browser test: export real file → modify data → upload/decrypt preview → confirm restore → reload → compare goal and XP; wrong passphrase, stale preview and local recovery point. Expected: missing recovery controls.
- [ ] Implement accessible Settings workflow, clear scope/retention copy, restore confirmation, busy/retry handling and secret clearing. Update tour/package allowlist and Windows instructions. Expected: browser test passes.
- [ ] Run npm test, typecheck, lint, existing browser journeys and desktop package smoke. Fresh final review; one correction pass with failing-then-passing regressions. Preserve branch/evidence.
- [ ] Update checkpoint/requirements/progress with actual hosting answer or missing destination. Publish an authorized GitHub prerelease only after verified package evidence. No public sync deployment or full phase-exit claim.

Completion command: npm test


# Desktop sync implementation plan

> Use superpowers:executing-plans inline with one fresh final reviewer. User already authorized continuation and Windows desktop delivery; preserve the current worktree and prior workflow.

Goal: a usable Windows desktop app with durable local work and private, intermittent command sync.

Architecture: existing domain/SQLite core + account-scoped hub grants + durable replica queue + bounded HTTPS transport + Settings UI. Reuse installed dependencies only.

Spec: docs/superpowers/specs/2026-10-04-desktop-sync-design.md

## Global constraints

- Windows first; Apple offline and Store releases remain open. No public database or paid provider.
- 10-minute single-use codes, random 32-byte device secrets, hash-only hub storage, owner derived from token.
- 100 commands/1 MiB upload, 16 MiB account snapshot, 24 MiB HTTP response ceiling; 15-second sync interval and 60-second capped backoff.
- Pairing preview/confirmation and pre-replacement recovery point; preserve local credentials, guide and appearance.
- Atomic commands/queue, semantic XP deduplication, visible conflicts, generation checks and revoked-token stop behavior.
- Preserve existing network routes and personal data. No broad firewall or sleep changes.

## Review focus

Pairing retries and owner substitution; local edits arriving during outbound requests; backup restore/password recovery while sync is in flight; schedule acceptance without its original preview; lost responses and duplicate XP. Add regression tests for each.

## Task 1 — Hub and atomic domain operations

Files: src/core/sync-hub.ts, sync-protocol.ts, repository.ts; tests/core/sync-hub.test.ts.
Interfaces: SyncHub(repo,accounts,now?) exposes issueCode(owner), claim(input), authenticate(token), exchange(token,input), revoke(owner,deviceId), devices(owner), reset(owner). Transaction helper permits CoreRepository.apply/snapshot inside a caller transaction. Wire operation contains Command plus optional original schedule-preview row. Hub authenticates again for each exchange and captures an atomic bundle plus epoch/revision marker.
- [ ] RED tests: one-use retry-safe pairing, cross-account/revoked/password-reset rejection, duplicate completion 25 XP once, stale title conflict, schedule preview transfer and malformed metadata rejection, outer transaction rollback.
- [ ] Implement protocol/allowlists/grants, per-command replay receipts and canonical snapshot exchange.
- [ ] GREEN focused tests, typecheck/lint, commit.

## Task 2 — Durable replica and HTTP integration

Files: src/core/sync-client.ts, sync-transport.ts; apps/local-pilot/server.ts; recovery.ts; tests/core/sync-client.test.ts and tests/pilot/sync.test.ts.
Interfaces: SyncClient(repo,accounts,recovery,transport) exposes apply(owner,command), previewLink(owner,input), confirmLink(owner,input), run(owner), status(owner), resolve(owner,input), disconnect(owner), close(). Local generation guards incoming responses. SyncHub HTTP routes use grants; local Settings routes use current session and CSRF. Recovery restore invokes a transactional reset hook. Production transport validates private HTTPS endpoint and response limits.
- [ ] RED tests: two clients edit with hub unavailable, restart, reconnect in both orders; unique logs merge, completion awards once, conflicting edits retained; mutation during a slow response is rebased; restore/revoke invalidates stale work; endpoint/redirect/size checks.
- [ ] Implement transactions, persistent queues/conflicts/link state, bounded background retry and protected HTTP endpoints.
- [ ] GREEN focused tests and existing recovery tests, typecheck/lint, commit.

## Task 3 — Desktop window, guided device setup and delivery

Files: public/sync.js, app.js, index.html, styles.css, server/main config; desktop launcher/README/build allowlist; browser/package tests; checkpoint/research/requirements docs.
Interfaces: Settings module uses authenticated local APIs, presents pair/preview/confirm, status, devices and retained conflict proposals. Existing app refreshes canonical changes without silently discarding edited form fields. Windows launcher opens Edge --app when installed; desktop shortcut points to its verified launcher. Private HTTPS hosting is an explicit optional setup; preserve existing routes.
- [ ] RED browser tests: pair and preview replacement; offline notice; queued change; sync result and conflict review; account switch. Launcher tests cover window invocation/fallback and persistence.
- [ ] Implement UI/launcher, update help and limits, verify desktop/mobile layout.
- [ ] Full suite, typecheck/lint, existing browser journeys, packaged Windows smoke; one fresh whole-change review and RED-to-GREEN fix pass.
- [ ] Publish verified GitHub prerelease, provide desktop entrypoint and document actual versus simulated device verification. Stop at reviewable checkpoint.

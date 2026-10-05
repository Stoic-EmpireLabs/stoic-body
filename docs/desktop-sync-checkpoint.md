# Windows desktop and intermittent sync checkpoint — 2026-10-04

Stoic Body now has a per-user Windows installer, desktop shortcut and dedicated Edge app window (default-browser fallback). The local service stores progress in SQLite independently of the window. The PC may be switched off. When configured, separate Windows installations save edits locally and reconcile with a private desktop host when reachable.

## Requirements and evidence

| Requirement | Implemented behavior | Verification |
|---|---|---|
| ENTRY03 / desktop request | Verify package hashes, install under LocalAppData, create real Windows shortcut, preserve separate data directory | scripts/test-desktop.mjs: actual COM shortcut, three concurrent starts, signup, stop/restart |
| B11 / intermittent host | Durable per-account command queue, startup/edit/15-second retry with bounded backoff, last success/manual sync | tests/core/sync-client.test.ts: two independent SQLite files, host-off edits, restart, reconnect in both orders |
| T06 / offline core | Accepted domain change and queue are one transaction; UI remains usable without host/network | Queue-write failure rolls back domain change; Windows restart smoke |
| G / XP correctness | Operation receipts and semantic completion deduplication | Two clients complete the same initially incomplete session; total XP remains 25 |
| B06 / privacy | Single-use 10-minute codes, random device secrets, hash-only host grants, account ownership from grant; named revocation | Hub and HTTP tests: alternate owners isolated, retries, expiry, revoked/password-reset grants rejected |
| S / scheduling | Original preview metadata accompanies offline acceptance; conflict retains proposed command | Hub schedule transfer and malformed-preview rollback |
| T01 / recovery interaction | Pre-pairing recovery point, explicit replacement counts, both fingerprints rechecked, local guide/credentials retained | Pair-preview race tests; restore generation hook rejects late sync replies |
| V / guided experience | Settings connection steps, visible unmerged proposals, offline guidance and refresh notice preserving unsaved fields | tests/pilot/sync-ui.test.ts; desktop/mobile screenshots inspected |

Research was refreshed from primary Todoist, TickTick and Tailscale documentation. See [benchmark record](research/desktop-sync-benchmarks.md). Adopted visible offline state, last success, manual retry, account-centered setup and recovery. No proprietary metrics or seller rankings are claimed.

## Verification at implementation checkpoint

- 142/142 automated tests passed; TypeScript and ESLint passed.
- Existing browser journeys: 19 core, 15 health and 13 learning checks passed.
- Windows package smoke passed: 20 manifest-listed files, hash checks, real per-user install and shortcut, concurrent launch, fresh account, stop/restart.
- Desktop and 390px-wide device settings screenshots were visually inspected; no horizontal overflow.
- Sync tests use separate databases and actual HTTP services on the same physical PC. This proves the protocol/restart behavior, not a physical second-device or Apple-device acceptance test.
- A cascading-host bug was reproduced (old pairing code accepted after linking to another host) and corrected; the regression now rejects it. Existing malformed-command validation was also preserved after an observed failure.

Independent final review, installation on the owner's desktop, private route verification and GitHub publication are pending at this document's initial checkpoint. Final results are appended below after execution.

## Boundaries

The Windows application is a local web app in a dedicated desktop window, not a native Windows framework or Store installer. Closing the window leaves the small service running; the included Stop launcher or PC shutdown stops it. No always-on hosting or sleep-setting change is required. Automatic sync works only while the client app service and private host are running and connected.

Private HTTPS uses an existing Tailscale connection. No paid provider, new account, firewall rule or public database is introduced. Independent Apple offline apps, native alarms, account deletion, complete product/privacy review and Store releases remain open. Full Phase 4, 7 and 8 completion is not claimed.

The first protocol uploads at most 100 commands/1 MiB and returns a bounded complete canonical account snapshot (16 MiB account, 24 MiB response limit). Conflicting proposals stay separate and can be copied/re-entered using normal editors or dismissed deliberately. Automatic revision overrides are not used. A replica cannot also host another replica for that account.

Local OS file access can read SQLite, browser sessions and device credentials. Backups exported from Settings are encrypted but exclude credentials and unmerged proposals; copy proposals separately or stop the app and back up the complete private data directory. Themes and guide position remain local; profile answers sync. Old executable versions remain available after updating; downgrading data is unsupported.

## Decisions made

1. Continue the already-authorized checkpoint inline without an extra internal approval gate. Cost if revised: local design changes.
2. Deliver Windows replicas first with the installed SQLite runtime. Cost: the Apple launch milestone remains incomplete.
3. Use bounded full snapshots before compact deltas. Cost: bandwidth and the 16 MiB account ceiling.
4. Keep tour position and theme local while syncing profile answers. Cost: setup position can differ by device.
5. Preserve the development branch and ignored evidence and use prior GitHub publication authorization. Cost: local storage; main and unrelated services remain outside this work.

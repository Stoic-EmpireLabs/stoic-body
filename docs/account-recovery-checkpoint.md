# Account recovery checkpoint — 2026-10-04

Implemented and execution-verified in the local Windows pilot: **Settings → Data & recovery**. Download an encrypted account file, preview its record counts, and confirm replacement of the signed-in account's app data. Seven automatic local recovery points support recovery from accidental changes. A point is kept before restoring.

The host choice is now the owner's desktop, which may be switched off between syncs. The future clients must retain usable local data and reconcile when the desktop returns. This checkpoint does **not** implement automatic device synchronization or independent offline Apple clients. Existing private network services and Windows power settings were not changed.

## Research applied

[Todoist](https://www.todoist.com/help/articles/115001799989) and [TickTick](https://help.ticktick.com/articles/7055792921664028672) place backup/recovery controls within the user's account/settings workflow. Stoic Body adapts that discoverability and adds an explicit before/after record preview. The [dated benchmark record](research/recovery-and-sync-benchmarks.md) distinguishes vendor documentation from independent performance evidence. No proprietary engagement metrics or bestseller rankings are claimed.

## Verification and coverage

| Requirement | Concrete implementation | Evidence |
|---|---|---|
| T01: export and restore | Account-only validated JSON bundle, fixed-table import and encrypted download | `tests/core/account-bundle.test.ts` |
| Account isolation | Source account ownership never imported; credentials, sessions and other owners excluded | Bundle and endpoint tests |
| Safe replacement | Fingerprint and digest rechecked, transactional rollback, pre-restore point and idempotent receipts | `tests/core/recovery.test.ts` |
| Usable recovery | File selection, password errors, current/backup counts, confirmation, stale-preview refusal and cancellation | `tests/pilot/recovery-ui.test.ts` |
| Persistent account access | Current credentials preserved, old sessions revoked after restoration | `tests/pilot/backup.test.ts` |
| Downloadable Windows app | Allowlisted package, fresh signup, concurrent launcher and stop/restart | `scripts/test-desktop.mjs` |

At implementation checkpoint: **127/127 automated tests**, typecheck and lint passed. Existing browser journeys passed **19 core + 15 health + 13 learning** checks. The Windows package smoke passed, and desktop/mobile recovery screenshots were visually inspected. Tests use synthetic isolated accounts.

## Limitations

- Same-disk recovery points cannot protect against disk failure; keep an encrypted download elsewhere. Losing its passphrase makes that file unrecoverable.
- Local SQLite remains readable to someone with access to Windows files. Portable backups are encrypted; the local database is not.
- The versioned file includes profile, goals, tasks, schedule/history, XP, health, learning and guide progress. It excludes credentials, recovery keys, browser appearance and unsupported attachments.
- Maximum account payload is 16 MiB and encrypted upload is 24 MiB. New content/schema versions may require a backup migration; current routine validation rejects incompatible routine definitions safely.
- Automatic iPhone/iPad/Windows synchronization, independent offline Apple clients, native alarms, account deletion, full privacy review and Store releases remain open. This checkpoint does not close Phases 4, 7 or 8 in full.

## Decisions and next phase

Proceed with the approved recovery prerequisite and current isolated branch without another internal approval gate; the cost of changing direction is revising local UX. Retain ignored evidence and the branch, at the cost of local storage. The hosting question has been answered by the intermittent desktop choice, but automatic synchronization remains a separate launch requirement. Reject incompatible saved routine definitions rather than importing malformed plans; future generator changes need explicit migration support.

The next proposed checkpoint implements authenticated synchronization with local client persistence, visible pending changes, conflict handling, revocation and two-device offline/reconnect tests. Keep public exposure and paid infrastructure outside the selected local architecture. No deployment is represented as complete by this document.

Final independent review and release evidence will be appended after verification.

## Final review and correction evidence
Independent review of 338002d2..d0c7998 found four Important issues and no Critical or Minor findings. A single correction pass reproduced every failure before fixing it: coherent WAL snapshots across writers, cancelled-session/batch integrity, retries after retention prunes the source, and receipt reconciliation after a lost response or cookie. Five new regression tests now pass. Final suite: **132/132**, typecheck and lint pass. The reviewer independently reran six focused tests; broader browser and packaging evidence was executed by the implementer.

Remaining review boundaries: required sync/offline clients are not implemented; direct OS access can read local SQLite; future course/routine changes need versioned migrations; benchmark and package claims rely on documented primary sources and executed checks. No minor findings are deferred.

## Published Windows prerelease
[Download v0.3.0](https://github.com/Stoic-EmpireLabs/stoic-body/releases/tag/v0.3.0-local-pilot). Published source: 75c5482e1cc179b93233dc3229f97febf7bad892. The corrected Windows package passed fresh concurrent-launch/signup/stop/restart smoke. All 17 allowlisted application/runtime files were verified against manifest hashes inside the ZIP (18 files including manifest).

GitHub confirms uploaded assets, prerelease status and the source commit. Direct ZIP HEAD returned HTTP 200 and 34,796,626 bytes. GitHub's digest and the downloaded checksum file match the verified local ZIP: 2e82958f0add96e148c2605d4cbd61bd665b74fded221f8285ec9e46d58e451e.

Source pilot was restarted and its identity endpoint confirms version 0.3.0-local. Real user data was not seeded or restored by tests. The development branch is pushed; main and the separate Vercel prototype were not changed.

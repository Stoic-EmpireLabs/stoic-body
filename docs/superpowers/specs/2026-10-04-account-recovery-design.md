# Account recovery and sync preparation

The next-phase request approves continued implementation. The latest checkpoint names authenticated device sync and launch reliability. The existing zero-paid-service/no-external-database-account rule remains, and a hosting clarification is pending. This reviewable subphase implements the independent recovery prerequisite and a concrete sync deployment decision packet. It must not pretend that a backup transfer is automatic sync.

## User experience

Settings gains a Data & recovery area. A signed-in client can download a passphrase-encrypted account backup, inspect a selected backup without changing anything, compare its counts with their current workspace, and explicitly restore it. Restore replaces only the signed-in account's app records; credentials remain those of the destination account. A pre-restore recovery point protects the prior workspace. New computers can restore into their own freshly created account.

The app keeps up to seven local recovery points, captured before edits at most once per hour and always before a restore. Local recovery points share the SQLite database and do not protect against disk loss; the encrypted downloaded file can be kept separately. Show that distinction. Recovery points include profile, goals, tasks, calendar/history, XP ledger, health, learning, operation/outbox history and guide progress. They exclude passwords, recovery keys, sessions, other accounts, browser appearance and unsupported attachments. Unsupported items must be disclosed before export.

## Safety and architecture

Only fixed application tables/columns are transferable. Never execute imported SQL or open an uploaded SQLite file. Parse bounded JSON into a clean, application-created in-memory SQLite schema; validate types, foreign keys, JSON structures, XP/completion consistency, schedule references and timestamps before presenting a preview. Import maps records to the authenticated account; imported owner IDs are not accepted. Account/session tables never travel.

The file envelope uses fixed scrypt N=32768/r=8/p=3, random 16-byte salt, AES-256-GCM, a random 12-byte nonce and 16-byte authentication tag. Passphrase is 15–128 characters; no passphrase is logged or persisted. Reject unsupported versions, malformed encodings, excessive depth/size, bad passphrases and tampering. Bound expensive crypto to two concurrent operations. Maximum decrypted payload 16 MiB, maximum file/request 24 MiB; reject before allocating or decrypting larger files.

Restore validates the preview's current-workspace fingerprint and the selected backup digest again inside its transaction. If another tab changes data or guide state, refuse with a new-preview instruction. Atomically preserve the previous workspace and replace the selected account's records; any failure rolls back both. Repeated confirmed restore identifiers are idempotent. Restoring never adds a new XP award. After successful restore, reload app modules and other signed-in tabs so stale drafts cannot write into restored history.

Automatic recovery failures must not silently erase or replace data. Existing profile/goal/health behavior stays intact. Owner records and real local data are never seeded by tests. Packaging continues through the existing allowlist and GitHub prerelease workflow.

## Sync boundary and acceptance

Research Todoist/TickTick recovery and visible sync status through official sources. Produce a provider-independent next-step contract and hosting decision with costs/operational requirements. Do not expose loopback, ULTRON, or a public SQLite endpoint. A sync host, TLS route and authenticated multi-device adapter remain necessary. Current settings must say local-only until real device exchange is implemented and verified.

Acceptance: mixed complete workspace round trip under a different account; no credentials/other-owner leakage; bad-password/tamper/version/foreign-reference/malformed-data refusal; conflict and uncertain retry safety; pre-restore rollback; seven-point retention; browser download/preview/confirm/restore/reload and keyboard/mobile controls; existing regression suite; packaged Windows smoke. Current network hosting question does not block these independent changes.

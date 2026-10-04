# Privacy, trust boundaries and recovery

Phase 2 design • 2026-10-04. This is a proposed security design with a scoped source assessment, not a completed repository security scan or evidence of production protection.

## Data classification and consent

Health data, body photos, personal calendars, family references, research documents and account credentials are private. Public bundled content contains only reviewed general education and synthetic examples. The existing implementation's hardcoded owner-like fixtures must not enter release builds; see the [baseline assessment](baseline-assessment.md).

Automatic sync means selected personal records travel to the Stoic Body server. Explain this during account setup; give attachment/photo sync a separate control, default off until selected. Scheduling/logging records sync automatically for the signed-in account. Never claim “zero cloud exposure” for synced records. The first proposed architecture uses TLS and protected storage, not end-to-end encryption; the server operator can technically access plaintext needed by the service. End-to-end encryption would require a separate key-recovery and conflict-processing design.

External AI sharing is separately opt-in, with payload preview and provider/cost disclosure. Sync consent is not AI consent. Local logging continues when either service is unavailable or declined. Consent withdrawal prevents future sharing; it cannot recall data already received by an external provider.

## Boundaries and failure cases

| Boundary / threat | Required control | Verification |
|---|---|---|
| Another customer guesses a record or attachment ID | Session-derived owner scope on every query/command/download; deny by default | Two-account tests across all endpoints and batch items |
| Duplicate or tampered commands | Schema validation, size limits, server-calculated XP, operation uniqueness and revision checks | Replay, concurrent completion, forged XP and malformed-number tests |
| Lost/unlocked device or stolen session | OS key storage, app lock option, generic notification previews, short-lived access tokens and revocable rotating refresh tokens | Lock/unlock, revoke, expiry, rotated-token reuse and offline-state checks |
| Password compromise | Reviewed authentication library; salted Argon2id password storage; throttled login/recovery, generic errors | Rate-limit, enumeration and recovery tests; no custom crypto |
| Uploaded executable, huge image, malicious PDF or prompt injection | Allowlist by decoded type and size, bounded parsing, sandbox/process limits, inert preview, no macros/scripts or auto-followed links | Mismatched extension, malformed/oversized/decompression fixtures; imported instructions remain data |
| Cross-device schedule race | Revision-checked proposals; retained competing values; no timestamp winner from client clock | Offline edits, undo-versus-complete and travel/DST conflicts |
| Server disk/process failure | Durable disk, transactional writes, tested backups, monitored disk limits and graceful rejection | Kill during commit, disk-full simulation, restore to isolated environment |
| Sensitive diagnostics or accidental publication | Allowlisted diagnostics only; scrub paths/notes/media/token values; synthetic public fixtures | Inspect logs, source/build bundles and screenshots |
| Deleted record reappears | Tombstones, account revocation epoch, cursor expiry and restore confirmation | Long-offline device reconnect and stale-backup replay |
| Notification claimed active when registration failed | Distinct permission/registration/test statuses and visible error | Native adapter failures plus actual-device observations |

Authentication implementation must follow current primary guidance and be reviewed before launch. A dependency choice is not proof of security. [OWASP authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [file upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## Storage and account lifecycle

Use app-private local directories outside source, OneDrive project folders and temporary runtime directories. Keep keys/tokens in platform secure storage, never localStorage or JSON backups. Select and validate a maintained SQLite encryption binding for each native target before health-photo release; encrypt attachments with a reviewed authenticated-encryption library and keys protected by platform facilities. Do not advertise encryption until filesystem and device tests prove it. Server volumes/backups must have verified encryption-at-rest and restricted access; this does not prevent authorized server access.

Proposed account method is username/password with a reviewed password-hashing implementation, optional later passkeys, and user-held recovery codes. No email provider/account is assumed. Recovery codes are displayed once, stored hashed server-side and revocable; support cannot bypass identity checks. A production authentication review and recovery usability test are launch gates. Sign-out offers removal of that device's cached data; it does not delete the whole account. Revocation prevents future sync but cannot remotely erase a device that never reconnects.

An adult account may contain parent-owned family planning goals. The first release does not ask children to register or collect unnecessary child health/photos. Exact selling regions and age eligibility remain commercial decisions before public launch.

## Export and restoration

Full backup includes all domain records, revisions, XP ledger, relationships, confirmed import provenance and selected original attachments. A versioned manifest records counts and hashes. Export options: readable JSON/CSV for portability, or an encrypted full archive for restoration. Plaintext exports display their sensitivity before saving. Tokens, passwords, device private keys and store receipts are excluded; purchased rights are restored through store adapters.

Restore parses into a staging database, validates schema/counts/hashes/foreign keys, shows contents and conflicts, then requires explicit confirmation. Wrong password, corrupt payload, unsafe paths or a newer unsupported schema leave active data unchanged. Keep a reversible pre-restore snapshot. Online restore is a new revision set, not permission to overwrite newer server data silently. Other devices must rebase pending changes; tombstones remain effective. Backup is not a sync merge strategy.

Proposed recovery objectives for the initial service: daily encrypted server backup; recovery-point objective 24 hours; restore-time target 4 hours in an operator drill. These are unmeasured operational targets, not customer guarantees. Owner consent and an approved backup destination are prerequisites; no backup account/service is created in this phase.

## Deletion

Deleting an item propagates its tombstone and removes active attachment access. Account deletion requires reauthentication and a reviewable confirmation, revokes sessions and schedules server purging. Proposed policy: active records purged within 7 days, isolated encrypted backups expire within 30 days; production policy and regional requirements must be reviewed before launch. Offline devices remove cached account data after receiving deletion/revocation; explain the disconnected-device limit. A restored backup must replay deletion records before serving traffic. Local-only exports created by the person remain their responsibility.

## Reliability acceptance gates

Every supported command must have meaningful failure/retry tests. A saved UI state is not enough: terminate/restart app and server, reconnect a second device, and compare canonical records and XP. Test migration from the previous schema against a copy before replacing active data. Block unsupported future schemas rather than discarding fields.

Require meaningful assertions in end-to-end tests, not just locating an element object or printing a PASS label. Verify keyboard/reader behavior on the native targets, alarm delivery through actual observations, and export/restore by round trip. Reproducible evidence must record commit/build, OS/device, input, expected result, actual result and limitation. No deploy, store submission or irreversible data cleanup is performed merely to validate a document.

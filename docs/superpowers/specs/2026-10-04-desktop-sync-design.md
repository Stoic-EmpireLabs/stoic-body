# Desktop app and intermittent sync

User approval: continue from the recovery checkpoint. Latest steering explicitly asks for a usable desktop app when done. Prioritize Windows: a shortcut, a dedicated app window, SQLite persistence and an optional private desktop hub. The hub may be off; local work and queued changes survive restart. iPhone/iPad offline clients remain an unfulfilled launch milestone, not a capability of this Windows checkpoint.

## Selected approach

Reuse the tested local Node/SQLite domain engine and Windows distribution. A signed-in account can issue a ten-minute, single-use device code. Another Windows installation connects to the private HTTPS hub, previews the selected account and confirms replacement of its local app data. Login credentials remain local. Keep a recovery point before replacing data. The hub is canonical; device commands are durable and replay-safe. No paid provider, external database account, dependency installation or public endpoint is required.

Alternatives considered: a browser IndexedDB rewrite duplicates current domain rules; a new Flutter client requires a separate toolchain/UI and Apple build path. Both remain possible for Apple. Direct network sharing of a SQLite file is rejected. Full snapshot replacement without a command queue is rejected because it loses concurrent work. Version 1 sends commands and returns a validated complete canonical snapshot instead of compact deltas: easier to verify, at the cost of bounded payload overhead; optimize only after correctness.

## Behavior and boundaries

- Every accepted local command and queue entry commit together. Profile, goals, tasks, schedule, XP, health and learning participate. Guide/tour and appearance remain device-local.
- Pairing requires explicit account-scoped host code, a named device, stable request identity and a cryptographically random device secret. Server stores only its hash. A consumed code permits retry only for the same device/secret. Owner comes from the grant, never request fields. Device credentials never enter backups or public status.
- Pairing preview contains counts; confirmation rechecks both local fingerprint and remote revision before replacing data. Reject self-pairing and linking a device that is itself hosting other devices. Preserve previous records in a recovery point.
- Client uses HTTPS .ts.net endpoints on the private network; no redirects, userinfo, query, arbitrary paths or insecure remote HTTP. Loopback HTTP exists only under explicit automated-test configuration. Requests time out and responses are size-bounded.
- At most 100 commands / 1 MiB per upload; full account snapshot maximum 16 MiB. Each command has a stable ID, original base revision and schedule-preview metadata when needed. Same completion on two devices earns once. Stale edits/undo remain explicit conflicts; do not choose winners by device clocks.
- Connected clients sync after a local command, on startup and periodically (15 seconds, capped retry backoff to 60 seconds). New local edits while a request is pending are rebased atomically on the canonical snapshot and stay queued. Keep rejected/conflicting proposals visible. User may accept the hub version or reopen an ordinary editor with the retained proposal; no automatic overwrite or unconditional conflict retry.
- A local generation and authenticated-device epoch prevent responses from before restore, disconnect or re-pair from overwriting newer state. Restoring account data disconnects linked replicas and revokes hosted grants. Password recovery invalidates grants tied to prior credentials. Revoked devices retain local records but stop syncing and show the reason.
- Settings shows last successful sync, queued changes, conflicts, host/device identity and reconnect instructions. No misleading 'synced' label on an unverified connection. Backup remains available.
- Windows launch uses an installed Edge application window when available, with a normal browser fallback disclosed. Provide a reversible desktop shortcut; preserve users' existing databases and other running apps. This is a packaged local web application, not a signed Store installation or native Apple app.

## Verification

Use isolated databases and actual HTTP clients to verify two replicas with the hub off, edits and completion after restart, reconnection in both orders, duplicate uploads, conflicting edits, in-flight local edits, account isolation, revoked/password-reset credentials, restore generations, malformed schedule metadata and transport restrictions. Run browser pairing/preview/status/conflict journeys and Windows launcher/restart tests. Inspect the packaged archive and verify GitHub publication. Private hosting is verified separately and never inferred from a saved URL. Real second-device Apple/Windows access needs that device; do not call synthetic clients physical-device verification.

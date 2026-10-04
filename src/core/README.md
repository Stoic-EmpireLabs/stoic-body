# Shared core foundation

Private Phase 4 implementation in progress. These modules do not replace the current app context, API routes or visual prototype.

- `xp.ts`: pure fixed rewards, partial awards, level math and split-budget arithmetic.
- `repository.ts`: local Node SQLite fixture/server foundation. Mutations, XP, replay receipts and outbox insertions share one transaction. Caller-supplied owner IDs are trusted internally; an authenticated transport is not implemented. No encryption claim.
- `scheduler.ts`: bounded, deterministic proposals using pre-expanded UTC availability and reservations. All tasks stay whole. Earliest/deadline bounds cover occupied time, including preparation/travel/buffer. Does not accept proposals or mutate records.
- `time.ts`: explicit local wall-time resolution for 1970–2100, using the runtime's IANA timezone data. Generated imported recurrence gaps are skipped; user gaps are previewed shifted forward. This is not a recurrence engine or an ICS DATE-TIME/DTSTART parser. See RFC 5545 sections 3.3.5 and 3.3.10; their gap rules differ.

The current database and TypeScript interfaces are an internal subset, **not the complete versioned client/server API contract**. Complete schema/fixtures, migrations, auth, conflict reconciliation and approved-client integration precede exposure or release. No production database is migrated by these tests.

Run `node --import tsx --test tests/core/*.test.ts` and `node --import tsx scripts/verify-core.ts` from the worktree. See `docs/phase-4-checkpoint.md` for the evidence and remaining decisions.

# Shared core foundation

Private Phase 4 implementation in progress. These modules do not replace the current app context, API routes or visual prototype.

- `xp.ts`: pure fixed rewards, partial awards, level math and split-budget arithmetic.
- `repository.ts`: local Node SQLite repository. Mutations, XP, replay receipts and outbox insertions share one transaction; snapshot reads are consistent. Internal callers provide a trusted owner. The loopback pilot supplies its local owner independently of requests; remote account authentication and encryption remain unimplemented.
- `planning-store.ts`: additive goal/task metadata migration, revision-aware edits/archive and owner-scoped dependency validation.
- `schedule-store.ts`: stored previews, atomic acceptance against a planning-state hash, retained cancellation on undo, conflict checks and explicit session moves/locks. No silent rescheduling or recurrence expansion.
- `scheduler.ts`: bounded, deterministic proposals using pre-expanded UTC availability and reservations. All tasks stay whole. Earliest/deadline bounds cover occupied time, including preparation/travel/buffer. Does not accept proposals or mutate records.
- `time.ts`: explicit local wall-time resolution for 1970–2100, using the runtime's IANA timezone data. Generated imported recurrence gaps are skipped; user gaps are previewed shifted forward. This is not a recurrence engine or an ICS DATE-TIME/DTSTART parser. See RFC 5545 sections 3.3.5 and 3.3.10; their gap rules differ.

The database and TypeScript interfaces remain an internal subset, **not the complete versioned client/server API contract**. Additive v1→v2→v3 migrations are tested against existing records. Complete contracts, remote auth, device conflict reconciliation and approved-client integration precede public exposure or release. No production database is migrated by these tests.

Run `npm test`, `npm run typecheck`, `npm run lint` and `npm run test:pilot` from the worktree. See `docs/phase-4-local-pilot.md` for current evidence and remaining scope, and `apps/local-pilot/README.md` to run the browser pilot.

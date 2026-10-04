# Shared-core checkpoint review

2026-10-04. A fresh review agent inspected the uncommitted core source and tests read-only, with no implementation delegation. It ran the then-current 33 tests successfully and identified three concrete defects. This is an intermediate review of the implemented subset, not the full Phase 4 acceptance review.

| Finding | Verification of defect | Fix and result |
|---|---|---|
| Snapshot could mix revisions from different commits | New test uses two file-backed connections in WAL mode; writer commits between occurrence and XP reads; test failed on mixed state | Snapshot now holds one read transaction; regression passed and a later snapshot sees the new commit |
| Answer state array could be persisted as an enum | Arrays containing answered/skipped/unknown failed the rejection test | Require actual string enum values; unchanged-state assertions passed; units also require a string |
| SQLite automatic rollback masked the full-disk error | Real SQLite page limit produced an implicit rollback; original code returned “cannot rollback” | Only roll back an active transaction; the full error remains visible, prior snapshot is preserved, and writes resume after capacity increases |

The latter two were initially graded Minor by the reviewer, and regraded Important because they affect profile and recovery correctness. All three received a failing regression before the correction. Full post-fix suite: **60 passed**, including **36 core tests**. TypeScript passed. There was no second review dispatch; tests verified the fix pass.

Not covered: public authentication/authorization, actual two-device automatic sync, native encryption or reminders, complete recurrence expansion/ICS parsing, proposal acceptance/undo, production migrations, deletion, export/restore or commercial launch. These remain tracked requirements.

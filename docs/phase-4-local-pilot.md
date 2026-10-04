# Phase 4 — local working pilot

The user requested “continue” after the shared-core checkpoint. This slice makes the approved design usable locally, with a real database and no service purchase or external account. The target native apps and automatic launch sync remain requirements.

## Working flow

**Goals → task → schedule preview → acceptance → Today → completion → saved XP.**

- Goal/task creation, edits, archive and restore. Archiving preserves history.
- Twenty resumable profile questions with answered, skipped and unknown states. Availability can prefill the scheduling window; health prescriptions remain unavailable.
- Planning with preparation/travel/buffer, priorities and prerequisites; existing sessions stay reserved. Infeasible work remains unplaced.
- Explicit fixed-session time preview, protected sessions and reviewed moves.
- Atomic schedule acceptance, replay protection and undo of untouched accepted plans. A changed calendar invalidates an old preview.
- Half/full completion and award correction, with persistent level progress.
- Responsive Today, Goals, Plan, Profile and Settings screens, using red/black/gold and the accepted theme controls.
- Clear connection errors, same-operation retry, and a reconnect flow.

Start it with `npm run pilot` and open `http://127.0.0.1:4330`. [Run and data guide](../apps/local-pilot/README.md).

## Implementation decisions

The existing Node/browser tools enable a reversible local review flow while the client/hosting questions remain unresolved. This is not an assertion that the user selected a final web-only release. Native and commercial architecture can reuse the command and domain contracts; adapter/porting work remains.

The owner-controlled local SQLite route follows the existing zero-paid/no-external-DB constraint. It is not exposed to iPhone or public traffic. The service binds to loopback, checks exact Host/Origin, uses a per-run local browser session and request token, and restricts static assets to an allowlist. Real multi-customer identity, session/device revocation and internet hosting are separate work.

SQLite migrations add goal/task metadata and schedule history to existing version-1 records. Undo cancels sessions with retained records; it does not delete the accepted plan or ledger. A consistent read transaction keeps state and XP from different commits out of one snapshot.

## Evidence

Verification passed on 2026-10-04: **77 tests**, **19 browser journey checks**, TypeScript and scoped ESLint. The test total includes six browser recovery regressions. [Review and verification](evidence/phase-4/local-pilot/review-and-verification.md), [journey results](evidence/phase-4/local-pilot/browser-checks.json), [desktop](evidence/phase-4/local-pilot/desktop.png) and [mobile](evidence/phase-4/local-pilot/mobile.png) are retained. Browser data is synthetic; the personal pilot starts empty.

A fresh reviewer found two Important and one Minor recovery defects. All three were fixed in one pass after reproducing failures; the invalid-timezone defect was treated as Important because it broke the daily screen. A related rejected-move defect and an invalid-token byte-length case also have regressions. This is a scoped review, not a production security or native-device audit.

| Requirement group | Implemented evidence | Remaining scope |
|---|---|---|
| D01 / D02 / D03 | Profile question states persist; availability affects Plan inputs; goal/task forms | Complete personal plan generation and all typed constraints |
| S01 / S03 / S05 / S07 / S08 / S09 / S10 | Linked goal/tasks, day scheduling, completion, conflict-safe acceptance, locks, moves and undo | Projects/milestones, recurring calendar views, energy preferences, full recurrence/import semantics |
| G02 / G03 / G05 / G06 | Requested fixed rewards, fractional awards, levels, replay/correction and recovery rewards | Attributes, milestone/split persistence, reward unlocks and calm/streak settings |
| T01 / T06 / T08 | Local persistence, isolated owner queries, origin/token checks, network-free server core, tests/typecheck/lint | Encryption, backup/restore, authenticated remote/offline clients |
| B11 / T04 | Durable command/outbox prerequisites | Automatic device sync and real native reminder delivery remain unimplemented |

This is a working local pilot. Full Phase 4 and its exit approval remain open; Phase 5 has not begun.

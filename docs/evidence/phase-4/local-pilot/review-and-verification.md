# Local pilot verification — 2026-10-04

Scope: the shared core, loopback service and local browser pilot on codex/stoic-body-core. Whole-branch base: 138c742. Browser/service fixtures use synthetic data and isolated databases. No test wrote to the personal pilot database. No public deployment occurred.

## Executed checks

| Check | Result | Evidence |
|---|---|---|
| `npm test` | 77 passed, 0 failed | 24 legacy cases; 47 new core/service cases; six browser recovery cases |
| `npm run typecheck` | Exit 0 | Current root TypeScript configuration |
| `npm run lint` | Exit 0, no warnings | src/core, tests/core, tests/pilot, apps/local-pilot, verification scripts |
| `npm run test:pilot` | 19 checks passed | browser-checks.json; real loopback HTTP and temporary file-backed SQLite |
| Desktop and 390px browser views | Inspected | desktop.png and mobile.png; no horizontal overflow or browser runtime error |

The browser journey covers empty state, literal rendering of hostile-looking markup, goal/task creation, schedule preview/acceptance, fractional/full/corrected XP, reload persistence, skipped onboarding answers, appearance persistence, failed-save retry, protected sessions, reviewed movement, task edits/archive/restore, availability-driven planning and untouched-plan undo. Keyboard reachability is a smoke check, not a complete accessibility audit.

## Fresh review and one fix pass

A read-only review by review_local_pilot independently ran 47 core/HTTP tests and reproduced these problems with in-memory browser scenarios. The implementer did not request a second review.

| Finding | Ruling and correction | Regression evidence |
|---|---|---|
| Important: rejected goal/task edits become creates | Retain editing identity until confirmed success. A corrected input updates the original record. | Goal and task tests first failed with two records, then passed with one original ID. |
| Related premature move reset | Clear movement context only after a confirmed move. | Overlapping move rejected; corrected time moves the original session without adding a third record. |
| Important: retry rejection leaves saving disabled; reconnect hides retry | Retain pending operations for uncertain outcomes/session renewal; clear definitive rejections. Reconnect keeps an unresolved retry visible. | Conflict-after-network-failure and session-renewal retry both reproduced RED, then passed. |
| Reviewer Minor: invalid timezone breaks Today | Regraded Important for daily-screen availability. Adopt timezone/date only after successful proposal validation. | Invalid zone originally threw RangeError; now accepted sessions still render without runtime errors. |
| Implementer follow-up: non-ASCII token length reports false storage failure | Compare byte lengths before timingSafeEqual. | Equal character count but unequal UTF-8 length originally returned 503; invalid token and cookie now return 403. |

No Critical findings were reported. Every reported defect in this implemented slice was corrected. This does not prove absence of other defects.

## Explicit verification boundaries

Native builds, closed-app alarms, remote auth/sync, encryption, recurrence expansion, restoration, account deletion, health recommendations and store delivery remain outside this slice and unverified. Loopback sessions are not multi-customer authentication. Network retry here means a browser reconnecting to its local server; device convergence and service-worker offline storage remain unimplemented. The historical Phase 3 Vercel preview still uses simulated data.

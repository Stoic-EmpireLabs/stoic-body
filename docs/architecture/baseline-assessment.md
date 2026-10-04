# Existing implementation: reuse and gaps

Inspected 2026-10-04. Source snapshot: commit 0ae4e755be195998839068be002236caf3f3e6fc; [file hashes](baseline-snapshot.json). Source files were separately created in this shared project and are preserved. Commit titles claiming phases do not establish phase approval in this chat.

## Actual checks

- `npm test`: **15 tests passed**, 4 suites, no failures. These are existing tests, not complete requirements acceptance tests.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: **exit 0**.
- No lint script is declared. Lint was not run and is not reported passed.
- Read-only source and test review; no app production build, public deployment probe, native-device test or privacy audit was performed.
- The existing `tests/e2e-verify.mjs` targets a public URL and clicks actions. It was **not run** during this review. Several “verified” messages follow locator creation without an assertion; its final success message is insufficient evidence of those claims.

## Findings and required disposition

| Area | Source evidence | Meaning for the production plan |
|---|---|---|
| Visual starting point | Eight Next.js routes, navigation/header, purple/charcoal cards, set buttons and a round timer | Useful reference for Phase 3, not approved final navigation or native behavior |
| Persistence | UI state is largely component `useState`; context stores XP/calm mode in localStorage. No client fetch to `/api/state` was found | Completion, logs and ledger are not an integrated durable source of truth |
| Server state | `src/app/api/state/route.ts` reads a fixed founder and accepts task/XP mutations without owner authentication in the handler | Not a multi-customer sync API; do not expose it as one. Deployment exposure has not been tested |
| Server durability | `src/lib/db.ts` uses `/tmp` when VERCEL is set | Temporary-file selection is not evidence of durable hosted storage or replication |
| XP contract | `src/lib/gamification.ts` has 100–3500 tier points, multipliers/combos and a 1000-XP first level | Conflicts with the user's 5/15/25/30-point system and 100-XP first level; requires replacement or explicit later rule change |
| Duplicate rewards | Repeated reward buttons and in-memory completion guards; no shared semantic occurrence ledger | Reloads/concurrent devices/retries can award again; a negation helper is not transactional undo |
| Scheduling | `src/lib/scheduling.ts` sums durations/buffers; calendar uses a hardcoded waking window | No interval placement, timezone/DST, dependencies or meaningful lock/conflict system; differs from owner's preferred routine |
| Personal data | `src/lib/db.ts` and multiple UI routes embed owner-like profile values and named personal projects in tracked source | `/private/` being ignored does not protect these copies. Release must use synthetic fixtures; existing publication/history status is unresolved |
| Health personalization | Diet windows, targets, training intensity and measurements are prefilled without the missing screening/units | Must not be presented as an approved personalized plan. Existing tests encode some of these defaults |
| Cheer and DIY | Training/seed contain lifting/catching cues; quest source claims verified mechanical specifications without cited evidence | Replace with the coached cheer pathway and source-confirmed model/site-specific DIY resources before use |
| Photos/security | `src/app/progress/page.tsx` attachment control only shows an encryption-success alert | Photo storage/encryption is simulated; user-visible claim is unsupported |
| Commerce | `src/app/settings/page.tsx` restore button displays an alert; founder mode is always true | No verified purchase/restoration/entitlement integration |
| Backup | Settings exports only user label, XP and in-memory transactions | Not a full-data backup; no restoration path found |
| Measurements/content | Weight average has no timestamps; content sources are not wired into a reviewed evidence system | Cannot substantiate rolling-date windows, individualized ETA or daily quote provenance |

## Production blockers, in order

1. Keep owner data and unsupported health, cheer, encryption and commerce claims out of any new public/demo build. Review existing exposure separately before release; do not assume it is private.
2. Establish one transactional domain model with account isolation, local storage and authenticated sync.
3. Implement the requested scheduler and XP rules with restart/retry/conflict evidence.
4. Build onboarding/screening and reviewed content before personalized health recommendations.
5. Prove alarms, complete export/restore, accessibility and store behavior on selected devices.

No source fixes or live publication changes were made in this Phase 2 documentation task. This assessment is a bounded design input, not a claim that every defect or security issue has been found.

# Phase 4 execution ledger

Started 2026-10-04 following direct user approval: “Great.Next phase”. Phase 3 red/black/gold and theme controls are accepted for progression.

Worktree: `C:/Users/stoic/AntigravityWorkspace/worktrees/stoic-body-phase4`, branch `codex/stoic-body-core`, base `138c742`. Native worktree creation returned “Not a git repository” because the chat starts on Desktop; created a Git worktree for the actual repository instead. Existing dependencies are reused through a node_modules junction; no dependency installation or environment credentials copied.

Baseline: 24 existing tests passed, TypeScript passed. These tests verify the old implementation, not the approved specification. The app still has founder sample records, large XP multipliers and a temporary Vercel SQLite path.

## Preflight interface rulings

| Producer → consumer | Finding / ruling |
|---|---|
| C01 storage → C02 repository | Flutter is not installed and Apple build access is unknown. Ruling: build framework-independent contracts and TypeScript server/domain fixtures first while the user chooses the client route. Do not claim native storage, encryption or device verification. Cost if wrong: a small client adapter or Dart port of pure rules. |
| C02 commands → C03 XP | Existing `src/lib/gamification.ts` uses incompatible rewards. Ruling: isolate the specified 5/15/25/15/10/30 reward rules under `src/core`; preserve the legacy UI until its integration path is selected. Cost if wrong: extra adapter work; no loss of existing data. |
| C02/C03 → C05 sync | Server must derive rewards, scope owners and commit canonical state/ledger/receipt atomically. Ruling: validate this locally against durable SQLite; hosting cannot be inferred from the presence of a Vercel account. |
| C04 scheduling → C07 reminders | A scheduled session is not an OS registration. Ruling: reminder capabilities stay explicit and unverified until a platform adapter is exercised on the selected devices. |

## Pending decisions

User questions sent: working web core first versus proposed Flutter client; durable sync hosting route. Public deployment/account creation/spending and native alarms are not inferred from these questions. Independent core work continues.

## Task status

- C01: environment assessed; native feasibility pending route/toolchain.
- C02: partial local Node/SQLite repository; profile states, task/occurrence creation, owner scoping, replay and atomic outbox verified. Goals/projects CRUD, approved-client screens, complete schemas and adaptation remain.
- C03: partial shared reward rules and atomic completion ledger verified; native/client integration, milestone/subtask budget persistence, attributes and rewards remain.
- C04: partial pure scheduling and wall-time resolution verified; recurrence series, acceptance transaction, edits/undo and calendar UI remain.
- C05–C07: not implemented; local owner/replay checks are prerequisites only, not authentication, sync, backup or reminder proof.

Native iPhone/iPad/Windows acceptance and complete Phase 4 remain outstanding.

- Tooling ruling: normalized C01–C07 headings to Task 1–7 because task-start only recognizes that format. Scope and acceptance criteria are unchanged. Task C03 shared pure rules can be tested before client integration; C03 is not marked complete until persistence/UI requirements pass.

## Foundation checkpoint evidence

- Ruling: shared TypeScript foundation is a provisional internal subset, not the complete production wire contract — avoids selecting a client or paid host while those questions remain pending — cost if wrong: adapter/porting effort; no existing data migrated.
- Ruling: C04 can exercise pure UTC scheduling and wall-time semantics before the client repository is integrated — both have no mutation side effects — cost if wrong: integration changes and repeated contract checks. Full task remains incomplete.
- XP: six RED→GREEN cases, including exact integer level thresholds.
- Repository: initial seven cases RED→GREEN after correcting the task INSERT column count. Added real-file replay/correction, database owner foreign keys, future-schema preservation and injected outbox failure. Unit preservation regression RED→GREEN; non-JSON/deep/oversize command regression RED→GREEN.
- Scheduler: nine RED→GREEN fixtures. Test deadline corrected from 10:00 to 10:30 to make the stated priority/dependency fixture feasible; implementation did not weaken deadline checking.
- Wall time: six RED→GREEN fixtures; distinguish generated imported recurrence instances from DTSTART rules using RFC 5545 §§3.3.5 and 3.3.10. No complete recurrence parser claimed.
- `scripts/verify-core.ts` ran successfully using a real temporary SQLite file and synthetic data; output saved under docs/evidence/phase-4/. The schedule proposal is not auto-applied.
- The root lint script is absent; no lint claim. Native/toolchain/encryption and public sync acceptance remain pending.
- Review uses all current uncommitted foundation files, since this is a private checkpoint rather than a completed branch. The requesting-code-review skill explicitly requires a fresh review agent; no implementation was delegated.

## Independent checkpoint review and one fix pass

- Important: snapshot consistency under another connection's commit. Reproduced RED with two real file-backed SQLite connections in WAL mode; wrapped reads in one read transaction; regression GREEN.
- Ruling: malformed answer enum and masked disk-full errors are Important for this foundation despite the reviewer's Minor labels — invalid persisted profile states and losing the actionable storage error affect resume/recovery — cost if wrong: small additional validation/error-path maintenance. Both reproduced RED and fixed GREEN; disk-full test also verifies accepted state remains and later writes recover.
- Review set-aside rulings: offline client convergence/authenticated sync remain C05; auth/session revocation/deletion remain C05/C06; native encryption/builds/backup remain C01/C06/C07; recurrence expansion/series edits/imported DTSTART and proposal acceptance/undo remain C04; milestone/split persistence remain C03; notifications and hosting/client selection remain C07/preflight. These are explicit incomplete scope, not silently waived requirements. Cost if wrong: additional integration/rework before release; no public route currently uses this foundation.
- Post-fix verification: `npm test` 60/60 passed (36 new core checks plus 24 legacy checks); `npm run typecheck` passed. No lint command exists. Whole-phase acceptance remains open; no task-done completion line or release claim emitted.
- No reviewer finding remains deferred in the implemented checkpoint. This does not replace the final whole-branch review when the complete Phase 4 implementation is ready.

## Continued Phase 4: local working pilot

- User: “continue”. Ruling: proceed with the reversible local browser/Node pilot using installed tools and SQLite — produces reviewable functionality under the existing zero-paid/no-external-DB constraint — cost if the native path is chosen: UI adapter/port work. This does not select a final web-only stack or waive launch sync.
- The four-task local-core-pilot plan is an execution addendum within authorized Phase 4. Preflight: repository → schedule acceptance uses one transaction and a planning-state hash; service → UI derives the local owner internally, exposes no remote service, and uses current-revision commands; appearance → pilot reuses accepted assets without copying personal data.
- Task 1 complete: additive schema/goal-task editing and scoped real ESLint. Task 2 complete: schedule preview/accept/undo and manual slot validation. Task 3 complete: loopback service, session/origin checks, restart persistence. Per-task commits and test receipts are in the plan's .superpowers ledger.
- Task 4 in progress: browser flow passed 19 assertions before review; manual protection/move was added to make accepted constraints controllable in the UI. Ruling: cancellation is retained in a separate table, not destructive row deletion — keeps replay/history inspectable — cost: additional history storage.
- Test ruling: Node fetch normalizes Host, so the forged-Host probe uses node:http to send the actual hostile header. The server origin rule was not weakened.
- Tooling: pinned isolated ESLint 10.12.0 and typescript-eslint 8.71.0 under tools/quality; install scripts disabled. This avoids modifying the primary checkout's shared dependency junction. Root lint covers the new work; no blanket legacy-lint claim.

## Local pilot review and recovery fixes

- Fresh read-only review covered the entire shared-core/local-pilot slice, including uncommitted browser files; 47 core/HTTP cases independently passed. No implementation was delegated.
- Important findings: rejected edits lost their identity; terminal retry failures retained a blocking request and reconnect hid recovery. Six browser regressions reproduced those bugs, related movement state loss and invalid timezone rendering; all now pass.
- Ruling: the reviewer's Minor timezone defect is Important because malformed input broke Today with existing sessions. Adopt a timezone only after validated success. Cost: one explicit state transition; no new platform dependency.
- Ruling: review exclusions (native clients, remote identity/sync, encryption, recurrence, backup/restore, alarms, deployment) remain incomplete C01–C07 obligations, not waived scope. Local session tokens do not establish customer identity. The 77-test pass is not whole-phase acceptance.
- Additional concrete concern: equal character-length but unequal byte-length session input caused a false storage error. Reproduced as 503 versus required 403; byte-length validation fixes both invalid cookie and token cases.
- Final code checks: npm test 77/77; npm run typecheck exit 0; npm run lint exit 0; npm run test:pilot 19/19. Screenshots and durable review outcomes: docs/evidence/phase-4/local-pilot/.
- Task 4 implementation and scoped verification complete. Local-pilot addendum can close after commit/open; the larger Phase 4 plan remains open. No public upload, new account, service purchase or personal seed data.

# Phase 4 — working-core foundation checkpoint

Historical foundation checkpoint. The later [working local pilot](phase-4-local-pilot.md) supersedes its UI/tooling status and test counts; full Phase 4 remains incomplete.

2026-10-04. **In progress; this is not Phase 4 completion or a release.** The user approved moving on from the theme/color prototype with “Great.Next phase”. The approved red/black/gold design and appearance controls remain the visual reference.

## What runs now

The new code in `src/core/` is isolated from the existing sample-driven Next.js UI. It runs locally without an AI provider or network.

| Capability | Execution evidence | Remaining integration |
|---|---|---|
| Fixed XP and increasing level costs | Numerical boundary, invalid input and large-integer tests | App UI, attributes, rewards, persistent milestone/subtask budgets |
| Partial completion and correction | A 25-XP task follows 0 → 12 → 25 → 0; 100 retries cannot duplicate its award | Real device reconciliation and conflict interface |
| Durable state and pending commands | File close/reopen; failed ledger/outbox writes roll back the entire mutation | Native/web storage adapter, encrypted storage and authenticated remote sync |
| Resumable answer storage | Skipped/unknown state persists; unconfirmed units block numeric body inputs; each saved measurement keeps its original unit | Onboarding screens, profile-to-plan adaptation and goals/projects CRUD |
| Explainable scheduling proposal | Priority, deadlines, dependencies, preparation, travel, buffers, protected blocks and insufficient-capacity cases | Calendar UI, acceptance transaction, edit/undo, preferences and recurrence series |
| Wall-time resolution | Denver spring/fall, half-hour change, quarter-hour offset, cross-zone and invalid-zone fixtures | Recurrence expansion, exceptions, imported DTSTART semantics and device timezone integration |

These are internal foundation APIs. `CoreRepository.apply(ownerId, command)` assumes a trusted caller. It is **not an authenticated public endpoint** and must not be exposed to the network in this form. Its occurrence-creation path does not yet validate a complete scheduling proposal. The scheduler is pure and cannot silently save or move anything. The time helper handles generated recurrence instances, not complete ICS imports.

## Reproducible local demonstration

Verification after the independent review fixes: **36 new core tests passed; 60 tests passed across the full repository, and TypeScript checking passed.** The older 24 tests still describe the separate sample implementation; they do not prove health or launch acceptance. Saved results: [tests](evidence/phase-4/tests.log), [typecheck](evidence/phase-4/typecheck.log), [review and fixes](evidence/phase-4/review.md).

From this worktree, using Node 24.19.0 and the existing installed dependencies:

```powershell
node --import tsx --test tests/core/*.test.ts
npm run typecheck
node --import tsx scripts/verify-core.ts
```

The [saved journey output](evidence/phase-4/foundation-journey.json) is produced by the script from synthetic records. It starts with an empty database, saves skipped/unknown answers, repeats a partial-completion command 100 times, completes the task, closes and reopens the database, replays the original command, and corrects the completion. The final balance is zero with the award history retained. Temporary fixture files are removed only after checking their absolute path is inside the system temporary directory.

An independent schedule fixture, displayed in America/Denver time, produces:

| Time | Proposed item | Capacity occupied |
|---|---|---|
| 07:10–07:55 | Movement practice | 07:00–08:05 including preparation and buffer |
| 08:05–08:35 | Home task | 30 minutes |
| 09:00–10:00 | Existing protected family block | Preserved |
| 10:05–10:50 | Study | 10:00–11:00 including preparation and buffer |
| Unplaced | Two-hour project | Largest remaining gap is 25 minutes; scope/deadline/priority alternatives are returned |

This is a software fixture, not a prescribed personal routine. Proposal generation and repository completion are demonstrated separately; integrated acceptance is still pending.

## Client and sync decisions

Two questions are already pending. Their answers determine the next integration work:

1. Build the working web app first, retaining native/store delivery on the roadmap, or proceed directly with the proposed Flutter client. The web route reuses the existing code and visual work; the native route requires a toolchain that is currently absent. Flutter's iOS setup requires Xcode and a Mac build route; physical-device testing is still necessary. [Official Flutter setup](https://docs.flutter.dev/platform-integration/ios/setup)
2. Choose where the shared database and account system will run. Launch sync remains required. The existing Vercel account covers frontend deployment, but local SQLite files on serverless functions are not durable shared storage. [Vercel SQLite guidance](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel)

| Sync route | Cost and tradeoff | Decision needed |
|---|---|---|
| Owner-controlled computer/server with durable disk | Keeps the SQLite foundation; no new service subscription is assumed. Needs reliable uptime, reachable HTTPS, authentication and tested backups. Existing hardware/connectivity costs and availability remain unknown. | Name the intended machine/host and connectivity arrangement. |
| Hosted Supabase Postgres/Auth candidate | Free plan currently lists 500 MB database, 1 GB file storage, 5 GB egress, and pausing after a week of inactivity. Pro starts at $25/month with usage/compute considerations. This would require a Postgres adapter, access policies and explicit external-account approval. | Whether an external provider is acceptable and the budget ceiling. |
| Existing hosted database/account provider | May avoid creating a new account, but compatibility, plan limits and permissions must be checked. | Name the service already available. |

Pricing reviewed on 2026-10-04; not a cost guarantee. [Supabase pricing](https://supabase.com/pricing) and [changelog](https://supabase.com/changelog). No service has been provisioned or purchased.

If the web route is chosen, Home Screen web apps on supported iPhone/iPad versions can request web-push permission after user interaction. Push support does not by itself establish dependable scheduled alarms; those still require implementation and real-device delivery tests. [WebKit platform documentation](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

## Requirements and phase boundary

Partial implementation evidence covers D01, S03, S05, S07, S10, G02, G03, G05, G06 and T06. B11 has transaction/replay prerequisites only, not automatic-sync acceptance. T01 has owner-scoped local queries only, not complete privacy/security acceptance. The [requirements register](requirements.md) retains the full scope; the [execution ledger](phase-4-ledger.md) records deviations and pending work.

No native application, encryption, sign-in, cross-device sync, OS reminder delivery, backup/restore or app-store packaging has passed its acceptance criteria. The root project currently has no lint command. The published Phase 3 preview has not been replaced by this partial foundation.

Next within Phase 4: connect the selected client, implement reviewed profile/goal/task flows and proposal acceptance, then authenticated durable sync, backup/restore and platform-specific reminder verification. Phase 5 still requires its own explicit approval after a complete Phase 4 review.

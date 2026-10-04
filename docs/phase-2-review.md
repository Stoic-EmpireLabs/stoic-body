# Phase 2 — specification and architecture review

2026-10-04 • Phase 1 approved by the user's “carry on.” Phase 2 is ready for review; Phase 3 has not begun.

## Recommended product

One coordinated daily system, organized into **Today, Plan, Train, Fuel and Growth**. It includes the requested life goals, meals, workouts, boxing, learning, academic imports, coach-led cheer learning, quotes and game rewards. Automatic sync across iPhone/iPad and Windows is a confirmed launch requirement. Local logging, scheduling and XP remain usable during outages.

Start with the [product specification](architecture/product-spec.md), then [platform/sync decision](architecture/platform-and-sync.md). The proposed production stack is Flutter plus local SQLite and an authenticated Node/SQLite sync service. This recommendation awaits approval; no framework migration, installation or deployment has occurred. The current React/Next app remains preserved as a reference.

## Concrete deliverables

| Artifact | What you can review |
|---|---|
| [Product specification](architecture/product-spec.md) | Five destinations, 20 screens, complete journeys, health/content rules, import formats and three proposed visual directions |
| [Shared data and rules](architecture/domain-contracts.md) | Entities, scheduling/recurrence/DST, exact requested XP, uncertainty and sync conflicts |
| [Platform/sync/cost decisions](architecture/platform-and-sync.md) | Three client options, hosting choices, device limitations and unresolved launch inputs |
| [Privacy and recovery design](architecture/privacy-and-reliability.md) | Account isolation, consent, attachments, backup/restore/deletion and explicit protection claims |
| [Success measures](architecture/success-measures.md) | Definitions and test proposals for ease of use, useful planning and voluntary return |
| [Existing app assessment](architecture/baseline-assessment.md) | Reusable material, actual checks and production blockers |
| [Requirement coverage](architecture/traceability.md) | Every requirement mapped to design, owning plan and future acceptance evidence |
| [Research register](architecture/sources.md) | Primary technical sources, access limits and why each matters |

## Proposed implementation sequence

Plans are proposals attached to this phase, not permission to execute later phases. Implementation is split by subsystem so each can be reviewed independently. Native execution in this workstream is proposed; no delegation or separate task is selected.

1. **Phase 3 — visual prototype.** Show the same Today/workout/weekly-review flow in Stoic Night, Quiet Marble and Training Journal. Use synthetic data. After selecting a direction, demonstrate onboarding, calendar/goal, nutrition, training, growth, sync conflict and import review at phone/iPad/Windows sizes. Demonstrate completion/undo, a missed session and calm mode. Label simulated interactions. Existing source is reference material; do not expose its owner fixtures in the new prototype. Approval is required before Phase 4.
2. **Phase 4 — [working core and sync plan](superpowers/plans/2026-10-04-core-implementation.md).** Storage/key feasibility; profile/goals; atomic XP; scheduler; account/sync; backup/restore; native reminders. A two-device offline/reconnect demonstration is required.
3. **Phase 5 — [nutrition/training plan](superpowers/plans/2026-10-04-health-implementation.md).** Reviewed diet library, screening, logs/recipes, appropriate programs/boxing, measurements and transparent forecasts.
4. **Phase 6A — [learning/coaching/import plan](superpowers/plans/2026-10-04-content-implementation.md).** Verified resources, quotes, safe staged imports and optional consented assistance.
5. **Phases 6B, 7 and 8 — [commercial verification/delivery plan](superpowers/plans/2026-10-04-release-implementation.md).** Separate gates for approved monetization/packages, full acceptance/device tests and delivery/publication approval.

## What inspection established

The separately created Next.js app's **15 unit tests passed**, and its TypeScript check passed. No lint command exists. These results do not establish compliance: the source uses a different XP scale, incomplete persistence, hardcoded personal/health samples and placeholder encryption/purchase alerts. The existing public-URL browser test was not executed. No native alarm, sync, purchase or full backup has been verified.

The [Phase 2 verification receipt](phase-2-verification.md) records document/coverage checks separately from these limited baseline tests. No product source was changed by this phase.

## Decisions still needed

| Decision | Current proposal / effect |
|---|---|
| Hosting for required automatic sync | Follow current zero-paid/no-external-DB rule unless user selects otherwise; hosting preference asked. Choose reachable durable server before sync deployment |
| Mac/Xcode access | Required build route remains unresolved; no iOS build claim until tested |
| Minimum OS | Proposed iOS/iPadOS 18 and Windows 11; AlarmKit feature only on supported 26+ Apple devices |
| Android timing | Later unless explicitly added to initial release; Google Play remains a distribution target |
| Commercial offer/regions | No final price or free/paid split; decide before store/purchase implementation |
| Optional AI | Deterministic core first; provider/personal-data sharing remains a separate choice |
| Owner setup | Health/schedule unknowns remain in private discovery; no personal prescription generated |

These open inputs do not prevent reviewing the product design or a synthetic visual prototype. They do prevent claiming launch readiness or implementing unapproved infrastructure.

## Checkpoint

Completed: specification, architecture alternatives/recommendation, rules, privacy/recovery, baseline assessment, success measures and subsystem implementation proposals. Coverage: all requirements, with concrete acceptance ownership in the traceability register. Research: refreshed primary platform/storage/auth/calendar/accessibility sources and reused the approved competitor evidence; public competitor views are not treated as native execution tests.

Next: Phase 3 visual prototypes. This checkpoint requests approval because the user's original workflow requires explicit review before each new phase. Approval does not authorize public release, spending, accounts or later implementation phases.

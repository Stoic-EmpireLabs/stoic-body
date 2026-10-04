# Stoic Body — project review packets

Updated 2026-10-04. Phase 0 and expanded Phase 1 are approved. **[Phase 2 specification and architecture](docs/phase-2-review.md) is ready for review.** Automatic sync across iPhone/iPad and Windows is now required at launch. No product implementation or public deployment is approved by this checkpoint.

Stoic Body connects life goals, schedules, nutrition, training, learning and Stoic reflection through one enjoyable daily game. The owner is the first pilot user of a commercial product targeting Apple App Store, Google Play and Microsoft Store; Android launch timing remains open.

## Current packet

- [Product and 20-screen specification](docs/architecture/product-spec.md)
- [Shared data, scheduling, XP and sync contracts](docs/architecture/domain-contracts.md)
- [Platform and hosting alternatives](docs/architecture/platform-and-sync.md)
- [Privacy and recovery design](docs/architecture/privacy-and-reliability.md)
- [Success measures](docs/architecture/success-measures.md)
- [Existing Next.js source assessment](docs/architecture/baseline-assessment.md)
- [96-requirement traceability](docs/architecture/traceability.md) and [verification](docs/phase-2-verification.md)

The existing Next.js source was created separately and has been preserved. Its 15 existing unit tests and TypeScript check pass, but important requirements remain missing or contradicted; see the assessment before treating it as a working commercial app.

## Foundations and research

[Brief](docs/project-brief.md) · [Requirements](docs/requirements.md) · [Decisions](docs/decisions.md) · [Progress](docs/progress.md) · [Discovery](docs/discovery.md) · [Phase roadmap](docs/superpowers/plans/2026-10-04-stoic-body-phase-plan.md) · [Skill inventory](docs/skill-inventory.md) · [Tool inventory](docs/tool-inventory.md) · [Original request](docs/source-original.md)

[Phase 1 research](docs/phase-1-review.md) includes the [24-competitor comparison](docs/research/competitors/README.md), [visual reference board](docs/research/competitors/interface-board.html) and [26-step journey map](docs/research/competitors/experience-patterns.md). These are research artifacts, not implemented features.

Personal planning records remain under private/ and excluded by Git rules. That exclusion does not protect owner-like values separately embedded in tracked source; removing those from release examples is an explicit blocker. Nothing in this packet authorizes disclosure of personal data.

Phase 2 approval authorizes Phase 3 synthetic visual prototypes. Later phases, purchases, accounts and public releases retain their approval gates.

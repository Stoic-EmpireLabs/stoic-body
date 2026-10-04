# Stoic Body — project review packets

Updated 2026-10-04. Phase 0 and expanded Phase 1 are approved. Phase 2 is provisionally approved. **[Phase 3 interactive prototype](docs/phase-3-review.md) is ready for review.** Automatic sync across iPhone/iPad and Windows is now required at launch. The user explicitly authorized GitHub and Vercel upload; this does not approve Phase 4 or app-store publication.

Stoic Body connects life goals, schedules, nutrition, training, learning and Stoic reflection through one enjoyable daily game. The owner is the first pilot user of a commercial product targeting Apple App Store, Google Play and Microsoft Store; Android launch timing remains open.

## Current preview

- [Three design directions on Vercel](https://stoic-body-4wc0a5l0c-stoic-dev-team.vercel.app/gallery.html) — sign in with the existing Vercel account.
- [Prototype source and local instructions](prototypes/phase-3/README.md).
- [Phase 3 review](docs/phase-3-review.md) and [verification](docs/phase-3-verification.md): 126 browser checks passed; gallery and deployment assets checked separately.
- [Existing separately developed application](https://stoic-body.vercel.app), preserved.

The design preview uses fictional data and resets on refresh. Native alarms, authenticated sync and persistent health features are not implemented by this prototype.

## Architecture packet

- [Product and 20-screen specification](docs/architecture/product-spec.md)
- [Shared data, scheduling, XP and sync contracts](docs/architecture/domain-contracts.md)
- [Platform and hosting alternatives](docs/architecture/platform-and-sync.md)
- [Privacy and recovery design](docs/architecture/privacy-and-reliability.md)
- [Success measures](docs/architecture/success-measures.md)
- [Existing Next.js source assessment](docs/architecture/baseline-assessment.md)
- [96-requirement traceability](docs/architecture/traceability.md) and [verification](docs/phase-2-verification.md)

The existing Next.js source was created separately and has been preserved. Its 15 existing unit tests passed at the Phase 2 snapshot and its latest TypeScript recheck passes, but important requirements remain missing or contradicted; see the assessment before treating it as a working commercial app.

## Foundations and research

[Brief](docs/project-brief.md) · [Requirements](docs/requirements.md) · [Decisions](docs/decisions.md) · [Progress](docs/progress.md) · [Discovery](docs/discovery.md) · [Phase roadmap](docs/superpowers/plans/2026-10-04-stoic-body-phase-plan.md) · [Skill inventory](docs/skill-inventory.md) · [Tool inventory](docs/tool-inventory.md) · [Original request](docs/source-original.md)

[Phase 1 research](docs/phase-1-review.md) includes the [24-competitor comparison](docs/research/competitors/README.md), [visual reference board](docs/research/competitors/interface-board.html) and [26-step journey map](docs/research/competitors/experience-patterns.md). These are research artifacts, not implemented features.

Personal planning records remain under private/ and excluded by Git rules. That exclusion does not protect owner-like values separately embedded in tracked source; removing those from release examples is an explicit blocker. Nothing in this packet authorizes disclosure of personal data.

Phase 3 style/flow approval is pending. The explicit upload instruction authorized the published GitHub/Vercel preview. Later implementation phases, purchases, accounts and app-store releases retain their approval gates.

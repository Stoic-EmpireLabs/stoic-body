# Stoic Body — Windows local pilot

Updated 2026-10-04. The working local pilot has separate client accounts, a welcome experience, resumable setup questions and a full-app guide. Each client starts with an empty workspace and adds their own goals, schedule and logs.

## Download and start on Windows

1. Open [GitHub Releases](https://github.com/Stoic-EmpireLabs/stoic-body/releases) and select the **Windows local pilot** prerelease.
2. Download **Stoic-Body-Windows-x64.zip** and extract the complete folder onto your desktop.
3. Double-click **Start Stoic Body.cmd**, choose **Create my account**, and save your recovery key privately.
4. Follow the host's setup questions and tour. Use **Help & tour** whenever you need guidance.

Use **Stop Stoic Body.cmd** to stop the background service. Node.js is included; no developer installation is needed. Windows 10/11 x64 and a current browser are required. This is an unsigned browser-based local preview, not a Store installer.

Your data stays in `%LOCALAPPDATA%\StoicBody`, outside the download folder. The ZIP contains no owner database, personal profile, environment secrets or developer dependencies. Accounts on different computers are independent. **Automatic cross-device sync, native alarms, automated backup/restore and store distribution remain unfinished launch requirements.** Local SQLite data is not encrypted; use separate Windows accounts on shared computers.

[Detailed Windows instructions](apps/desktop/README.txt) · [Developer run instructions](apps/local-pilot/README.md) · [Guided-entry verification](docs/guided-entry-checkpoint.md)

## Product and previous review packets

Phase 3's visual direction was approved and subsequent local implementation was authorized. Required iPhone/iPad and Windows sync is not waived by this downloadable pilot. The separate Next.js application and Vercel design preview are not the Windows package.

Stoic Body connects life goals, schedules, nutrition, training, learning and Stoic reflection through one enjoyable daily game. The owner is the first pilot user of a commercial product targeting Apple App Store, Google Play and Microsoft Store; Android launch timing remains open.

## Current preview

- [Selected red, black and gold design on Vercel](https://stoic-body-mmzb80wyk-stoic-dev-team.vercel.app/gallery.html) — sign in with the existing Vercel account.
- [Prototype source and local instructions](prototypes/phase-3/README.md).
- [Phase 3 review](docs/phase-3-review.md) and [verification](docs/phase-3-verification.md): 126 general browser checks and 18 appearance checks passed; gallery and deployment assets checked separately.
- [Existing separately developed application](https://stoic-body.vercel.app), preserved.

The design preview uses fictional data; sample entries reset on refresh. Theme and color settings are now available and remain saved in this browser. Native alarms, authenticated sync and persistent health features are not implemented by this prototype.

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

The user authorized GitHub distribution of the Windows pilot. Purchases, external accounts, public service deployment and app-store releases retain their approval gates.

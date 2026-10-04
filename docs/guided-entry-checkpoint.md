# Guided entry and Windows download checkpoint

2026-10-04. Scope: the user's login, new-client questionnaire and whole-app host request, plus a GitHub download for an independent client on another Windows computer. This is a local-pilot checkpoint, not completion of the commercial app.

## Implemented and execution-verified

- Local registration and sign-in; salted scrypt password hashing, one-time recovery keys, session expiry/revocation, CSRF checks and persistent rate limits. Recovery rotates the key and invalidates existing sessions. No email/social authentication is simulated.
- A fresh account starts empty. Every data request uses the authenticated owner. Existing anonymous owner records remain untouched and are not claimed by a new account.
- Welcome, twenty resumable questions in manageable groups, unknown/skip/back controls, explicit first-goal draft, setup checklist and always-available Help & tour.
- Twelve tour stops across Today, Goals, Plan, five Health views, Learn, Profile, Settings and XP. Keyboard focus stays in the dialog; Escape pauses; replay is supported.
- Windows x64 package bundles the actual local service, an explicit UI allowlist and Node v24.19.0. It excludes private records, environment files, the separate Next.js app and developer dependencies. No recipient Node/npm setup is needed.
- Start/Stop launchers use a separate LOCALAPPDATA data folder. Stop validates executable path, command line and process creation time before stopping its own service. Reopening retains accounts and data.

## Verification evidence

| Check | Result |
|---|---|
| Unit, HTTP and browser test suite | 120/120 passed after review fixes |
| TypeScript and scoped ESLint | Passed |
| Core pilot browser journey | 19 checks passed |
| Health browser journey | 15 checks passed |
| Learning browser journey | 13 checks passed |
| Windows package smoke | Three concurrent real bundled launchers share one owned service; account creation, clean data, file hashes, stop and restart passed using isolated temporary data |
| Visual review | Desktop welcome, setup and tour; mobile help checked from synthetic screenshots |
| Extra account regressions | In-flight stale credentials and restored-page inactivity reproduced failing, then passed after fixes |

Screenshots: [welcome](evidence/guided-entry/welcome-desktop.png), [questions](evidence/guided-entry/questionnaire-desktop.png), [tour](evidence/guided-entry/tour-desktop.png), [mobile help](evidence/guided-entry/host-mobile.png).

A fresh independent review covered immutable commits 3c745b9..81e2972. Its three findings were reproduced in failing tests and corrected in one fix pass: cross-account draft/retry leakage, concurrent launcher ownership, and unrecoverable questionnaire conflicts. Browser sign-out now clears other tabs, changed identities reload with private drafts discarded, Windows start/stop is serialized with atomic ownership records, and questionnaire conflicts show the latest saved answer beside the retained draft before explicit resubmission. No minor findings remain deferred. [Review receipt](evidence/guided-entry/review.md).

The live service was restarted and a read-only guest check returned HTTP 200, authenticated=false and no snapshot. No synthetic account or personal profile was written to the owner's live database.

## Published download

[Windows local pilot prerelease](https://github.com/Stoic-EmpireLabs/stoic-body/releases/tag/v0.2.0-local-pilot) · [Download ZIP](https://github.com/Stoic-EmpireLabs/stoic-body/releases/download/v0.2.0-local-pilot/Stoic-Body-Windows-x64.zip).

Published from source commit b3bc51f7203c388ac3f9a1cb52e6ceaa2b566a2b on codex/stoic-body-core. Main was not merged or changed. GitHub reports both assets uploaded and the release publicly available as a prerelease. Direct ZIP download HEAD returned HTTP 200 and 34,787,477 bytes. GitHub's ZIP digest and downloaded checksum file match the locally inspected archive:

`cd5314311e4176e22ae1ae05a3caf0004096b8b671b559b79578300eac8e5feb`

All sixteen application/runtime files inside the ZIP were compared against the included manifest hashes. The seventeenth file is the manifest itself. No private/environment/database files are included. The source branch also contains historical planning and the separately preserved application; recipients should download the named ZIP asset rather than the automatic Source code archive.

## Research and requirements

[First-use benchmark research](research/guided-entry-benchmarks.md) documents Duolingo, Noom and Headspace interaction patterns using primary sources; no proprietary engagement measurements or bestseller ranking is claimed. [Plan](superpowers/plans/2026-10-04-guided-entry.md) records interfaces, constraints and verification.

| Request | Design / implementation | Verification |
|---|---|---|
| Login and new client | AccountStore and Access; local owner/session boundary | accounts.test.ts, auth.test.ts, server.test.ts |
| New-user questionnaire | Host; twenty core profile answers and separate guide progress | onboarding.test.ts |
| Host and full-app tooltip tour | Host; real views, explicit next actions, pause/resume/replay | onboarding.test.ts; desktop/mobile images |
| Wife's own goals and experience | Empty account, local persistent database, independent Windows download | auth isolation tests and test-desktop.mjs |
| GitHub distribution | Allowlisted ZIP plus SHA-256 manifest, prerelease from implementation branch | Uploaded asset digest/size, direct HTTP 200 and checksum file verified above |

## Limitations and next phase

Automatic iPhone/iPad/Windows sync remains a launch requirement. This download supplies independent local accounts, not a cloud identity. Native alarms, automated backup/restore/export, public service hardening, signed store installers and complete profile-driven coaching remain unfinished. Questionnaire answers are saved; only described suggestions currently consume them. Appearance remains browser-local. SQLite is not encrypted against direct OS access.

The next proposed work is required authenticated cross-device sync and launch reliability after this checkpoint is reviewed. No external provider, paid service or deployment is selected by this local release.

## Decisions made in this slice

- Proceed with the directly requested local implementation without repeating design approval; the cost of changing direction is revising the local UX.
- Use installed SQLite/crypto for local accounts; a production sync/authentication adapter remains necessary.
- Preserve unclaimed legacy owner data; populated legacy data requires a separately reviewed migration.
- Retain the isolated branch and ignored evidence workspace; cost is modest local storage.
- Publish the explicitly authorized GitHub prerelease from the implementation branch, preserving main and the separate application. The ZIP allowlist protects recipient downloads from developer data. Publication creates no public database service.
- Reviewer boundary: sync, native alarms, stores and full coaching remain separate launch work; cost is an explicitly incomplete commercial release.
- Reviewer boundary: the separate Next.js application remains outside this slice; its behavior is not vouched for by pilot tests.
- Reviewer boundary: verify the published asset using GitHub's uploaded size/digest and the local archive hash before handoff; a local build alone cannot prove availability.
- Reviewer boundary: accounts do not protect against direct Windows filesystem access; production storage/privacy work remains.

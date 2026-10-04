# Guided entry implementation plan

> For agentic workers: use superpowers:executing-plans inline, with one fresh final reviewer. Follow TDD and commit logical tasks.

Goal: a first-time client can understand Stoic Body, create a private local account, answer a resumable questionnaire, take a guided tour and know their next real action.

Spec: the user's current request for login, new client onboarding, questionnaire and a host that guides the entire app, plus existing project requirements. Direct implementation authorization is present; no repeated design-approval gate is added for this local iteration.

Architecture: Node/SQLite account and session adapter around the existing owner-scoped core. Separate access screen and host module in the existing browser client. Existing profile.answer commands remain the answer source; a revisioned account guide record stores onboarding/tour progress.

Tech: installed Node crypto/scrypt, SQLite, vanilla JS, native dialog and Playwright. No new dependency, paid service or cloud account.

## Global constraints

- Use phase4 worktree; preserve prior owner rows without silently claiming or moving them to a new client.
- Password hashing, random HttpOnly sessions, session-bound CSRF token, rate limiting, recovery keys and account isolation must work. No automatic login from bootstrap.
- Local accounts do not implement required cross-device sync or public production authentication. Loopback only. No passwords or recovery keys in logs/git/localStorage.
- Keep accepted themes. Setup and tour are optional/resumable; skip/unknown are honest states. Guidance describes actual functions and launch limitations.
- Never silently create a goal, schedule, meal, health target or notification permission from a questionnaire answer.
- Tests use synthetic accounts and isolated databases; never register the owner's account or seed their data.

## Review Focus

- Account switch, expiry, stale requests and restart must not expose another client's data or leave private drafts visible.
- Lost responses, retries and duplicate clicks must not duplicate accounts, answers, goals or state transitions.
- Existing unclaimed local-owner data stays untouched and inaccessible to a freshly registered client.
- Keyboard and narrow-screen onboarding/tour must remain navigable, dismissible and replayable.
- Skipped questions and incomplete plans must not be represented as medical clearance or completed personalization.

## Task 1: Real local account boundary

Files: src/core/accounts.ts; apps/local-pilot/server.ts; tests/core/accounts.test.ts; tests/pilot/auth.test.ts; tests/pilot/helpers.ts; existing pilot tests/scripts; research doc.

Interfaces: AccountStore(db) supplies register/login/recover, createSession/authenticate/logout, readGuide/saveGuide. Server bootstrap returns {authenticated, account?, token?, snapshot?, guide?}; auth routes use same-origin POST. Existing data routes derive owner from session only. Guide writes require expected revision and validate a small state object.

- [x] Write failing account/isolation/session/recovery/guide tests and HTTP unauthorized tests; run, expect missing implementation.
- [x] Implement scrypt N32768/r8/p3, 16-byte salt, timing-safe checks; 15–128-character passwords; username/display name; single-use recovery key; random 12h sessions with 30m idle limit; persistent bounded login throttles. Store only session/key digests. Signup creates a new owner, never claims legacy rows.
- [x] Adapt existing test fixtures to register/sign in through the real API (no auth bypass), using a shared test helper. Existing behavior tests may mark their synthetic guide complete.
- [x] Run core/account/HTTP tests, typecheck and lint. Expect pass. Commit.

Completion command: node --import tsx --test tests/core/accounts.test.ts tests/pilot/auth.test.ts tests/pilot/server.test.ts

## Task 2: First-use host, questionnaire and walkthrough

Files: apps/local-pilot/public/access.js; host.js; app.js; health.js; index.html; styles.css; tests/pilot/onboarding.test.ts.

Interfaces: Access handles guest forms and one-time recovery-key display, then reloads the signed-in app. Host receives questions, account/guide state and existing rendering/API functions; adds setup view, dashboard checklist, help button and tour. Health exposes an explicit open-tab method for tour only.

- [x] Write failing browser journey: guest landing → create account → welcome → questions → pause/resume → first-goal draft → full tour → sign out → sign in. Verify skip/unknown/back, sources of setup status, keyboard Escape and mobile layout. Expect missing access UI.
- [x] Implement clear product welcome, account forms, password visibility and recovery flow; logout clears all app modules via reload. No fake email/social login.
- [x] Implement 20 questions in four small groups, save/continue/back/skip/unknown, reason/context, progress and resume. Answer recap and explicit editable first-goal suggestion.
- [x] Implement real-view walkthrough for Today, Goals, Plan, all Health tabs, Learn, Profile, Settings and XP. Native modal focus management, target highlights, Back/Next/Escape/pause, persisted progress and replay. Guide never mutates health/schedule data.
- [x] Add persistent Help/guide and useful empty-state setup checklist. Run browser test. Expect pass. Commit.

Completion command: node --import tsx --test tests/pilot/onboarding.test.ts

## Task 3: Downloadable Windows package

Added by the user's explicit GitHub/download clarification: his wife should download a fresh copy and customize her own account, goals and experience.

Files: scripts/build-desktop.mjs; apps/desktop/launch.ps1; launcher CMD files; desktop guide; scripts/test-desktop.mjs; server identity/main configuration; README and package scripts.

Interfaces: bundle the local service and an allowlist of UI assets with the installed Node Windows x64 executable and its matching official license. A launcher stores runtime data under LOCALAPPDATA/StoicBody, starts hidden and opens the browser. No owner database, private discovery file, environment file or developer dependencies in the archive. An explicit stop launcher verifies its own runtime PID/path before stopping.

- [x] Write a packaging smoke that checks the allowlist, startup, guest isolation and actual launcher/stop behavior using temporary user data. Observe failure before the package builder exists.
- [x] Build a standalone ZIP without needing Node/npm on the recipient's computer; retain the unsigned local-pilot boundary. Include a manifest/hash and current startup/update instructions. No new external account or paid service.
- [x] Verify bundled app and onboarding in isolated data, then commit packaging sources. Publication occurs only after final verification/review in Task 4.

Completion command: npm run test:desktop

## Task 4: Whole-flow verification and handoff

Files: docs/guided-entry-checkpoint.md; docs/progress.md; docs/requirements.md; docs/decisions.md; docs/evidence/guided-entry/.

- [x] Run npm test, typecheck, lint, test:pilot, test:health and test:learning. Expect all pass. Verify restart requires valid sign-in and restores account-specific answers/guide state.
- [x] Inspect synthetic screenshots at desktop/mobile, verify actual dialogs and keyboard flow. Commit evidence/docs.
- [x] Fresh reviewer examines complete immutable change. Fix Important/Critical findings in one RED→GREEN pass, then whole suite.
- [x] Restart live pilot, read-only guest smoke; retain existing local data. Present login/setup screen for user to create their own account. Keep branch and ignored evidence workspace.
- [x] User authorized GitHub distribution. Inspect outgoing files for private data, push the implementation branch, and publish a clearly labeled prerelease ZIP with exact run instructions. Do not merge or deploy the local service publicly. Verify uploaded asset size/hash and repository links.

Completion command: npm test

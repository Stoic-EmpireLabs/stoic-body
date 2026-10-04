# Stoic Body — Phase 3 design preview

[Review red, black and gold](https://stoic-body-qv8gdjf3o-stoic-dev-team.vercel.app/gallery.html) · [Review packet](../../docs/phase-3-review.md) · [Verification](../../docs/phase-3-verification.md)

This standalone prototype uses fictional data and in-memory interactions. Refresh resets everything. No account, real upload, personal health plan, external AI call or cross-device synchronization is connected. Vercel preview access uses the project's existing account authentication.

Run from the repository root:

```powershell
node prototypes/phase-3/server.cjs
```

Open http://127.0.0.1:4327/gallery.html. The selected Crimson & Gold palette is the default. Quiet Marble and Training Journal remain previous alternatives in the theme controls.

Try completing and undoing a task, a schedule-move proposal, sample set/meal logging, the boxing timer, twenty-question onboarding, a staged academic import, the weekly review and calm mode. Some dialogs show the proposed future behavior. Actual parsing, alarms, private media, purchases, durable storage and authenticated sync remain later implementation work.

With the local server running:

```powershell
node prototypes/phase-3/verify.cjs
node prototypes/phase-3/verify-gallery.cjs
node prototypes/phase-3/lint.cjs
node node_modules/typescript/bin/tsc --allowJs --checkJs --noEmit --target ES2022 --lib ES2022,DOM --skipLibCheck prototypes/phase-3/app.js
```

The server exposes a strict static allowlist. `package-preview.cjs` copies only seven reviewed assets into an ignored Vercel Build Output directory and writes their SHA-256 manifest. No dependency installation is needed for the preview itself. Browser verification uses the repository's existing Playwright installation.

The latest user-selected palette is red, black and gold. This visual review does not establish completion of the commercial app or approval of subsequent phases.

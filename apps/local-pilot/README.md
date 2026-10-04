# Stoic Body local pilot

A working local slice with account-specific goals, scheduling, health/learning logs, welcome setup and an app tour. The separate Next.js app and published Phase 3 preview are unchanged. For the no-setup Windows ZIP, see [desktop instructions](../desktop/README.txt).

## Run on Windows

In the already prepared development worktree, run `npm run pilot` from the repository root. Dependencies are available; do not run `npm ci` there while node_modules is a junction to the primary checkout.

For a **separate fresh checkout** with Node 24, install and run:

```powershell
npm ci
npm ci --prefix tools/quality --ignore-scripts
npm run pilot
```

Open `http://127.0.0.1:4330`. The launcher binds only to this computer. Stop it with Ctrl+C. Restarting preserves data in `private/local-pilot/stoic-body.sqlite`; this directory is excluded from Git. Keep the same checkout/data path between runs. This development worktree reuses the existing node_modules installation; a fresh checkout uses the commands above.

## Try it

Create your account, save its recovery key, and follow the welcome guide. New clients receive no prefilled owner data. The twenty setup questions can be skipped, marked unknown, paused and resumed. **Help & tour** reopens guidance at any time. Existing anonymous pilot records are preserved but never assigned to the first new account.

1. In **Goals**, create a goal and a small task. Choose a task kind, duration, priority and preparation/buffer time.
2. In **Profile**, answer one of twenty questions, or choose skipped/unknown. Availability written as `07:00–18:00` prefills the planning window. Other answers are retained for later reviewed personalization.
3. In **Plan**, add any fixed/protected sessions first, then preview the remaining day. Accepting saves the displayed placements together. The proposal reports tasks that do not fit.
4. In **Today**, record half/full completion or correct it. A 25-XP action earns 12 at half, 25 total at full, and returns to zero when corrected. Protect or move an unstarted session explicitly.
5. In **Settings**, choose Dark/Light/System, a preset, or custom accent/reward colors.

Repeated saves use command identifiers. Conflicting edits show a review message. Failed connections offer **Retry save**, which reuses the same operation. **Reconnect** renews the local browser session after a service restart and retains a visible retry for any uncertain save. Definitively rejected commands release the controls so you can correct the entry. Keep the tab open until an uncertain save is resolved; a browser reload does not retain an unsent draft. Appearance is browser-local; confirmed pilot data lives in SQLite.

## Data and limitations

This is a personal local service with real local account authentication. Other trusted programs running on your computer can access local services/files. No external AI, database provider or analytics service receives entries. SQLite encryption has not been implemented. Do not expose this port through a proxy, tunnel or public host; a production deployment service is still required for launch sync.

Automated backup/restore is not implemented. For a manual safety copy, stop the pilot cleanly first, then copy the private database into a private backup location. Do not copy a live database file or commit it. No deletion/reset control is supplied in this pilot.

Recurring habits, full project/milestone graphs, energy matching, profile-based fitness/diet prescriptions, academic imports, configurable reward unlocks, automatic cross-device sync, native alarms and store packages remain on the roadmap. This slice does not complete Phase 4.

## Verify

```powershell
npm test
npm run typecheck
npm run lint
npm run test:pilot
```

`lint` covers the new core, local pilot, associated tests and verification scripts; it does not assert that the separate legacy app has been linted. The Playwright journey uses an isolated temporary database and synthetic entries, then saves screenshots and a check list under `docs/evidence/phase-4/local-pilot`. It never adds test entries to the personal pilot database.

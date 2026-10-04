# First-use experience research — 2026-10-04

| Primary source | Observed pattern | Application and verification |
| --- | --- | --- |
| [Duolingo home-screen design](https://blog.duolingo.com/new-duolingo-home-screen-design/) | A clear path reduces uncertainty about what to do next | A setup checklist points to the next real action; readiness is derived from saved answers, goals, tasks and schedule |
| [Duolingo beginner guide](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/) | Explain the path and progressively introduce tools | First-run orientation, then a replayable guided tour of actual views; no forced notification permission |
| [Noom lesson navigation](https://www.noom.com/support/faqs/using-the-app/daily-features/2025/10/how-to-find-and-revisit-your-noom-lessons/) | Today's Plan, course map and revisitable instruction provide entry points | Host on Today plus always-available help; users can pause and replay instead of losing access after dismissal |
| [Headspace Help Center](https://help.headspace.com/hc/en-us) | Getting Started serves both beginners and people needing a refresher | Separate welcome and contextual help; concise explanations of why each feature exists |

These are established product benchmarks, not a current audited bestseller ranking. Sources are vendor feature documentation, not access to internal analytics or independently measured onboarding conversion. Adopt the interaction principles; don't copy branded artwork or claim their retention metrics for Stoic Body. Noom feature availability varies by region. Dated URL paths may reflect publication metadata rather than the current review date.

Technical primary sources: [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Node's installed crypto supports scrypt without adding a dependency. Use OWASP's documented N=2^15/r=8/p=3 alternative, random tokens and server-side expiry/revocation. Native dialog supplies focus containment; Escape pauses rather than marking the tour complete. Loopback HTTP cookies are HttpOnly/SameSite=Strict; production requires HTTPS/Secure and a separately reviewed deployment boundary.

No external AI service processes onboarding. Account isolation protects normal app access, not a person with direct OS/filesystem access to the SQLite database. Cloud recovery email, remote sync, public release hardening and production privacy controls remain launch work.

Windows packaging uses the installed Node v24.19.0 x64 executable and includes its complete [official license and bundled notices](https://raw.githubusercontent.com/nodejs/node/v24.19.0/LICENSE), retrieved 2026-10-04. No additional runtime download or npm dependency installation was required. This is an unsigned browser-based local package, not a native Store release.

The version-specific [Node platform matrix](https://github.com/nodejs/node/blob/v24.19.0/BUILDING.md#platform-list) identifies Windows x64 compatibility starting at Windows 10; upstream support also depends on the OS vendor's support lifecycle. Runtime behavior was tested on this Windows x64 machine, not on every Windows version. [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) provides the versioned downloadable asset; uploading source alone is not the desktop handoff.

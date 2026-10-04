# Fresh review and one-pass corrections

Reviewed range: 3c745b91620c8594a5a8b76cfca172997bd106a8..81e2972c8ecc10498d34e348be24b444ec454905. Fresh read-only reviewer; no reviewer subagents. Assessment before fixes: local prerelease requires corrections.

| Severity / finding | Observed failing regression | Correction and result |
|---|---|---|
| Critical: another account could adopt an old draft on Reconnect/Retry | Changed-account browser test failed to clear Alice's draft after Bob's cookie replaced hers | Identity/generation checks, clean reload on changed bootstrap or stale-token owner change, cross-tab account notification. Changed-account save, uncertain reconnect and cross-tab logout now pass. |
| Important: concurrent launchers overwrote service ownership | Three simultaneous real packaged starts all rejected and could leave an unowned service | Canonical data-directory/port mutex; atomic PID replacement; readiness checks listener PID. Concurrent start, re-open, stop and restart pass. Initial Windows PowerShell null-backup path incompatibility also corrected and rerun. |
| Important: questionnaire conflict retried a permanently rejected operation | Two-tab answer test could not present a current answer or recover | Discard definitively rejected operation; refresh saved answer/guide; preserve draft; require explicit review and save with a new operation. Two-tab test passes. |

Final validation: 120/120 tests; TypeScript and scoped ESLint; 19 core + 15 health + 13 learning browser checks; Windows package smoke all passed. Screenshots use synthetic accounts. No second reviewer was dispatched; failing-then-passing regressions verify the corrections.

Minor findings: none. Declined review areas were cloud sync/native alarms/store release/full coaching, the separate Next.js application, not-yet-published assets, and direct OS filesystem protection. All are explicitly carried into the checkpoint boundaries; asset availability will be verified at publication.

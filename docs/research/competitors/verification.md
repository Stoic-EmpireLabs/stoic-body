# Competitor research verification

Reviewed October 4, 2026. This file distinguishes document/browser evidence from unperformed app tests.

## Executed browser checks

- The local interface board loads with ten curated references.
- Game filter shows two references; Fitness shows three; All restores the complete set.
- The board has no captured JavaScript runtime errors.
- A 390-pixel viewport has no horizontal overflow.
- Desktop and mobile screenshots were visually inspected; references link to full-size originals.
- Public captures include ready-state examples and an observed Structured Web signup boundary. No account was created or entered.

Evidence: [desktop board](board-desktop.png), [mobile board](board-mobile.png), [capture notes](visual-audit.md) and [machine-readable results](verification-results.json).

## Record integrity

The final scoped check covers this project's README, docs and private planning records. It validates 95 unique requirement IDs, 24 unique competitor IDs, 50 unique competitor-source IDs, 26 unique journey-step IDs, all step/competitor source references, all journey requirement references, JSON parseability and local Markdown targets. The exact final counts/results are saved in verification-results.json.

Final scoped check passed at 17:01:43 UTC: 112 source references resolved, 12 JSON records parsed, 203 local Markdown links resolved, all six board filters returned their expected counts, and no unresolved failures were recorded.

The initial check unintentionally traversed newly present third-party node_modules documentation and reported broken package-source links and JSON-with-comments as failures. Those are outside this research deliverable. The final check is explicitly scoped to first-party research/planning artifacts; it does not claim the dependency tree or app passes checks.

## Research limits

- The 50 competitor references are a separate register from the initial 37 health/platform sources; these counts are not a claim of 87 independent clinical studies.
- Sources mix official product/help/pricing pages, store observations, a company investor overview and a labeled third-party estimated market summary.
- Country/platform/period are retained for market signals. A free chart, paid-subscriber metric, rating and award are not interchangeable.
- Finch rating counts/ranks differ across indexed and rendered snapshots. FightCamp prices differ between vendor offer pages. Both discrepancies are disclosed instead of blended into one figure.
- Ten curated public visual references were inspected, not ten authenticated native apps. Initial loading/occlusion/locator failures and later usable captures are recorded.
- No native app install, signup, paid trial, purchase, cancellation execution, notification delivery or long-term personalization test occurred.
- No clinical recommendation, competitor algorithm accuracy or Stoic Body retention/revenue outcome is validated by these comparisons.
- This work made no product app source change or deployment. Separately present Next.js files/configuration were preserved; their quality and publication status are unreviewed here. The private directory ignore rule remains present; this is not proof of encryption or external publication controls.

## Review outcome

The public-evidence comparison and proposed experience adaptations are ready for Phase 1 review. The final scoped check records no unresolved failures. The phase approval rule is unchanged. Phase 2 should reconcile the separate workspace app work before selecting implementation changes.

# Visual audit

Captured October 4, 2026 with bundled native Playwright/Chromium in isolated, unauthenticated contexts. Ten curated references are available in [the interface board](interface-board.html). The browser capture JSON files record URLs, timestamps, titles and outcomes.

| Product | Inspected surface | Observation | Stoic Body proposal | Image |
|---|---|---|---|---|
| [Structured](https://structured.app/) | Published app screen | Time labels, duration, active-session progress, completion circles and one add button. | Use the compact timeline; add visible conflicts and linked goals. | [Open](screens/structured-ui.png) |
| [Tiimo](https://apps.apple.com/us/app/tiimo-ai-plan-focus-to-do/id1480220328?platform=iphone) | App Store preview | Store presentation groups planning and focus features into phone-screen previews. | Use clear task decomposition and an accessible focus view; exact native flow untested. | [Open](screens/tiimo-store.png) |
| [Hevy](https://www.hevyapp.com/features/) | Published app screen | Previous values sit beside current sets, reps and load; completion highlights the row. | Use this information hierarchy for quick logging, with offline recovery. | [Open](screens/hevy.png) |
| [MacroFactor](https://macrofactor.com/macrofactor/) | Published app screen; partly occluded | Program updates explain changes alongside a Strategy check-in. Cookie banner obscures the lower right. | Make weekly changes inspectable; distinguish estimated trends from observed measurements. | [Open](screens/macrofactor.png) |
| [Finch](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) | App Store preview | Companion art and small goal checklists connect daily actions with visible progress. | Provide optional emotional rewards and supportive return after missed days. | [Open](screens/finch-store.png) |
| [Habitica](https://habitica.com/static/features) | Published web-app screen | Habits, Dailies, To-Dos and Rewards occupy separate columns under character statistics. | Reuse the progression principle; keep the phone Today view simpler and omit missed-day damage. | [Open](screens/habitica-ready.png) |
| [Ladder](https://www.joinladder.com/) | Published app screen | Weekly completion indicators sit above a prominent recommended workout card. | Make the next session clear; coordinate it with the rest of the user's day. | [Open](screens/ladder-clear.png) |
| [Calisteniapp](https://calisteniapp.com/workouts/smart) | Public library interface | Ability filters and visually distinct skill cards organize training choices. | Use prerequisite and level labels; retain a less image-heavy accessible list option. | [Open](screens/calisteniapp.png) |
| [stoic.](https://www.getstoic.com/features) | Feature illustration | Morning preparation and evening reflection are visually separated. | Use brief contextual reflection with verified quotation provenance. | [Open](screens/stoic-ui.png) |
| [Cronometer](https://cronometer.com/gold/) | Feature illustration; partly occluded | Energy/macro summaries and nutrient detail are presented as distinct benefits. A cookie notice remains. | Show a simple daily summary with reliable nutrient detail one level deeper. | [Open](screens/cronometer-ui.png) |

## Inspection limits and corrections

- Initial Tiimo capture showed a loading background; subsequent homepage illustrations were occluded by consent UI. These are not clean app-interface evidence. The curated board uses the public App Store page instead.
- Initial Habitica capture showed a loading screen; a later ready-state capture shows the published web-app example.
- The first Ladder detail locator selected a hidden image and timed out. The visible image was then captured successfully; the failed attempt remains in interface-captures.json.
- Structured Web displayed an email signup gate. That entry screen was inspected, but no email was submitted or account created. See [entry capture](screens/structured-web-entry.png).
- MacroFactor and Cronometer captures retain partially occluding cookie notices. Only visible portions inform the visual notes.
- Store images/marketing examples can be older than the current shipped version. They are not proof of native accessibility, notification delivery, tap counts, offline reliability or algorithm quality.
- Public help text supplies workflow details where screenshots are limited. No closed-source code or internal implementation was obtained.

## Reproduction files

[capture-public-pages.cjs](capture-public-pages.cjs), [capture-interface-details.cjs](capture-interface-details.cjs), [finish-visual-audit.cjs](finish-visual-audit.cjs). These are research utilities, not product app code. Their outputs are [initial captures](visual-captures.json), [detail/entry captures](interface-captures.json) and [final captures](visual-repairs.json).


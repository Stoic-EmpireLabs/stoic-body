# Stoic Body — competitor research and product direction

Reviewed October 4, 2026. Phase 1 expansion requested by the owner. This packet studies 24 direct or adjacent products using 50 public sources, maps 26 journey steps, and includes a visual reference board. It is input for the Phase 2 specification, not approval of a stack, price or prototype.

## Recommended combination

Build an original daily experience around **Structured/Tiimo's clarity, Sunsama's realistic planning, Hevy's fast workout logging, MacroFactor's explainable review, Cronometer's detail, and Finch/Habitica/Duolingo's sense of progress**. The recommendation is our synthesis; it has not been validated in a Stoic Body user test.

The essential loop is: capture a goal → approve a feasible plan → see the next action → complete/log → earn appropriate progress → review and adjust. Fitness, meals, business, study and family commitments participate in that same loop.

## Open the evidence

- [Visual interface board](interface-board.html): screenshots, observations and the proposed adaptations.
- [24-product comparison](matrix.md), with [structured data](matrix.json).
- [Every journey step](experience-patterns.md), with [structured data](experience-patterns.json): benchmark → Stoic Body behavior → phase → acceptance evidence.
- [50-source register](sources.md), with [access and limitation metadata](sources.json).
- [Visual audit](visual-audit.md): what was actually seen and what was not tested.
- [Verification](verification.md): integrity, coverage and browser checks.

## Which are actually top performers?

There is no single useful ranking across these categories. Use the metric that answers the question and keep its country, platform, period and source attached.

| Evidence | What was observed | What it establishes |
|---|---|---|
| Current US iPhone free Health & Fitness chart | Strava #1; Ladder #7; Cal AI #8; MyFitnessPal #10; Finch #11; Cronometer #20 in the fetched chart | Discovery/download momentum in one storefront; not revenue, retention or clinical effectiveness. [Apple chart](https://apps.apple.com/us/iphone/charts/6013?chart=top-free) |
| Historical US revenue estimates, Q4 2025 | Sensor Tower's leading group includes MyFitnessPal, Flo, Strava, Fitbit and Calm | A historical commercial signal. Its AI-authored summary reports estimates, not audited sales or a current global league table. [Sensor Tower](https://sensortower.com/blog/2025-q4-unified-top-5-health-and-fitness-revenue-us-600af518241bc16eb8dce802) |
| Company-reported active and paid users | Duolingo reports Q4 2025 figures of 52.7M daily active users, 133.1M monthly active users and 12.2M paid subscribers | Strong historical engagement/monetization scale, across its product; not proof a particular mechanic will improve Stoic Body. [Investor overview](https://investors.duolingo.com/company-strategy-overview-0) |
| Independent design recognition | Tiimo: Apple iPhone App of the Year 2025 | Editorial recognition of experience/design, distinct from sales leadership. [Apple award](https://apps.apple.com/us/story/id1847760015) |
| Vendor adoption claims | Structured advertises 15M+ downloads and 500K+ Pro users | Useful scale signal with unspecified measurement definitions/timeframe. [Structured](https://structured.app/) |
| Store ratings | Finch: indexed listing 4.9/757K ratings; rendered listing 4.9/759K, with a different rank | Large feedback sample, not a measure of active users. Snapshot differences are retained. [Finch listing](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) |

The remaining products are included for specialist relevance, not asserted to be best sellers. Flo, Fitbit and Calm are market context rather than full teardowns: cycle tracking, device ecosystems and meditation libraries are outside this first product's central workflow. Other chart leaders such as gym chains, trail services and walking-reward apps were screened at category level. No current Microsoft Store or global grossing ranking was established. No paid analytics account was used.

## What changes the product strategy

Nutrition and workouts already overlap in competitors. MacroFactor offers a nutrition/workout bundle, and Ladder promotes both workout and nutrition tracking. Merely combining these modules is therefore a weak positioning hypothesis. [MacroFactor bundle](https://help.macrofactorapp.com/en/articles/393-how-macrofactor-subscriptions-and-bundles-work), [Ladder](https://www.joinladder.com/)

Stoic Body's proposed advantage is coordination: a demanding study deadline reduces that day's discretionary training time; meal preparation gets real calendar space; boxing shares recovery capacity with lifting; family commitments stay protected; a missed session produces reviewable alternatives. This is a differentiation hypothesis, not proof that no competitor offers any of it.

The prior plan already anticipated many of these features. Research sharpens the interaction choices and adds explicit checks for the whole journey. It does not justify placing every competitor feature on the home screen.

## Proposed screen organization

| Area | Main job | Proposed contents |
|---|---|---|
| Today | Tell me what to do next | Current action, start/complete, next fixed commitment, compact timeline, relevant reflection, modest XP feedback |
| Plan | Make the week feasible | Calendar, inbox, availability, locked blocks, deadlines, capacity and a change preview |
| Train | Guide and record movement | Today's session, sets/rounds, technique, substitutions, equipment profiles and recovery |
| Fuel | Make food decisions/logging easy | Saved meals, editable food drafts, comparison library, recipes, groceries and optional eating window |
| Growth | Show meaningful advancement | Campaigns, learning milestones, measurements, weekly review, journal and optional rewards |

On phone, use five stable destinations and one quick capture control. On Windows, use the same names in a sidebar, with more room for the calendar and session detail. Account, privacy, imports and notification settings remain available through a clearly labeled settings area. All of this is proposed for Phase 2/3 review.

Keep the purple/charcoal/gold option in the original brief. Use color plus text/icons for activity categories; reserve gold for important progress feedback. Calm mode keeps the same navigation while reducing animation, streak emphasis and decoration. Competitor screenshots remain reference evidence; Stoic Body uses its own assets, writing and interaction design.

## Highest-value adaptations

1. **A useful first day before exhaustive setup.** Ask enough to produce a modest draft, then continue the roughly 20-area interview when its answers change decisions. Unknowns stay visible.
2. **One task record across modules.** A scheduled workout opens the same workout that logs sets; the meal plan drives shopping and preparation; completing a learning session updates its milestone once.
3. **Fast input with correction.** Show previous sets and saved meals; photo/voice/import results are drafts until reviewed. Calendar parsing shows the interpreted time.
4. **Available-time controls.** A shorter session, equipment substitution or minimum viable day should be reachable from the affected action, with a visible plan consequence.
5. **Explain plan updates.** Weekly review shows what changed, why, which data supported it and how uncertain it is.
6. **Reward sustainable follow-through.** Keep the proposed XP schedule, reversible awards, optional grace days and recovery credit. Practice completion is separate from skill mastery or body outcomes.
7. **Protect family and school commitments.** Confirm uploaded deadlines, preserve chosen family blocks, and avoid moving commitments silently.
8. **Make return after interruption welcoming.** Offer keep, shorten, move or drop; distinguish a skipped task from a failed person.

## Mechanisms to change or leave out

Habitica documents health-point loss for missed dailies; that conflicts with the owner's no-punishment rule. Keep progression while omitting that penalty. [Habitica FAQ](https://habitica.com/static/faq)

Photo-food products emphasize speed, and Zero emphasizes timing. Their interfaces are useful references, but marketing claims about precise image nutrition or physiological fasting stages do not establish clinical validity. Stoic Body requires uncertainty/correction and gives no rewards for deeper restriction. [Cal AI listing](https://play.google.com/store/apps/details?id=com.viraldevelopment.calai), [Zero](https://zerolongevity.com/)

Hardware tracking is unnecessary for the requested shadowboxing mode. Retain rounds, cues and logs without promising unmeasured punch statistics. Public FightCamp pages show different packages/tier prices, so its exact current offer remains unresolved. [Home packages](https://joinfightcamp.com/at-home), [Membership tiers](https://meals.joinfightcamp.com/work/memberships)

Social feeds, public physique rankings and competitive streak pressure are not required for the core loop. Consider opt-in accountability later if user research supports it. Brand assets, exact competitor copy and their proprietary internal algorithms are not implementation specifications.

## Commercial lessons and price evidence

Observed USD examples: Todoist Pro $60/year in indexed pricing; MacroFactor single app $71.99/year; MyFitnessPal Premium $79.99/year and Plus $99.99/year; Fitbod $95.99/year; Sunsama $204/year or $22 monthly; Cronometer Gold $10.99 monthly. Pricing context and sources are in the product matrix. These are different products/offers and do not establish what people will pay for Stoic Body.

This research keeps free-to-try plus a paid upgrade as an option; it does not select a price or billing model. Before deciding, estimate food-data licensing, content production, support, stores and any optional AI/sync costs. A lifetime purchase cannot promise indefinite costly hosted services without a credible funding plan. Test actual usefulness and willingness to pay with consenting pilots.

The purchase flow should state the full charge, period, renewal, included features, restore route and cancellation route. Users retain their history and export access if they stop paying. The Phase 6B decision remains reviewable.

## Research and validation for every next phase

The 26-step map covers discovery, onboarding, planning, exercise, meals, rewards, missed days, progress, reflection, reminders, privacy, purchase/cancellation and export. Each row names acceptance evidence. Carry those IDs into the specification and prototype; recheck technical/health/store sources before their implementation phase.

Success is not measured by raw screen time. Proposed pilot measures are first useful plan, successful task completion, time to common logs, recovery from a missed day, and voluntary return that produces a meaningful action or review. Measure before choosing numerical retention goals. No causal uplift, market-size forecast or customer demand has been invented.

## Evidence boundary and next checkpoint

Public pages, help documentation, store previews and rendered promotional UI were inspected. Structured Web's entry screen required email signup; no account was created. No native app was installed or subscription purchased. Native onboarding, private settings, real notification reliability, paywalls after login, cancellation execution and long-term personalization remain untested.

This is a completed public-evidence comparison with explicit gaps, not an exhaustive audit of every competitor/version. Phase 2 remains awaiting approval of the expanded Phase 1 packet. Its job is to turn the selected patterns into one coherent specification with measurable acceptance criteria.

Shared-workspace observation: Next.js source, dependencies and build/deployment configuration appeared during this research. They were preserved. This packet does not validate their functionality, publishing status or correspondence with the proposed design. Reconcile that work before implementing the Phase 2 choices.

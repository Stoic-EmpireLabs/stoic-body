# Phase 3 — visual prototype review

Date: 2026-10-04. Phase 2 provisionally approved by “for now yes.” Phase 3 design approval remains pending. The later direct request to upload to the user's Vercel and GitHub accounts authorizes this publication step; it does not approve Phase 4 or app-store submission.

## Open the result

- [Three design directions on Vercel](https://stoic-body-mmzb80wyk-stoic-dev-team.vercel.app/gallery.html) — existing Vercel account authentication applies.
- [Prototype source on GitHub](https://github.com/Stoic-EmpireLabs/stoic-body/tree/main/prototypes/phase-3).
- [Local gallery](http://127.0.0.1:4327/gallery.html), while the preview server is running.
- [Existing separately developed app](https://stoic-body.vercel.app), preserved. It is not the same artifact as this design preview.

## What was completed

The user selected red, black and gold on 2026-10-04. The default direction is now Crimson & Gold: black surfaces, deep red actions, brighter red navigation accents and gold progress/reward details. This replaces the earlier purple Stoic Night proposal. Quiet Marble and Training Journal remain as previous alternatives; the revised gallery labels them accordingly. The internal night URL key is retained so existing preview routes still work.

Five primary destinations — Today, Plan, Train, Fuel and Growth — lead to eleven preview screens: Today, Plan, Train, Fuel, Growth, Goals, evening reflection, weekly review, onboarding, imports and settings. Phone navigation moves to the bottom; tablet and desktop layouts use the available space. The prototype includes calm mode, reduced-motion behavior, keyboard focus styling and labeled controls.

All examples use the fictional profile Alex. Sample planning and logging interactions operate in memory and reset on refresh. Appearance preferences alone are saved in this browser. No owner intake, account, real file upload or external AI service is connected.

## Review this journey

1. Complete Movement & strength on Today: XP changes from 80 to 105 and Level 1 becomes Level 2. Undo returns the same award. Partial completion followed by full completion totals 25 XP.
2. Open Move for the portfolio session. Compare the proposal, cancel it, then accept it. The sample fixed commitments stay in place.
3. Open Train. Log a sample set, explore an exercise alternative and try the two-round shadowboxing timer. Reduced-capacity choices shorten the sample workout across Today, Plan and Train.
4. Open Fuel. Add a sample meal and water entry, then inspect the comparison cards. These are content layouts; a complete, reviewed nutrition library remains Phase 5 work.
5. In Settings, choose Edit profile & preferences. The twenty questions are grouped; answers can be skipped and reviewed. Choosing a fifteen-minute session changes the sample daily plan.
6. Inspect the academic import fixture. A timezone must be chosen, an ambiguous deadline stays excluded and confirmation adds the sample seminar once. This is a fixture, not an actual PDF parser.
7. Explore Growth, the weekly review, calm mode and the explicit sync-conflict choice. Evaluate the experience at phone width as well as desktop width.

## Requirements represented

These are partial design evidence, not production acceptance claims. The full 96-row register remains authoritative.

| Requirement IDs | Visible evidence | Production work still required |
|---|---|---|
| P03–P06 | Review packet, phase ledger, preview disclosure and scoped upload manifest | Continue actual phase approvals and evidence |
| D01–D03 | Twenty grouped onboarding questions, skip/back and sample answer effects | Resumable private profile and real personalization |
| S01–S09 | Shared daily timeline, goals, completion, partial completion, move proposal and lighter day | Real planner, constraints, recurrence, drag behavior, persistence and full undo |
| S10–S11 | Import timezone choice, unresolved date exclusion and confirmation | Actual time parsing, DST, recurrence and conflict checks |
| N01–N06, N09 | Nine grouped comparison cards, liquid subtypes and sample logging | Complete reviewed diet entries, reliable nutrients and suitability screening |
| F01–F05, F11 | Workout plan presentation, alternatives, set logging and home-boxing timer | Individually suitable programs, validated progression and recovery rules |
| L05 | Coach-led cheer-learning path | Verified resources and coached prerequisites |
| G01–G06 | XP feedback, correction, partial completion, levels, review rewards and calm mode | Durable ledger, concurrent-device idempotency, all boundary tests |
| Q01–Q03 | Clearly labeled original reflection, tone and favorites controls | Sourced quote library, history and daily selection |
| V01–V03, V06–V07 | Selected red/black/gold theme, responsive journeys and focused keyboard checks | Updated-screen approval, usability session, contrast and assistive-technology audit |
| V04–V05 | Staged import and explicit confirmation | Real file validation, extraction, private storage and malicious-file cases |
| B11 | Visible device/sync state and explicit conflict simulation | Authenticated automatic cross-device sync at launch |

## Research applied

The earlier [24-competitor study](research/competitors/README.md) and [26-step experience map](research/competitors/experience-patterns.md) remain the basis for adaptation. On this phase, the public [Structured product page](https://structured.app/) and [Hevy product page](https://www.hevyapp.com/) were refreshed for visual day planning and low-friction training logs. These observations inform an original interface; they do not prove retention or commercial performance. Dialog behavior follows the [W3C modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) with containment, Escape and trigger-focus restoration checked.

## Verification and limitations

[Verification record](phase-3-verification.md): 126 general browser checks and 18 appearance checks passed, plus gallery checks at three widths and three theme-link checks. The scoped prototype lint and JavaScript typecheck pass. Seventeen screen captures and a gallery image are available in the prototype directory. The complete production accessibility and native-device alarm checks remain future work.

No native app, login, persistent health log, automatic sync, actual file extraction, encryption, purchases or dependable closed-app notifications is implemented by this prototype. Some controls acknowledge a proposed action in a dialog. Settings and sync screens are explicitly simulated. Diet cards and workout examples are design material, not an individualized prescription. Forecasts are fictional and do not calculate the owner's progress.

The separate app changed during this workstream. Its TypeScript check now passes again; its earlier Phase 2 assessment is a historical snapshot and should not be treated as a current complete code review. This workstream did not change its product source or replace its production deployment.

## Next checkpoint

The palette is selected. Review the revised red/black/gold screens and approve or revise the daily journey. Phase 4 then implements the approved core: resumable onboarding, goals, feasible scheduling, persistent checklists and XP, sync at launch and actual reminder adapters. Hosting, Apple build access, minimum OS versions and commercial choices remain unresolved. Publishing this preview does not satisfy those decisions or grant approval for later phases.

## Theme and color controls — user addition

The user approved the red/black/gold direction and requested a theme and color setting. Settings now includes Dark, Light and System modes, three presets, separate custom accent/reward color pickers, immediate preview and reset. The header gear opens these controls on phone and desktop. Color pairs adjust for readable text. Appearance alone survives refresh in local browser storage; this does not implement account/device synchronization. [18 focused checks](../prototypes/phase-3/appearance-verification.json) cover media changes, persisted colors, default recovery, separation from sample logs and unavailable storage.

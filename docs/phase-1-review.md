# Stoic Body — Phase 1 review packet

Date: 2026-10-04
Status: research and discovery packet ready for review; Phase 1 exit approval pending.
Phase 0 approval: user said “Great. continue throguh phases” on 2026-10-04.

## Outcome

The brief now supports a concrete architecture decision: a commercial, enjoyable life-planning app with an offline-capable core, a shared calendar, health-content boundaries, reviewed imports and platform-specific reminders.

The owner-first profile has 28 goals/routines, including home boxing and the parent goal of helping a daughter become a cheer flyer. The product register now has 95 requirements. The initial research register has 37 official or original-research sources. The competitor expansion adds a separate 50-reference register, 24-product comparison, ten curated visual references and a 26-step experience map, with access limits recorded.

## Review these artifacts

- [Competitor research and recommended adaptations](research/competitors/README.md).
- [Visual interface board](research/competitors/interface-board.html) and [every journey step](research/competitors/experience-patterns.md).

- [Nutrition, training and family learning](research/health-and-training.md).
- [Platform and commercial feasibility](research/platform-and-launch.md).
- [Learning resources and import plan](research/learning-and-resource-plan.md).
- [Source register](research/sources.md) and [machine-readable sources](research/sources.json).
- [Discovery readiness and open decisions](phase-1-discovery.md).
- Owner-only [profile](../private/personal-profile.md) and [goals](../private/goals.md).
- [Full requirements](requirements.md).
- [Artifact verification results and limits](phase-1-verification.md).

## Recommended product direction — proposed, not yet selected

1. Build a fast Today loop: see next action → do/log it → receive progress feedback → continue the day.
2. Use a shared native-capable app, evaluating Flutter first against the web/wrapper and separate-native options.
3. Keep core scheduling, local logs, goals, XP and manual editing independent of AI and network availability.
4. Use native reminder/alarm adapters where supported. Expose real permission/capability state and verify each device scenario.
5. Preserve OMAD as a user preference, with evidence/suitability review and adequate-intake checks before individualized recommendations.
6. Incorporate boxing workload into the same training/recovery model.
7. Support the cheer goal through qualified instruction and supervised progression. XP or a video watched cannot establish stunt readiness.
8. Review uploaded academic schedules before calendar changes, with deduplication, conflict handling and undo.
9. Pilot usability with the owner first, then test the commercial proposition with consenting adults. Broader demand and price remain unvalidated.
10. Evaluate a free-to-try core with a one-time local-feature upgrade; consider subscriptions only when ongoing value/costs justify them.

The architecture recommendation is an engineering judgment based on the device and reminder requirements. It is not a claim that a framework or plugin is installed, compatible or execution-tested.

## Main findings

- Diet timing alone should not be sold as universally superior. The evaluated trials and guidance require attention to population, protocol and uncertainty. See [health review](research/health-and-training.md).
- Native alarm capabilities differ across Apple and Windows; web push does not establish equivalent offline alarm behavior. See [platform review](research/platform-and-launch.md).
- iOS builds need a supported macOS/Xcode route. Local read-only discovery found no Flutter/Dart command on PATH; no SDK was installed.
- Store distribution needs an explicit launch budget and account/setup work. Checked standard enrollment figures: Apple USD 99/year, Google Play USD 25 one-time; Microsoft's current new onboarding flow states no fee. These do not include all launch/operating costs. See linked official sources in the platform review.
- Actual health personalization remains dependent on missing inputs. The app's data model can support unknowns and safe manual workflows without inventing answers.
- The first release can support an adult parent's family goals without automatically becoming a children's app or creating a child profile. This is a proposed scope boundary for Phase 2 review.

## Success criteria proposed for approval

| Criterion | Proposed acceptance evidence |
|---|---|
| Next action is obvious | Owner and pilot testers identify it within about five seconds on Today |
| Routine completion is easy | At most two taps for an already-planned simple task |
| Logging feels quick | Common saved-entry flows target about ten seconds; new detailed records are measured separately |
| Game feels worthwhile | User can describe how rewards help follow-through; effects, streaks and reminders can be reduced |
| Schedule is realistic | No locked-obligation conflict; capacity overload is explained rather than hidden |
| Offline data is trustworthy | Core actions persist through restart and reconnect without duplicate XP |
| Family time is protected | Selected family blocks survive replanning |
| Sources are honest | Diet/resource/quote evidence and uncertainty are inspectable |
| Imported dates are trustworthy | User reviews source-linked extraction before calendar mutations |
| Pilot is useful | A voluntary 14-day pilot tracks friction, usefulness and return use; no invented retention/revenue target |

These targets are proposals and have not been measured. Commercial analysis is qualitative at this stage because there are no actual customer, retention or sales data.

## Coverage and verification

Research informs nutrition requirements N01–N14, training F01–F11, learning L01–L05, imports S11/V04/V05, reminders/privacy T01–T06 and commercialization B01–B09. Source coverage varies and production content still needs focused review.

The initial packet's verification is retained as a historical snapshot. The current expansion has 95 requirements; its fresh checks are in [competitor verification](research/competitors/verification.md). Boxing and cheer-support additions remain preserved with unknown readiness inputs explicit. Research utilities and the reference board are distinct from product app code.

No app capability, store acceptance or clinical personalization is claimed from documentation alone.

## Open decisions and dependencies

- Mac/build-host access: asked; answer pending.
- Minimum device OS versions and whether prominent AlarmKit alarms justify a newer Apple OS minimum.
- Android timing; proposed later release based on confirmed first-release targets, pending user decision.
- Monetization, price, launch markets and enrollment budget.
- Optional accounts/sync and exact AI/provider boundaries.
- Actual personal health inputs and fixed obligations; the private profile records the gaps.
- Academic dates will be supplied through the intended future in-app schedule upload.
- Coaching access and readiness for the cheer-support goal; do not infer them.

These issues are visible inputs to Phase 2 or later personalization. They do not prevent reviewing this evidence packet.

## Phase 2 deliverables after approval

A written product specification; screen/user-flow inventory; shared data model; scheduling/recurrence/XP rules; privacy/threat model; finalized platform/build decision; import/reminder contracts; and separate implementable plans for core, health, content/imports and commerce.

No product code, infrastructure purchase, account creation, external message or public publication is authorized by this packet alone.

## Approval checkpoint

Review the proposed direction, success criteria and open assumptions. Approval of Phase 1 authorizes writing the Phase 2 specification and architecture. Phase 2 still ends with review of its concrete specification and implementation plans.


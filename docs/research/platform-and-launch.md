# Platform and commercial feasibility — Phase 1

Reviewed 2026-10-04. First-release targets: iPhone, iPad and Windows PCs. Google Play remains a distribution goal; Android release timing is open.

## Platform comparison

Recommendation for Phase 2 evaluation: a shared native-capable application, with Flutter as the leading candidate. This is an architectural recommendation, not an approved stack or an installed environment.

| Criterion | A — Flutter + native platform integrations | B — Web/PWA + mobile wrapper + Windows approach | C — Separate native applications |
|---|---|---|---|
| iPhone/iPad and Windows | Framework supports the relevant mobile/desktop targets | Capacitor supports iOS/Android/Web; Windows needs a separate wrapper or PWA strategy | Dedicated implementation for each target |
| Later Android | Reuse core UI/logic, with Android integration work | Mobile wrapper path available | Another platform implementation |
| Offline data | Design local storage and migrations with per-platform verification | Browser/native persistence differences need explicit treatment | Native persistence per application |
| Alarms | Native APIs via maintained plugins or custom bridges | PWA push is not equivalent to native offline alarms; wrapper bridges required | Direct platform API integration |
| UI and gamification | Shared custom UI is a good candidate; verify accessibility and platform fit | Strong web iteration; native-shell behavior still needs testing | Highest per-platform control with more duplicated work |
| Local environment | Flutter/Dart not found on PATH in this check | Node found; wrapper/Windows build tools not verified | dotnet found; Apple development toolchain unavailable on Windows |
| Main tradeoff | New toolchain and integration validation | More delivery surfaces and potential reminder mismatches | More implementation/maintenance effort |
| Decision | Leading candidate, conditional on approved setup/build route | Useful comparison/prototype route, not proof of native app capability | Reserve if platform requirements defeat shared implementation |

Framework support and tooling facts: [P01: Flutter platform integration](https://docs.flutter.dev/platform-integration); [P02: Flutter desktop support](https://docs.flutter.dev/platform-integration/desktop); [P03: Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup). Relative implementation effort and the recommendation are engineering judgments, not benchmark measurements.

## Reminder capability

- Apple: AlarmKit provides prominent alarms on iOS/iPadOS 26 with user authorization. Other notification paths and older-version behavior must be separately specified. [P05: Wake up to the AlarmKit API](https://developer.apple.com/videos/play/wwdc2025/230/)
- Web: WebKit documents Home Screen Web Push. This does not establish a local offline alarm engine or guarantee identical closed-app behavior. [P04: Web Push on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- Windows: scheduled notifications can appear without the app running, but a documented delivery window can cause missed notifications when the computer is off. Show missed events on return and test the exact chosen implementation. [P06: Schedule an app notification](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-scheduled)

Proposed requirement: distinguish “task reminder” from “alarm.” Let users explicitly select high-salience alarms where the OS supports them. Display permission/capability state and a test-reminder action. Do not promise delivery when a device is powered off.

Acceptance matrix must cover foreground, background, closed app, locked device, denied/revoked permission, reboot, offline, clock/timezone changes and quiet modes. No row has been execution-tested yet.

## Build feasibility

Flutter's supported iOS setup requires macOS. Capacitor's iOS workflow uses Xcode on a Mac. [P01: Flutter platform integration](https://docs.flutter.dev/platform-integration); [P03: Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup)

A read-only PATH check found node, git, PowerShell and dotnet. It did not find flutter, dart or cl. Absence from PATH is not proof a tool is absent from disk. No SDK, compiler, workload or account was installed.

Mac/build-host availability has been asked and remains pending. Windows planning and later approved prototype work can proceed; a verified iOS build/signing route is required before claiming an iPhone release.

## Store costs and requirements

These are researched launch dependencies, not approved spending. Regional terms, taxes and account eligibility must be rechecked when enrolling.

| Store | Enrollment information checked | Other dependencies |
|---|---|---|
| Apple App Store | Standard Developer Program: USD 99/year. [C01: Apple Developer Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment) | Signing/build route, account identity, app review, privacy/health disclosures and appropriate purchase flow |
| Google Play | USD 25 one-time registration. [C02: Get started with Play Console](https://support.google.com/googleplay/android-developer/answer/6112435) | Android build, applicable health declaration and test/production access requirements |
| Microsoft Store | Current new onboarding flow states no registration fee; use the documented entry route. [C03: Open a Microsoft Store developer account](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account) | Account verification, suitable Windows package and certification |

Google's defined new personal-account class requires at least 12 testers continuously opted in for 14 days before applying for production access. Do not assume this applies to every account or guarantees approval. [C07: New personal developer account testing](https://support.google.com/googleplay/android-developer/answer/14151465)

Health-related privacy/claims need review under each store's rules. Apple's purchase rules and Google's health declarations are different obligations; use the actual functionality and release region to determine requirements. [C04: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/); [C05: Health and fitness apps](https://developer.apple.com/health-fitness/); [C06: Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en-GB)

## Business-model comparison

These are proposals; there is no customer willingness-to-pay dataset yet.

| Option | Fits | Main consequence |
|---|---|---|
| Free core + one-time paid local features | Owner's offline/local-first direction and a clear upgrade | Ongoing support/content work must be funded without assuming recurring revenue |
| Subscription | Continuing content, support or explicitly chosen recurring services | Requires demonstrable ongoing value and transparent renewal/cancellation |
| Upfront paid app | Simple proposition with no in-app feature purchase | People have less opportunity to try the core loop before paying |

Provisional recommendation: pilot the core loop first, then test a free-to-try/one-time local upgrade proposition. Add a subscription only if its ongoing value and costs are established. Do not decide a price from intuition or promise revenue.

For restorable Apple purchases, provide a restoration path. Cross-store purchases/entitlements and account-free use require a separate decision; a purchase on one store does not automatically become a verified entitlement in another. [C08: Apple in-app purchase](https://developer.apple.com/in-app-purchase/)

## Commercial positioning proposal

“Plan your real life as a game, with fitness, learning, work and family in one feasible day.”

Initial audience hypothesis: adults juggling several responsibilities who want a coherent plan and satisfying progress. This comes from the owner's use case; demand beyond the owner is unvalidated.

Pilot evidence to collect with consent: can testers find the next action, complete routine logging, recover from a missed day and explain whether the plan helped? Favor task success and usefulness over raw screen time.

Draft marketing assets and store listings later using synthetic examples. Keep the owner's profile, family details, photos and academic records out of public assets. No accounts, advertising, purchases or publication are performed in this phase.


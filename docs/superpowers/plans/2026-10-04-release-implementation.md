# Stoic Body Commercial Verification and Delivery Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phase 6B, 7 and 8 each retain their own review gate; this document does not authorize all three together.

**Goal:** Produce reviewable native release packages, honest commercial assets and independently reproducible acceptance evidence.

**Architecture:** Store adapters remain outside the core domain. Operational backend, privacy controls and test evidence must support the promises in listings.

**Tech Stack:** Approved client/server stack and native store SDKs; native headless Playwright for any web surface, native device tests for installed apps.

**Spec:** [Product](../../architecture/product-spec.md), [platform/costs](../../architecture/platform-and-sync.md), [privacy](../../architecture/privacy-and-reliability.md), [success measures](../../architecture/success-measures.md).

## Global constraints

- No purchases, accounts, public publication or irreversible actions without approval.
- Automatic cross-device sync is now required at launch.
- Core scheduling, logging and XP remain useful offline and without AI.
- Typecheck and lint before claiming code complete; TDD for core logic.
- Clearly label simulated, implemented and execution-verified features.

## Review focus

Cross-store entitlement mismatch (R01); owner data in marketing/builds (R02); device-only alarm failure (R03); restore/deletion after outage (R03); support/hosting costs and update recovery (R04).

## R01 — Approved offer and store entitlements, Phase 6B

After pricing/free-paid boundaries are approved, create apps/stoic_body/lib/platform/purchases.dart and test/purchases_test.dart. Interface: `Future<EntitlementState> refreshEntitlements(StoreContext context)`; never trust an arbitrary client boolean or a founder seed.

- [ ] Refresh store rules for selected countries and actual account types; document price, renewal/cancellation if any, platform scope, refund behavior and restoration path.
- [ ] Write failing adapter tests for purchase success/cancel/failure, restore, revocation/refund and offline entitlement state. User data/export remains accessible after loss of paid access.
- [ ] Implement only approved store adapters; test in authorized sandbox accounts with real receipts. If no monetization model is selected, keep commercial implementation explicitly unstarted.
- [ ] Run relevant tests, Flutter analyze and server typecheck/lint. Record verified versus simulated purchase cases and obtain Phase 6B review after R02.

## R02 — Packages, listings and support, Phase 6B

Create docs/release/{device-matrix,store-checklists,costs,claims,support}.md and assets under marketing/synthetic/. Account/signing files stay outside source.

- [ ] Prepare iPhone/iPad and Windows packages using the approved signing/build route; Android remains separately scoped. Verify metadata, privacy disclosures, age rating and support contact against actual functionality.
- [ ] Use synthetic screenshots; scan source/build assets for owner records, secrets and placeholder claims. Resolve baseline blockers before producing any new public build.
- [ ] Compare store presentation with the researched discovery journey; validate that a tester can explain the product from its first screens. Do not infer conversion from competitors' downloads.
- [ ] Present package provenance, required costs/accounts, unverified limits and proposed submission text for review. Publication and enrollment remain separate explicit actions.

## R03 — Complete acceptance, Phase 7

Create apps/stoic_body/integration_test/{journey,sync,restore,accessibility}_test.dart; services/sync/tests/{isolation,load,recovery}.test.ts; docs/verification/release-acceptance.md.

- [ ] Implement meaningful assertions for onboarding impact, schedule conflicts, XP restart/retry/undo, learning/food/workout coexistence, imports, quotes, sparse measures and forecast assumptions.
- [ ] Test two accounts and two devices per account, malformed inputs, account deletion, revoked sessions, disk/process failure, backup restore and schema upgrade rollback.
- [ ] Run analyzer, app tests, server typecheck/lint/tests and selected browser checks; inspect failures instead of trusting printed success labels.
- [ ] Test actual native reminders in the documented device matrix and keyboard/VoiceOver/Narrator/reduced-motion/large-text workflows. Record delivery observations and unsupported behavior.
- [ ] Run a bounded pilot and representative sync load test; report n, duration, workload, latency/errors and limits. No unmeasured availability or scale guarantee.
- [ ] Reconcile every requirement to evidence or explicit unresolved/deferred state; obtain Phase 7 approval.

## R04 — Reproducible delivery, Phase 8

Create docs/release/{setup,user-guide,operations,maintenance,delivery}.md and final requirement receipt.

- [ ] Verify clean-machine setup/build against recorded toolchain and lockfiles; verify installed app launch and account recovery on selected devices.
- [ ] Run an isolated server backup/restore drill; document monitoring, capacity triggers, incident response and version rollback without dropping user data.
- [ ] Provide source/package versions, release notes, privacy/backup guide, support/update responsibilities and actual ongoing costs.
- [ ] Present final store submissions for explicit per-store publication approval. Record prepared/submitted/in-review/available separately; a successful upload is not an approved listing.

Contract type definitions: [interface catalog](../../architecture/interface-catalog.md).

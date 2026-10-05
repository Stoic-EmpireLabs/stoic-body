# Stoic Body 0.6.0 — self-service fitness setup

2026-10-05, America/Denver.

## Implemented

- Fitness-first choices: bulk, cut, lean out/recomposition, maintain. Optional male/female reference pictures describe a starting point without inferring health or metabolism from appearance.
- Named eating styles plus a separate timing choice: regular meals, two meals, intermittent fasting and OMAD. Liquid choices distinguish partial replacement, total replacement and prescribed clear/full liquids.
- Live estimated energy/protein from confirmed measurements, equation selection and activity. Cut/bulk adjustments are transparent product heuristics. No calorie target or dieting recommendation for excluded/insufficient profiles; contradictory health notes are unresolved.
- Selectable availability and sleep/meal presets. Training experience changes starting sets; short full-body sessions retain pushing, pulling and legs.
- Completing setup saves the first week and opens Today automatically. Past availability does not consume future strength recovery. New plans retain atomic acceptance/retry protection.
- Daily habits and labeled original Stoic-inspired reflections. Learning/course questions removed; existing records and optional learning tools preserved.
- Private offline calculation. No remote AI service, billing or external photo processing is connected.

## Verification

- 178 automated tests passed on the final source.
- Typecheck and lint passed.
- Windows package integration passed: manifest allowlist and hashes, actual installed shortcut, clean signup, bundled service launch/reuse/stop/restart, and native photo decoder persistence.
- New browser journey fills the actual fitness/food/habit choices, verifies live calculations, completes setup, starts a generated workout, reloads and confirms no duplicate sessions. Synthetic desktop/mobile screenshots: `docs/evidence/self-service/`.
- Independent read-only code review found three problems: unsafe recommendation text despite numerical exclusions, notes bypassing exclusion, and elapsed workouts affecting future recovery. All three corrected with regressions.
- Design detector: retained learning-only legacy border warning outside this correction; removed thick plan border. First-use navigation hidden to reduce distraction. Mobile check has no horizontal overflow.

## Honest limits

This is an automatic rules-and-calculation planner, not a deployed generative AI agent or a human trainer service. Static generic body examples are not client-specific goal renders. That separate local image-model work remains pending.

Recipe portions are calculated examples, not a complete nutritionally validated menu for every listed diet. Medical liquid programs are never auto-prescribed. Keto/carnivore/vegetarian/vegan preferences do not silently receive an incompatible meat-and-rice menu. The nutrition panel explains what is and is not generated. One bowl is not a complete OMAD day. No precise body-fat or arrival-date prediction is made.

The Vercel site distributes the Windows package; private accounts run locally. Native Apple clients, guaranteed native alarms and Store releases retain their previous unfinished status.

Research and adopted patterns: [self-service research](../research/self-service-setup.md).

## Release verification

- Source/build commit: `2432f8a13ea359b6e5d4c46000634c865d60473e`.
- [GitHub Windows preview 0.6.0](https://github.com/Stoic-EmpireLabs/stoic-body/releases/tag/v0.6.0-local-pilot) published. ZIP: 43,877,512 bytes; local and uploaded SHA256 agree: `8462dfebd1ff2c1b920cfab303c37564a8bfad1e17324be401ccd97dcb646fe6`.
- [Vercel download page](https://stoic-body-desktop.vercel.app/) returned HTTP 200 and the 0.6.0 download link.
- Installed package verified against its manifest. Existing desktop wrapper and both icons point to 0.6.0. Live `/api/identity` returned `0.6.0-local`; new setup script and reference artwork were served successfully.
- Fresh consistent SQLite backup created before switching. Both existing accounts, answer hashes and sync configuration preserved; database integrity `ok`. No user profile was rewritten during installation.
- Generic body artwork and the built-in generation prompt: [asset provenance](../../assets/brand/body-references.md).

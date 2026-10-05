# Optional Goal Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Recommended execution: native in this session after plan review.

**Goal:** Let consenting adult users create a labeled goal illustration from their own photo and compare it with actual progress.

**Architecture:** Account-scoped local photo storage feeds an optional, verified local image-edit provider through a server adapter. Rendering, exports and provenance distinguish generated illustrations from actual dated photos. Planning and scheduling remain independent of the provider.

**Tech Stack:** Existing Node/SQLite desktop application; local image-edit provider to be verified against the computer's available runtime and license. No new paid service, model download or external photo transfer is authorized by this plan.

**Spec:** [Approved redesign with requested photo addition](../specs/2026-10-04-adaptive-setup-design.md).

## Global Constraints

- Goal illustration — your actual results may look different.
- Private by default within the selected account.
- The assistant's image tool is not automatically an API available to the shipped app.
- Keep owner information under ignored private/; use synthetic test and public examples.
- Local processing is the default under the existing zero-paid-services rule.
- Core planning works when image generation is unavailable.

## Review Focus

1. An unconnected provider must never look like completed generation (Task 1).
2. Account switching, guessed media IDs or malicious filenames must not expose another person's photos (Task 2).
3. Location metadata or sensitive source paths must not leak into exports/logs (Task 2).
4. Retry/cancel must not duplicate results or revive a deleted source photo (Task 3).
5. Generated images must remain labeled when viewed or exported (Task 3).

## Task 1: Verify an image editor before promising generation

**Files:** create src/core/goal-image-provider.ts; tests/core/goal-image-provider.test.ts; docs/research/goal-visualization.md.

**Interfaces:** `GoalImageProvider.status():Promise<{available:boolean,reason?:string}>`; `generate(input:{image:Uint8Array,goalDescription:string,visualGender:'male'|'female'|null,signal:AbortSignal}):Promise<{bytes:Uint8Array,mime:'image/png',model:string,workflowHash:string}>`. Adapter configuration stays server-side; the browser cannot supply arbitrary URLs or executable workflow nodes. A null visualGender preserves the uploaded person's appearance without inferring a gender.

Add `buildGoalVisualBrief(input:{profileRevision:number,confirmedMeasurements:ConfirmedMeasurement[],trainingExperience:string,availableMinutesPerWeek:number,goalDescription:string,goalReview:GoalReview}):GoalVisualBrief`. Define `ConfirmedMeasurement {kind:'height'|'weight'|'waist'|'bodyFat',value:number,unit:string,measuredAt:string,method:string,uncertainty?:string}`; `GoalReview {status:'ready'|'needs-input'|'needs-professional-review',reasons:string[],sourceUrls:string[],reviewedAt:string}`; `GoalVisualBrief {eligible:boolean,goalDescription:string,profileRevision:number,assumptions:string[],missingInputs:string[],evidenceUrls:string[]}`. Only eligible, current briefs can reach the provider. Profile facts stay local; send only the minimum reviewed visual description and image. These interfaces preserve traceability, not a claim of exact physiological prediction.

- [ ] Inventory existing configured local image services without changing them. Verify an official image-edit workflow, commercial-use licensing and hardware requirements before selecting it. ComfyUI is a candidate, not an installed/verified fact.
- [ ] If none exists, present the specific installation/download requirements for user approval. Continue the core app work independently. Do not download models or call paid providers automatically.
- [ ] Write tests for unavailable provider, timeout, invalid output, oversized response, cancellation and loopback-only destinations; run and confirm failure before adapter implementation.
- [ ] Test that a real client source photo and current reviewed goal brief are required. Missing body-fat data remains unknown; no BMI-to-body-fat conversion, gender stereotype or target-weight-to-exact-appearance mapping is permitted. A changed profile invalidates a stale brief. Missing suitability inputs return actionable follow-ups instead of an invented transformation.
- [ ] Implement the selected verified adapter, then run a real synthetic adult image-edit request. Save model/workflow/version and output evidence. A mocked response alone does not pass this task.
- [ ] Require a real output, clear failure states and passing focused tests before committing the adapter as working.

## Task 2: Private photo intake and storage

**Files:** create src/core/photo-store.ts and tests/core/photo-store.test.ts; modify server.ts, account-bundle.ts; create tests/pilot/photos.test.ts.

**Interfaces:** `PhotoRecord {id,ownerId,kind:'source'|'actual'|'goal',createdAt,mime,byteLength,sourceId?,generationId?}`. Authenticated photo endpoints upload/list/read/delete by opaque ID; ownerId comes only from the session. File paths never come from client input.

- [ ] Write isolation tests for two accounts, bad signatures, traversal filenames, missing consent, oversized images and location-metadata removal on derived files. Set initial limits to JPEG/PNG/WebP, 10 MiB encoded and 24 megapixels decoded. Originals stay unchanged until explicitly deleted.
- [ ] Run the new tests; confirm failure. Implement binary validation, bounded decoding, random storage names, owner checks, no sensitive diagnostic logs and cancellation-safe deletion. Use an existing verified image decoder if available; dependency additions require provenance review.
- [ ] Add optional encrypted photo inclusion to backup/restore with size limits and clear exclusions. Keep routine device sync photo-free unless the user explicitly enables it; metadata must not expose another account's media. A backup without photos says so visibly.
- [ ] Run focused tests and roundtrips; require pass. Commit storage and private upload UI independently of generation readiness.

## Task 3: Visualization and progress comparison

**Files:** create apps/local-pilot/public/goal-visualization.js; modify setup.js, health.js, server.ts, index.html, styles.css, build-desktop.mjs; tests/pilot/goal-visualization.test.ts.

**Interfaces:** authenticated generation request references source photo ID, goal description, optional user-selected visualGender and explicit processing choice. Server resolves source ownership and delegates only to Task 1's configured provider. Store visualGender as an account-scoped editable preference and snapshot it in generation provenance; it is not a physiological calculation input. Persist queued/running/complete/failed/cancelled status and immutable generated-image provenance.

- [ ] Write tests for optional setup branching, skip/later access, multiple goal selections, source preview and processing disclosure, provider unavailable, cancellation, retry, source deletion, account switching and visible export labeling.
- [ ] Test **Male** and **Female** selections, persistence and later editing, matching example imagery and provider prompts, skipped selection with neutral placeholders, no inference from photos/names, preserved personal likeness and no automatic changes to nutrition/training calculations. Include the preference in backup/restore tests and real image review.
- [ ] Run focused tests and confirm failure. Build **See a picture of your goal**, **Add a photo**, **Skip for now**, **Generate illustration**, **Keep this image** and **Try again**. Preview the source and allow cropping/face exclusion without altering the original.
- [ ] Offer **Take a photo** where supported, requesting camera permission only when tapped; otherwise keep upload available. Confirm the actual client photo before rendering. Use authenticated source IDs and never substitute a stock subject if capture/upload fails.
- [ ] Add the optional **Male / Female** visual preference, with clearly matching examples. A personal photo remains the likeness reference. Ask for a visual preference before generating any generic person when none was selected.
- [ ] Preserve recognizable traits and use plausible proportions in the generation prompt. Ask the user to approve likeness; never interpret the result as measured body fat, a forecast or a training prescription. If the provider cannot preserve identity sufficiently, report that limitation instead of calling it a realistic prediction.
- [ ] Show the confirmed measurements, goal direction, review date and assumptions that informed the illustration. On a confirmed goal change, generate a new dated illustration while preserving the source and prior versions. Test with male/female selections and varied starting physiques; review likeness, anatomy, moderate changes and consistent framing manually. Document that visual QA does not validate predictive accuracy.
- [ ] Show Starting photo / Goal illustration / Actual progress with dates, optional matching-view comparison and hide/delete controls. Put the generated label on exported pixels, not only in file metadata. Do not use similarity to the illustration as a score.
- [ ] Re-run focused tests and a real end-to-end generation with a synthetic adult fixture. Verify no external requests, no private media in logs, and image provenance after restart/export/restore.
- [ ] Run project typecheck/lint and package verification; demonstrate to the user before the release checkpoint. Report separately if the provider remains unavailable.

## Evidence and open dependency

Hevy's [progress-photo feature](https://www.hevyapp.com/features/progress-photos/) and Fitbod's [consistent-photo guidance](https://fitbod.me/blog/how-to-take-progress-photos/) support comparison design, not predictive validity. [Comfy's Qwen Image Edit workflow catalog](https://comfy.org/workflows/model/qwen-image-edit/) is a local-editing research lead only; verify actual model license, dependencies and output quality in Task 1. No working local image provider is currently execution-verified.

Self-review: all photo-spec requirements map to these three tasks. The provider dependency is explicit and blocks claiming generation complete, while upload/comparison and the main app can still progress. No product implementation occurred while drafting this plan.

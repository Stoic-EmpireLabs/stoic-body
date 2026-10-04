# Decision log

| ID | Date | Decision or question | Status | Source / effect |
|---|---|---|---|---|
| DEC-01 | 2026-10-04 | Product is Stoic Body, connecting life planning, nutrition, training, learning and rewards | Confirmed | Current user brief |
| DEC-02 | 2026-10-04 | Each phase requires explicit user approval | Confirmed | Current user brief; no inferred approval |
| DEC-03 | 2026-10-04 | Phase 0 is documentation and planning only | Confirmed | Current user brief |
| DEC-04 | 2026-10-04 | Use C:/Users/stoic/AntigravityWorkspace/projects/stoic-body for persistent documents | Applied reversible organization choice | Workspace AGENTS.md project convention; no source app existed here |
| DEC-05 | 2026-10-04 | Carry zero-paid-services and local embedded storage into planning | Existing constraint | C:/Users/stoic/AGENTS.md; confirm needs in Phase 1 |
| DEC-06 | 2026-10-04 | Evaluate every skill; avoid duplicate or irrelevant invocations | Confirmed | Current user brief |
| DEC-07 | 2026-10-04 | Ease of use and wanting to return are leading product priorities | Confirmed wording; interpretation reviewable | User: “That its easy to use and addicting” |
| DEC-08 | 2026-10-04 | Next-action ≤5 seconds, routine completion ≤2 taps, common logging roughly 10 seconds | Proposed | Suggested measurable usability targets; not approved or measured |
| DEC-09 | 2026-10-04 | Missed tasks never reduce valid XP; undoing an accidental completion reverses only its award | Proposed clarification | Resolves source's no-punishment rule alongside completion reversal |
| DEC-10 | 2026-10-04 | Level thresholds follow 100 then +25 for each next level | Source rule; formula review pending | Threshold for level L is 100(L−1) + 25(L−1)(L−2)/2; L≥1 |
| DEC-11 | 2026-10-04 | Owner-first pilot of a commercial product for Apple App Store, Google Play and Microsoft Store | Confirmed intent | D-DEV-02; publishing still requires approval |
| DEC-12 | 2026-10-04 | First release: iPhone/iPad and Windows PCs. Android timing, alarms/offline/sync remain open | Device classes confirmed | D-DEV-03 and D-DEV-05; D-DEV-06 pending |
| DEC-13 | 2026-10-04 | AI/provider, exact stack, UI direction and optional integrations | Pending | Require discovery and phase approval |
| DEC-14 | 2026-10-04 | Health personalization cannot rely on image body typing or promise an exact physique | Confirmed | Current structured user brief |
| DEC-15 | 2026-10-04 | No automatic deployment, paid fallback or outside messaging | Confirmed | Current user brief and action boundaries |
| DEC-16 | 2026-10-04 | Split Phase 6 into 6A learning/coaching/imports and 6B commercial readiness | Proposed | Makes store and monetization work independently reviewable |
| DEC-17 | 2026-10-04 | Pricing, payment model, store costs, accounts and customer sync | Pending | Research/compare before implementation or spending |
| DEC-18 | 2026-10-04 | Save user-supplied personal intake separately from the public product brief, under private/ with a Git exclusion | Applied | Direct request to put personal information into the planning records; not a live app import |
| DEC-19 | 2026-10-04 | Capture 26 personal goals/routines with unknown dates and priorities left open | Applied | Direct user intake; see local goal register |
| DEC-20 | 2026-10-04 | Height, diet intent, equipment and desired sleep window are clarified in the private record; weight units, health constraints and fixed obligations remain open | Partially resolved | No assumed quantities or prescribed plan |
| DEC-21 | 2026-10-04 | Support an in-app academic schedule upload with reviewed extraction and calendar integration | Confirmed requirement | S11; academic dates not supplied yet |
| DEC-22 | 2026-10-04 | Phase 0 approved; proceed with Phase 1 research | Approved | Direct user instruction to continue through phases |
| DEC-23 | 2026-10-04 | Add home shadowboxing, footwork and fitness, with bag work conditional on equipment | Confirmed | Direct boxing preference; F11; no sparring requested |
| DEC-24 | 2026-10-04 | Add parent learning goal for helping daughter become a cheer flyer | Goal confirmed; coached route proposed | L05; no assumption of coach access or stunt readiness |
| DEC-25 | 2026-10-04 | Evaluate Flutter first with local core storage and native reminder adapters | Proposed, not selected | Phase 1 platform comparison; Mac/build route and minimum OS unresolved |
| DEC-26 | 2026-10-04 | Evaluate free-to-try core with one-time paid local features | Proposed, not selected | Phase 1 business-model comparison; no price, purchase or account approval |

Phase 0 was approved on 2026-10-04 by the user message: Great. continue throguh phases. Phase 1 research was authorized and has now been approved by the later user message “carry on.” Later phases retain their own exit reviews. Personal data is not approved for public use.

## Competitor research expansion — 2026-10-04

- DEC-27 — Confirmed: expand Phase 1 to research competitors, interfaces, operations and performance evidence, and retain research at subsequent phase decisions. Source: latest direct user request. This is not Phase 2 approval.
- DEC-28 — Proposed: adapt visual daily planning, capacity checks, fast logging, explainable weekly reviews and sustainable game progress into one original journey. Evidence and alternatives: research/competitors/README.md and experience-patterns.md. No new stack, price, account or publishing choice is approved.

## Phase 2 specification checkpoint — 2026-10-04

- DEC-29 — Approved: expanded Phase 1 research, from the direct user message “carry on.” Phase 2 specification is authorized; later phases retain review gates.
- DEC-30 — Confirmed: automatic sync across iPhone/iPad and Windows is required at launch. This supersedes earlier optional-sync wording. Offline work remains required.
- DEC-31 — Proposed: Flutter/SQLite client and authenticated Node/SQLite sync service; existing React/Next source preserved as a reference. No stack migration approved or performed.
- DEC-32 — Observed: current app passes 15 existing unit tests and TypeScript checking but conflicts with XP, persistence, privacy and truthful-feature requirements. Baseline assessment is a design input, not launch approval.
- DEC-33 — Proposed: execute four subsystem plans natively after their phase approvals; no subagent method selected.
- DEC-34 — Pending: choose a hosting route for required sync under the current zero-paid/no-external-DB rule; a question has been sent. Automatic sync is not deferred while this remains unresolved.
- DEC-35 — Proposed: five primary destinations; original small XP scale; revision-aware scheduling and sync; three visual directions for Phase 3. See phase-2-review.md.

- DEC-36 — Provisionally approved: Phase 2 by the direct user reply “for now yes.” Proceed with Phase 3 visual prototypes; hosting/build/commercial unknowns remain open.
- DEC-37 — Phase 3 implementation choice: isolated dependency-free prototype under prototypes/phase-3, synthetic data and in-memory interactions only. Existing Next.js app is preserved; this is visual evaluation, not native production implementation.

- DEC-38 — Authorized: direct user request “upload to vercel account i have and github account.” Verified existing GitHub Stoic-EmpireLabs/stoic-body and Vercel stoic-dev-team/stoic-body. Existing source was already uploaded. Publish only the synthetic Phase 3 static preview and review evidence from this workstream; preserve the separate production app. No spending or store submission is authorized.
- DEC-39 — Published: Phase 3 preview dpl_FVEZq7aFMbFp61b1MgqV3DWKpQ7V in the existing Vercel project, with account authentication retained. Seven allowlisted assets; no owner records or environment files. Style selection and Phase 3 approval are still pending.

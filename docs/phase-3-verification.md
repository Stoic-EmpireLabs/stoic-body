# Phase 3 verification

Date: 2026-10-04. Scope: isolated synthetic prototype in prototypes/phase-3.

| Check | Result | Evidence and boundary |
|---|---|---|
| Browser interaction/layout suite | 126 checks passed; no JavaScript runtime errors | [verification.json](../prototypes/phase-3/verification.json), [runner](../prototypes/phase-3/verify.cjs) |
| Three themes × eleven screens × three viewport sizes | 99 layout checks within the 126 | 1440×1050, 834×1112, 390×844; horizontal overflow, heading and button-label checks |
| Narrow phone, reduced motion, keyboard dialog | Passed within the 126 | 320px Today, modal containment, Escape and focus restoration; not a full screen-reader audit |
| XP and schedule interactions | Passed within the 126 | Completion/undo, partial/full award, proposal cancel/accept, lighter-day duration |
| Import, onboarding and boxing timer | Passed within the 126 | Timezone gate, ambiguous deadline excluded, confirm once, answer affects duration, rounds terminate |
| Gallery | Passed | [gallery-verification.json](../prototypes/phase-3/gallery-verification.json); all images loaded at 3 widths; no overflow; all 3 theme links |
| Scoped prototype lint | Passed | `node prototypes/phase-3/lint.cjs`; syntax/style and unsafe-API checks, not a complete ESLint or accessibility audit |
| Prototype JavaScript typecheck | Passed | `node node_modules/typescript/bin/tsc --allowJs --checkJs --noEmit --target ES2022 --lib ES2022,DOM --skipLibCheck prototypes/phase-3/app.js prototypes/phase-3/appearance.js` |
| Separate app TypeScript recheck | Passed on latest check | `node node_modules/typescript/bin/tsc --noEmit --incremental false`; concurrent edits resolved an earlier JSX failure; not this prototype's acceptance suite |
| Visual inspection | Completed | Night/Marble/Journal desktop, Train phone, Imports tablet and final gallery inspected |
| Publication scope | Eight static assets only | [publish-manifest.json](../prototypes/phase-3/publish-manifest.json), [packager](../prototypes/phase-3/package-preview.cjs); no private files, environment files, API or product database |
| Vercel upload | READY | Deployment dpl_4iWLZ9JxXA2WaZWuGNBA5GguguUE; same existing project, preview target; Vercel authentication retained |

The [remote receipt](../prototypes/phase-3/deployment-verification.json) compares authenticated downloads with the manifest. Vercel appends its feedback script to HTML; the check permits only that exact known suffix, and all source bytes must match. The prototype CSP blocks external scripts. Uploaded asset verification and local browser tests do not constitute a native-device or multi-user production test.

The existing public application responded HTTP 200 at https://stoic-body.vercel.app. Its source and the prototype were already on GitHub when publication was requested. The Phase 3 preview deployment does not replace that application.

The deployment uses Vercel's [Build Output API](https://vercel.com/docs/build-output-api/configuration) and [prebuilt CLI deployment](https://vercel.com/docs/cli/deploy). The packaging directory is inside the ignored .vercel directory; only the manifest's assets enter the output. Deployment access credentials are not included in these records.

## Selected palette revision

User correction: red, black and gold. Replaced the initial purple direction, refreshed preview imagery and redeployed the seven-asset preview. The 126-check suite, gallery checks, scoped lint and prototype typecheck passed again. [Palette checks](../prototypes/phase-3/palette-verification.json) verify six opaque text/background combinations at ratios from 6.11:1 to 16.65:1; this is not a complete WCAG audit. Desktop and phone renders were visually inspected.

## Appearance setting verification

[Appearance receipt](../prototypes/phase-3/appearance-verification.json): 18 checks passed after observing the initial missing-settings failure. The general 126 browser checks and gallery checks also passed again. Typecheck and the expanded scoped lint cover both app.js and appearance.js. The local server and upload allowlist now include appearance.js (eight assets total). Browser storage contains only version, theme, mode, accent and gold under the dedicated appearance key. It stores no personal entries. Settings was visually inspected at desktop and phone widths.

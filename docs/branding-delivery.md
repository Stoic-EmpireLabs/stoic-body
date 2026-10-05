# Stoic Body branding and Windows distribution

The user requested a name, icon and Vercel publication. The established product name remains **Stoic Body**. A generated gold S shield with a crimson accent on charcoal is applied to the Windows shortcut, app header, browser favicon and public download page. The existing theme/color choices remain available inside the app.

## Assets and verification

- Original artwork, 512px PNG and seven-size Windows ICO: [brand assets and generation prompt](../assets/brand/README.md).
- Built-in image generation produced the design; the existing Sharp dependency resizes/encodes delivery formats. No new package or paid API was introduced.
- `npm run test:desktop` passed after branding: 22 manifest-listed files, hash validation, actual COM shortcut with custom icon, concurrent launches, new-client signup and stop/restart persistence. The app favicon returns a valid seven-frame ICO.
- The existing 19-check core browser journey passed with the new header icon. TypeScript and ESLint passed.
- Download page was tested at 1440px and 390px, with images, anchor links, download target, no page errors and no horizontal overflow verified. Both full-page screenshots were visually inspected. The screenshot on the public page uses synthetic example data.

## Publication boundary

The separate `stoic-body-desktop` Vercel project distributes the Windows ZIP and explains its limits. It does not host local accounts, SQLite, device credentials or health data. Vercel's documented [SQLite persistence limitation](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel) and [CLI deployment flow](https://vercel.com/docs/projects/deploy-from-cli) were reviewed for this delivery. The existing separate web prototype is preserved.

The owner's new **Stoic Body Desktop** shortcut is distinct from the older web shortcut. An earlier combined shortcut-replacement/service-shutdown action was rejected by automatic approval review with only “blocked by policy.” Delivery therefore uses the successfully installed side-by-side desktop app, leaving the older shortcut/service intact.

The desktop service can be stopped and restarted; saved data remains local. Private HTTPS was verified with correct certificate validation and an explicit DNS mapping. Normal hostname resolution on the owner's PC currently fails, so physical second-device automatic sync is not accepted as verified. See the [desktop checkpoint](desktop-sync-checkpoint.md) for other open launch milestones and review rulings.

## Verified publication and installation receipts

- Public website: [stoic-body-desktop.vercel.app](https://stoic-body-desktop.vercel.app). Deployment `dpl_F3vXFbWuTcFBRXRuzEvNNG5zq4qk` uploaded exactly six allowlisted public files. Anonymous headless-browser checks passed on the production alias at 1440px and 390px, including all images and the seven-frame favicon.
- [v0.4.1 Windows prerelease](https://github.com/Stoic-EmpireLabs/stoic-body/releases/tag/v0.4.1-local-pilot), built from `45f39cad68db18ce6fb6025c0dce7c67c3c876fc`. The 35,086,194-byte public ZIP was fetched successfully without credentials and matched SHA256 `cf537b28db986d9194c4533ad3c670c605017fa6e38612251059cc0878094411`.
- The owner's installed app reports `Stoic Body / desktop-local / 0.4.1-local`. Its **Stoic Body Desktop** shortcut uses the installed custom ICO. Only the newly owned desktop service was stopped for this update; the older web shortcut and source pilot were preserved.
- The Vercel page distributes the working Windows app and labels its current limits. It is not a replacement for the private local app or proof of remote sync acceptance. No new phase or Store publication was performed.

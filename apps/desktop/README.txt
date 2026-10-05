STOIC BODY - WINDOWS DESKTOP PREVIEW

1. Extract the complete ZIP.
2. Double-click Install Stoic Body.cmd. It verifies every bundled file, copies
   the app into your Windows user folder and creates a Stoic Body desktop shortcut.
3. Open that shortcut. Microsoft Edge opens a dedicated app window. If Edge is
   unavailable, your default browser opens instead. No developer setup is needed.
4. Create your own account, save your recovery key privately, then follow the
   welcome guide. Your wife should create her own account for her own goals.

Windows 10/11 x64 is required. Node.js is included. No subscription or external
AI account is required. This is an unsigned preview, not a Microsoft Store app.
Follow your computer's security policies. No personal profile is shipped.

START AND STOP
The desktop shortcut starts the local service if needed. Closing the app window
leaves the small local service running until Stop Stoic Body.cmd or PC shutdown.
Open the installed folder (shortcut > Properties > Open File Location) to find
its Stop launcher. Nothing requires the PC to stay on. Saved work survives a
restart; unsaved text drafts do not. Do not run two versions at the same time.
The local address is http://127.0.0.1:4330. No administrator access is needed.
You can also use Start/Stop Stoic Body.cmd directly from the extracted package.

YOUR DATA
Data lives separately in %LOCALAPPDATA%\StoicBody. Do not delete it to update.
Stop the app before copying this entire folder for a private full-device backup.
Accounts separate data through the app, but Windows file access can expose the
unencrypted database, device credentials and browser session. Use separate
Windows accounts on shared PCs. No entries are sent to an AI service.
Settings > Data & recovery downloads encrypted account backups with a separate
passphrase. Keep a copy away from this computer and keep its passphrase separately.
These exports exclude passwords, recovery keys, themes, device credentials and
unmerged sync proposals. Copy unresolved proposals separately before dismissing.
Restore previews and confirms replacement, preserves sign-in, disconnects sync
links and invalidates other sessions. Seven local recovery points help recover
accidental edits; they cannot protect against disk loss.
Password recovery requires the recovery key and rotates that key. Without both
password and recovery key, there is no self-service recovery of the account.

OPTIONAL PRIVATE WINDOWS SYNC
Each Windows installation works locally. Choose one as your host. The host only
needs to be running and reachable when you want changes to catch up. Replicas
save a durable queue while it is off. Retry occurs on startup, after saved edits
and about every 15 seconds, with backoff up to 60 seconds when unavailable.
Settings > Your devices shows last success, waiting changes and conflicts.
Conflicting proposals remain visible for copying and deliberate review. The app
does not silently overwrite a newer edit. Repeated completion cannot earn extra XP.
A remote update notice lets you refresh without discarding a form automatically.

Both PCs need an existing private Tailscale connection to the host. This package
does not install Tailscale, invite users or create accounts. Never expose the local
HTTP port publicly. Native Apple offline clients are not included in this version.

PRIVATE HOST SETUP (one time, for someone administering the host)
Use a separate HTTPS port so existing services remain unchanged. Read the current
configuration with: tailscale serve status --json
If port 8443 is unused, save a sync-host.json file in the host's data folder with:
  {"privateOrigin":"https://YOUR-DESKTOP.YOUR-TAILNET.ts.net:8443"}
Use the exact Tailscale DNS name. Restart Stoic Body, then run:
  tailscale serve --bg --https=8443 http://127.0.0.1:4330
This is private Serve, not public Funnel. Do not use serve reset. To disable only
this listener later: tailscale serve --https=8443 off
Check the existing routes are still present and test the private URL. If your
Tailscale policy disallows this port, ask your network administrator.

On the host, sign in to the intended account and create a pairing code in Settings.
On your other Windows app, enter the private HTTPS address, code and device name.
Preview the account and record counts. Confirm replacement only after checking
the correct account. A recovery point is saved first. Your local password and
appearance stay local. Pairing grants full sync access to that host account.
Codes expire after 10 minutes. Revoke named devices in the host's Settings.
Create independent host accounts for different people; pair only your own data.
Sync currently transfers full snapshots, limited to 16 MiB per account. Unmerged
changes are retained when a limit or network problem prevents synchronization.

UPDATE
Stop the OLD version first, extract the new ZIP and run Install Stoic Body.cmd.
The verified installation updates its own desktop shortcut; saved data remains
in place. Old app folders are retained. Back up first; downgrade is unsupported.

WHAT WORKS
Accounts, resumable onboarding and app tour, goals/tasks, reviewed day plans,
completion/XP, meal templates/logs, workout planning/logs, measurements, learning
resources, themes, encrypted recovery and private Windows device sync.
Only explicitly described suggestions use setup answers. Review your own plans.

KNOWN LIMITS
Native Apple offline apps, native alarms, Store publication, automatic off-device
backup, external AI coaching and complete personalized nutrition remain open.
This is a local web app in a desktop window, not a native Windows UI framework.
External lessons need internet. Themes and guide position are device-local.

TROUBLESHOOTING
If the port is busy, use the previous copy's Stop launcher. No unrelated process
is stopped. Startup logs are in the data folder; keep them private. Sync needs
both apps running and Tailscale connected. Open Settings to retry or review a
conflict. Disconnecting keeps local records and retained proposals.

Runtime: Node.js v24.19.0, license and notices in runtime/LICENSE.txt.
manifest.json records source commit and SHA-256 hashes for the packaged files.

ADAPTIVE SETUP AND PHOTOS (0.5.0)
Setup uses choices and only asks follow-ups for selected goals. Existing written
answers remain saved; suggested mappings need your review. Confirm available
hours and sleep, then review a whole first week before accepting it. Start a
session from Today to read its instructions. Plan shows your accepted week.

Health > Photos & goal stores starting and actual-progress photos on this device.
Display copies strip location metadata. Originals remain unchanged and may retain
camera metadata. Standard account backups and device sync EXCLUDE photos. Use the
separate encrypted photo archive there, or download originals. Archive restore adds
photos without replacing existing images. Photo archives are limited to 32 MiB.

AI GOAL-IMAGE GENERATION IS NOT ENABLED IN THIS RELEASE. It needs an installed,
verified local image editor and tested client-likeness preservation. No client
photo is sent to an external AI service. A future goal illustration is aspirational,
not a predicted body-fat measurement or guaranteed outcome. Male/Female visual
preferences are optional and do not alter physiological calculations.

Meal bowls provide measured example portions, not a complete OMAD day. Confirm
nutritional adequacy before using restrictive eating. Deadline effort estimates,
advanced forecast calculations, native alarms and Store distribution remain open.

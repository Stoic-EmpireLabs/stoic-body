# Recovery and sync benchmarks — 2026-10-04

| Official source | Evidence and limitation | Adopted pattern and verification |
|---|---|---|
| [Todoist backup guide](https://www.todoist.com/help/articles/115001799989) | Documents downloadable backups/restoration on paid plans; this is vendor feature documentation, not independently measured recovery success | A visible account backup control and concrete restore journey; test real file round trip |
| [TickTick security](https://ticktick.com/security) | Claims automatic infrastructure backups and manual web backups; not an independent security audit | Separate automatic local recovery points from portable downloads; disclose same-disk limitation |
| [TickTick FAQ](https://help.ticktick.com/articles/7055792921664028672) | Directs users to Settings and Backup & Restore | Put recovery in Settings, with review before changing existing data |
| [Todoist API](https://developer.todoist.com/api/v1/) | Public API distinguishes command processing and synchronization | Preserve command identities, owner scope and explicit conflicts for future sync; never label a manual file transfer automatic sync |

No sales ranking, proprietary retention metric or performance claim is invented. These are established category benchmarks. An attempted direct Todoist troubleshooting URL did not resolve; it is not used as evidence. Research performed before implementation as required by AGENTS.md.

Technical sources: [Node crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). Fixed cost/size limits avoid attacker-selected KDF parameters. GCM authenticates ciphertext, while the application validates decrypted data independently. The documentation's current minor version differs from the installed Node24.19 runtime; executable tests verify used APIs.

User selected an intermittently available desktop for future sync under the owner's zero-paid-services/no-external-database-account rule. GitHub distributes a ZIP; it is not the running synchronization service. No credentials, personal records or database files have been uploaded for this research.


[Tailscale Serve reference](https://tailscale.com/docs/reference/tailscale-cli/serve) documents private sharing and selectable HTTPS ports. Read-only inspection found an existing private route for another app; no routing, firewall or sleep setting was changed. Offline access requires local client storage, not merely a private URL. No public exposure is part of this checkpoint.

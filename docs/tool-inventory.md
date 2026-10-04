# Relevant tool inventory

Snapshot: 2026-10-04. Tool names were checked against the current callable-tool catalog or directly exposed tool definitions. Availability is not authentication, integration, installed runtime, delivery success or authorization to act.

| Tool / family | Actual capability and intended use | Phase | Availability / boundary |
|---|---|---|---|
| functions.exec with exec_command | PowerShell reads, document checks, later builds/tests | 0–8 | Used for read-only discovery; Windows environment. No package install in Phase 0 |
| apply_patch | Create/edit reviewable local files | 0–8 | Used for documentation only in Phase 0 |
| functions.request_user_input_async | Collect small question groups while preparing independent work | 0–2 | Used; no permission inferred from unanswered questions |
| web__run | Current official documentation and evidence research | 1–8 | Available; full Phase 1 research not started |
| mcp__codex_app__open_in_codex | Show a local review document | 0–8 | Available; does not validate its content |
| view_image | Inspect local screenshots and generated visuals | 3,7 | Available; no screenshot or asset created yet |
| image_gen__imagegen | Generate or edit raster assets | 3,6A | Conditional on approved visual need; not app photo-diagnosis capability |
| exec_command + approved local Playwright | Headless browser behavior, screenshot and trace verification | 3–7 | Preferred by workspace instructions; executable/runtime availability must be verified before use |
| mcp__cua_repl.js | Supported browser interaction | 3,7 | Exposed separately; native app control disabled; not used |
| mcp__codex_app__load_workspace_dependencies | Locate bundled document/spreadsheet/PDF runtimes | 6A,8 | Available; only needed for selected artifacts |
| mcp__node_repl__js | Persistent JavaScript computation when useful | 2–7 | Available, not needed for Phase 0 |
| mcp__codex_security__* | Evidence-backed source audits and finding lifecycle | 2,7 | Available; a completed scan requires actual audit scope and evidence |
| mcp__code_review__pull_requests_checks | Read PR/merge-request CI diagnostics | 7,8 | Conditional on an existing authorized review target |
| Local git/gh via exec_command | Version-control and PR work if selected | 4–8 | Workspace requires these for GitHub changes; CLI authentication not reverified; no commit or remote action in Phase 0 |
| mcp__codex_app__list_artifacts / create_worktree / attach_artifact | Inspect managed checkouts and attach authorized development artifacts | 4–8 | Conditional on repository and execution choices |
| collaboration.spawn_agent / send_message / followup_task / wait_agent | Delegate bounded independent work and review | 4–7 | Exposed separately; unused in Phase 0; choose execution method after planning |
| mcp__codex_apps__google_calendar_* | Read calendars and availability; explicit event writes | Later integration | Callable tools exist; account/resource access and intended app integration are not verified. Do not alter the user's calendar during planning |
| mcp__codex_apps__google_drive_* | Access specifically authorized references and exports | 6A | Conditional; permissions and resources must be checked |
| mcp__codex_app__automation_update | Schedule Codex follow-up automation | Only if requested | This is a chat automation tool, not Stoic Body's alarm engine |
| mcp__codex_apps__plugin_management_* | Inspect a missing plugin/capability | If needed | No installation just to expand the inventory |

## Commercial release boundaries

No direct Apple App Store Connect, Google Play Console or Microsoft Partner Center submission tool was identified in the session catalog. Signing credentials, developer enrollment, mobile build toolchains, test devices, store accounts and billing sandboxes have not been verified. Plan those requirements after device discovery; do not invent operational readiness.

The current machine is Windows. Cross-platform builds, Apple signing and real mobile notification testing need explicit feasibility research before selecting architecture.

## Present but not needed for this phase

Cloud Page/Sites publishing, Supabase provisioning, mail/contact/outbound tools, issue publishing and other external applications are not needed to prepare the local review packet. Their presence does not authorize accounts, spending or publishing.

Supabase is not proposed under the existing no-external-database-account constraint. Codex calendar tools do not automatically become integrations available inside the shipped application. Application integrations require their own approved implementation and credentials/consent model.


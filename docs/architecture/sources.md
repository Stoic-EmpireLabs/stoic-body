# Phase 2 technical source register

Reviewed 2026-10-04. The source documents support platform/design constraints; engineering recommendations are our inferences. Publication dates not verified here are not invented. Recheck selected API/package versions at implementation. Earlier health and commercial evidence remains in [Phase 1 sources](../research/sources.md); competitor lineage remains in [the experience map](../research/competitors/experience-patterns.md).

| ID | Source | Use | Access / limits |
|---|---|---|---|
| AR01 | [Flutter desktop support](https://docs.flutter.dev/platform-integration/desktop) — Flutter | Windows native target and plugin architecture | Documentation; not a local build test |
| AR02 | [Flutter iOS setup](https://docs.flutter.dev/platform-integration/ios/setup) — Flutter | Mac/Xcode build prerequisite | User build-host access unknown |
| AR03 | [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports) — Next.js | Dynamic request-handling API cannot simply become a static client | Current public docs; existing project uses an older major, no upgrade performed |
| AR04 | [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup) — Capacitor | Hybrid Apple build prerequisites | Alternative comparison only |
| AR05 | [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) — Tauri | Alternative shell toolchain requirements | Alternative comparison only |
| AR06 | [Wake up to the AlarmKit API](https://developer.apple.com/videos/play/wwdc2025/230/) — Apple | iOS/iPadOS 26 alarms and user authorization | Transcript reviewed; native adapter not implemented |
| AR07 | [Schedule an app notification](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-scheduled) — Microsoft | Scheduled notification behavior and five-minute delivery window | Page body available despite authorization banner; not device-tested |
| AR08 | [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html) — SQLite | Enable referential integrity per connection | No proposed production schema executed |
| AR09 | [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html) — SQLite | Transactional consistency of related writes | Does not establish correctness of application-level sync |
| AR10 | [Appropriate uses for SQLite](https://www.sqlite.org/whentouse.html) — SQLite | Local database behind application service; network-file and concurrency limits | No capacity estimate inferred |
| AR11 | [RFC 5545 iCalendar](https://www.rfc-editor.org/rfc/rfc5545) — IETF / RFC Editor | Recurrence and timezone semantics for imports | Initial supported subset is intentionally bounded |
| AR12 | [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) — OWASP | Authentication/session/recovery design review | Guidance is not a completed security audit |
| AR13 | [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — OWASP | Reviewed password hashing approach | Implementation parameters/dependency require validation |
| AR14 | [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) — OWASP | Bounded validation and private attachment handling | Parsers and files not execution-tested |
| AR15 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — W3C | Accessibility acceptance baseline | Native assistive-technology behavior still requires testing |
| AR16 | [ETag header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) — MDN | Revision/precondition background for lost-update prevention | App uses explicit revision contracts; no ETag requirement inferred |
| AR17 | [Scheduling a notification locally](https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app) — Apple | Follow-up implementation reference | Title/stub accessible in text tool; full API behavior not independently verified here |
| AR18 | [Choosing background strategies](https://developer.apple.com/documentation/backgroundtasks/choosing-background-strategies-for-your-app) — Apple | Follow-up reference for background feasibility | Title/stub accessible; no delivery guarantee inferred |

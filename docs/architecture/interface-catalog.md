# Implementation interface catalog

Phase 2 proposal. These are language-neutral contracts for the four plans; they are not generated client/server code. Nullable fields remain explicitly nullable in serialized schemas. Dart methods use these names; the TypeScript server uses the same serialized field meanings.

## Common and core types

- `Result<T>`: exactly one of value:T or error:DomainError. `DomainError`: code, field?, safeMessage, retryable. No raw stack/SQL details in user errors.
- `DatabaseConfig`: appPrivatePath, schemaVersion, secureKeyReference, mode (production/test). `Database`: transactional connection with foreign keys enabled; implementation binding is selected in the storage feasibility task.
- `Answer`: questionId, state (answered/unknown/skipped), typed value?, answeredAt, provenance (user/import-confirmed). `Profile`: versioned answers plus derived reviewed preferences; unknown is not false or zero.
- `Snapshot`: schemaVersion, datasetId, ownerId, serverCursor?, entity collections, pendingOperationIds and conflicts. Entities are defined in [domain contracts](domain-contracts.md).
- `Command`: operationId, deviceId, entityId, baseRevision, schemaVersion, type, payload. `Receipt`: operationId, status (accepted/duplicate/conflict/rejected), canonicalRevision?, conflictId?, safeReason?. Commands that create an entity use baseRevision 0.
- `Validation`: valid:boolean, violations:list of code/entityIds/message; no side effects.
- `ScheduleInput`: snapshot, horizonStart, horizonEnd, displayZone, availabilityIntervals, reservedIntervals, tasks and user-confirmed policy. `Proposal`: proposalId, baseRevisions, placements, moves, unplaced items, reasons, violations and policyVersion.
- `Task`, `Occurrence`, `Completion`, `XpEvent`, `Goal`, `Measurement`, `Meal`, `Recipe`, `Resource`: use the entity fields and invariants in [domain contracts](domain-contracts.md); no duplicate client-only schema with weaker validation.
- `LevelProgress`: level, totalXp, xpWithinLevel, costToNextLevel and progressFraction (0–1). `LocalDate`: validated ISO calendar date without implicit midnight timezone conversion.
- `Session`: authenticated server accountId, deviceId, scopes and revocationEpoch; produced by auth middleware, never submitted by a client as proof. `ChangePage`: schemaVersion, changes, nextCursor, hasMore, resetRequired. Cursor tokens are opaque to clients.
- `DeviceCapabilities`: platform, osVersion, ordinaryNotificationPermission, alarmPermission, supportsAlarms and platformLimitNotes. `ReminderRegistration`: reminderId, deviceId, status, nativeRegistrationId?, intendedAt, failureCode?; no delivery flag without actual evidence.
- `ExportRequest`: ownerId, readable/encrypted format, includeAttachments, destination handle, encryptionSecretReference?. `ExportManifest`: fields in the domain contract plus export format/version. `RestorePreview`: manifest, validation, recordCounts, conflicts and proposedChangeSetId. `RestoreApproval`: previewId, confirmedChangeSetHash and expectedSnapshotRevision; cannot bypass preview validation.

## Health types

- `Approach`: contentId/version, timing/selection/energy tags, evidence and eligibility rules. `Suitability`: educationOnly/needsProfessionalReview/eligibleForReviewedOptions, reasonCodes, missingInputs and sourceIds. Eligibility is not medical clearance.
- `NutrientSummary`: values by nutrient, units, unknownNutrients, sourceIds and estimated flag. `RecipePortion`: recipeId/version, servings and confirmed substitutions. `GroceryList`: compatible ingredient/quantity/unit groups, unresolved conversions and allergen flags.
- `Equipment`: explicit available and unavailable IDs plus unknowns. `Availability`: capacity intervals, durations and location constraints. `ProgramOption`: templateId/version, rationale, requiredInputs, proposed occurrences and exclusions.
- `TrainingHistory`: dated completed sessions/sets and attendance. `RecoveryInput`: optional dated sleep, energy, fatigue and discomfort answers. `TrainingChange`: rationale/sourceIds, proposed changes, missingInputs and reviewRequired=true.
- `TrendResult`: available/insufficientData, windowStart/end, measurementCount, measuredDayCount, mean?, originalRecordIds and caveats. `EffortRange` and `CapacityRange`: low/high finite nonnegative hours; capacity additionally records weekly horizon and assumptions.
- `Forecast`: available/insufficientData, earliestWeeks?, latestWeeks?, methodVersion, inputRecordIds, assumptions and explanation. `ApprovedModel`: reviewed model ID/version and eligibility/evidence metadata; not an arbitrary formula supplied by the client.

## Content and commerce types

- `LearningPlan`: prerequisite graph, resources, milestone tasks, proposed occurrences and capacity conflicts. `LearningHistory`: dated practice/review outcomes. `ReviewProposal`: resourceId, proposedDate, reason and editable interval.
- `DayContext`: accepted schedule tags and user-approved concerns; excludes raw private attachments. `Quote`: classification, text, source fields and context tags. `ReflectionHistory`: dated IDs/text hashes. `CoachingTone`: gentle/direct/grillMe. `DailyReflection`: classification, text, provenance and suggestedAction; no implicit historical author.
- `SelectedFile`: app file handle, declared name/type and byte size; never trusted as an executable path. `ImportBatch`: hash, preservedOriginalId, validated format/size, state and parserVersion. `ExtractionResult`: candidate facts with typed values/source positions/confidence labels, errors and unresolved questions. `ImportApproval`: batchId, selected/corrected facts, confirmation hash and expected revisions.
- `ConsentApprovedPayload`: consentId/version, providerId, visible payload hash, scope and payload. `AssistanceDraft`: untrusted generated content, provider/model version, source claims and validation result; cannot contain an executable command.
- `StoreContext`: platform, signed-in store session reference and approved product IDs. `EntitlementState`: verified rights, source, checkedAt, expiry?, offline policy and revocation state. Store secrets/receipts are not exposed in general analytics/export.

## Versioning

Unknown enum values/schema versions fail with an actionable update message; they are never coerced to a familiar value. Readable exports retain their schema version. Before implementation, machine schemas and shared fixtures must agree with this catalog. Any changed field or rule updates its contract version and owning tests before clients are released.

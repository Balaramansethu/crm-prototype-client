# Feature Specification: Stable lead follow-up dates across saves

**Feature Branch**: `002-evolve-b504e7bec993430d987d7322`  
**Created**: 2026-10-30  
**Status**: Draft — awaiting human approval

**Input**: Maintenance specification 2: Lead follow-up date shifts by the time-zone offset on every save.

## Problem statement

Lead follow-up is a calendar date selected by the user. The current lead transformer formats local date/time fields and appends a literal `Z`, falsely presenting local time as UTC. When the API value is loaded into the edit form and saved again, the local offset is added to the serialized instant on every save. The list can eventually show an adjacent day outside UTC.

## User scenarios and testing

### User Story 1 — Preserve the selected follow-up date (Priority: P1)

**As a lead manager, I want a lead's follow-up calendar date to remain stable when I create or edit the lead, so repeated saves do not change the scheduled day.**

**Why this priority**: The defect corrupts persisted lead data and can cause users to act on the wrong follow-up day.

**Independent Test**: With the test process set to `Asia/Kolkata`, create a lead whose selected date is 15 March 2026, reload the stored value, save it four times without edits, and verify the emitted value and displayed local day remain unchanged. Verify the same serialization for an added contact during an update.

**Acceptance Scenarios**:

1. **Given** a user in a non-UTC time zone selects 15 March 2026, **when** a new lead is submitted, **then** the payload contains the actual instant represented by local midnight (for India, `2026-03-14T18:30:00.000Z`) and the list shows 15 March 2026.
2. **Given** an existing lead with that stored follow-up value, **when** the edit form loads it and the user saves without changing the date, **then** the follow-up payload value is identical to the stored value.
3. **Given** the same lead is loaded and saved repeatedly, **when** it is saved four or more times, **then** its local follow-up date remains 15 March 2026.
4. **Given** a new contact is added while an existing lead is updated, **when** that contact has a follow-up date, **then** its nested lead payload uses the same real instant as the selected date.

### User Story 2 — Preserve optional-date behavior (Priority: P2)

**As a user, I want a lead without a follow-up date to remain without one, so correcting date serialization does not add an unintended value.**

**Independent Test**: Transform create data, an existing-contact update, and a newly-added-contact update with no follow-up value and verify no follow-up field is sent in any of the three payload locations.

**Acceptance Scenarios**:

1. **Given** a lead contact has no follow-up date, **when** its create or update payload is built, **then** the follow-up field remains omitted as it is today.
2. **Given** an invalid follow-up value reaches the payload boundary, **when** a create or update payload is built, **then** the existing invalid-value omission behavior remains unchanged.

## Edge cases

- UTC users must continue to receive the same calendar date, with no offset-specific behavior.
- Serialization must preserve the selected date's real instant rather than manually composing local clock fields, so the result does not depend on whether the offset is positive or negative.
- A previously stored ISO timestamp must round-trip unchanged through edit/save.
- Create, existing-contact update, and newly added-contact update must use the same corrected serialization behavior.
- Missing and invalid dates must retain current omission behavior.
- Display formatting in the lead list and detail view remains local-time presentation and is not changed in this maintenance fix.
- The regression suite must directly cover create, existing-contact update, and newly-added-contact update payload locations; a shared-helper inspection alone is insufficient evidence.

## Functional requirements

- **FR-001**: A valid follow-up date MUST be encoded as the actual instant represented by the user's selection in standard ISO UTC form, not as local clock fields followed by a literal UTC marker.
- **FR-002**: Serializing a valid follow-up value loaded from the API and then saved without edits MUST be idempotent; the emitted value MUST equal the loaded value.
- **FR-003**: The corrected behavior MUST apply to lead creation, updates to the existing editable contact, and newly added contacts in an update payload, with a direct regression assertion for each payload location.
- **FR-004**: Missing or invalid follow-up dates MUST remain omitted from create and update payloads, preserving current behavior.
- **FR-005**: The lead list and detail views MUST continue to show the calendar date in the user's local time zone.
- **FR-006**: The change MUST NOT alter unrelated lead fields, API endpoints, validation, prospectus date handling, bulk upload parsing, or date-picker selection semantics.
- **FR-007**: Automated regression coverage MUST run in a non-UTC time zone and cover create, repeated unchanged saves, both update payload shapes, and omission behavior.

## Key entities

- **Lead follow-up date**: An optional calendar date selected by a user and persisted as the corresponding standardized timestamp.
- **Lead payload**: The existing create/update request data containing the follow-up value at its current lead-level locations.

## Success criteria

### Measurable outcomes

- **SC-001**: The non-UTC regression suite passes for creation and four repeated unchanged saves, with no change to the serialized follow-up instant.
- **SC-002**: A local 15 March 2026 selection displays as 15 March 2026 in the lead list after creation and after repeated saves, in the India (UTC+5:30) time zone used by the regression test.
- **SC-003**: Existing no-date behavior remains passing: create, existing-contact update, and newly-added-contact update payloads omit follow-up when no date is selected.
- **SC-004**: The focused regression and application build checks pass after the approved implementation, with no unrelated behavior changed.

## Assumptions

- The existing lead API continues to accept the current follow-up field locations and standardized timestamp format.
- A selected follow-up is a calendar date interpreted in the user's local time zone; no new time-zone preference is required.
- The existing application test and build environment will be available during the implementation and approval stages.

## Scope boundaries

### In scope

- The shared lead follow-up date serialization used by create and update payloads.
- Regression coverage for a non-UTC date round trip and repeated unchanged saves.
- Regression assertions for all existing create/update follow-up payload locations and omission behavior.
- Verification of the existing lead list/detail display behavior by focused UI smoke check or equivalent integration check.

### Out of scope

- Backend schema or API changes.
- Changes to the date picker, user-visible date format, validation rules, or time-zone preferences.
- Prospectus, call-log, bulk-upload, or other domain date serialization.
- Adding a general date library abstraction or a test-runner dependency.

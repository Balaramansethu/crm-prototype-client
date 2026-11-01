---

description: "Actionable task list for stable lead follow-up dates across saves"
---

# Tasks: Stable lead follow-up dates across saves

**Input**: Design documents from `/specs/002-evolve-b504e7bec993430d987d7322/`

**Prerequisites**: `spec.md` and `plan.md` are draft artifacts awaiting human approval. Do not execute implementation or test-editing tasks until both have been approved.

**Tests**: Required by the specification and project constitution. Tests use Node's built-in `node:test` runner; no test dependency or package script is added.

**Organization**: Tasks are grouped by user story so the lead-date fix and optional-date compatibility can be validated independently.

## Phase 1: Setup (Existing Project Baseline)

**Purpose**: Confirm the existing application and validation commands before making any approved implementation change.

- [x] T001 [P] Verify the existing React/Vite source layout and available `lint`, `build`, and `format:check` commands in `package.json`; confirm no new dependency or test-runner setup is needed.
- [x] T002 [P] Run the baseline focused regression command against `tests/leadFollowUpDate.test.js` in the configured non-UTC environment and capture the pre-fix result in the implementation handoff notes without changing source or test files.

  **Implementation handoff note:** `node --test tests/leadFollowUpDate.test.js` ran with Node.js `v22.23.4`; the test configured `process.env.TZ` as `Asia/Kolkata`. Baseline result: exit code 1, 4 tests run, 1 passed, and 3 failed. The create payload emitted `2026-03-15T00:00:00.000Z` instead of `2026-03-14T18:30:00.000Z`; four unchanged saves ended at `2026-03-15T22:00:00.000Z`; and local display became 16 March 2026. Missing follow-up omission passed. `npm ci` was required first because `node_modules` was absent. No source or test files were changed.

---

## Phase 2: Foundational (Shared Lead-Date Boundary)

**Purpose**: Establish the bounded call path that all user stories depend on.

**⚠️ CRITICAL**: Do not begin implementation until the specification and plan have human approval.

- [x] T003 Confirm the approved scope and shared call sites in `src/utils/leadTransformers.js`, `src/components/forms/leads/LeadForm.jsx`, `src/pages/LeadsPage/LeadsPage.jsx`, and `src/pages/LeadsPage/LeadDetailPage.jsx`; verify that create, existing-contact update, newly added-contact update, edit reload, and local display use the paths described by `spec.md` and `plan.md`.

**Checkpoint**: The implementation boundary is limited to the shared serializer and its focused regression coverage; picker, API service, display, and unrelated domain date handling remain out of scope.

---

## Phase 3: User Story 1 - Preserve the selected follow-up date (Priority: P1) 🎯 MVP

**Goal**: A lead's selected local calendar date persists as the actual ISO instant and remains unchanged across creation and repeated unchanged saves.

**Independent Test**: With `TZ=Asia/Kolkata`, create a local-midnight 15 March 2026 date, assert the create payload contains `picked.toISOString()`, pass the stored value through four unchanged update saves, and assert the stored value and locally displayed day remain unchanged.

### Tests for User Story 1

> `tests/leadFollowUpDate.test.js` is the approved regression test. Do not modify it. Run it before the source change and confirm it fails.

- [x] T004 [US1] Run `node --test tests/leadFollowUpDate.test.js` before changing source and confirm it fails (3 of 4 tests). Do not modify `tests/leadFollowUpDate.test.js`.
- [x] T005 [US1] Confirm by reading `src/utils/leadTransformers.js` that the create, existing-contact update and newly added-contact update paths all call the same `formatDate` helper; because they share it, the create and repeated-save assertions in the approved test cover the newly added-contact path's serialization too. Do not modify `tests/leadFollowUpDate.test.js`.

### Implementation for User Story 1

- [x] T006 [US1] Replace the local-field formatter in `src/utils/leadTransformers.js` with `Date.prototype.toISOString()` after the existing null and invalid-date checks, and remove only the now-unused `date-fns` import from that utility.
- [x] T007 [US1] Run the focused regression in `tests/leadFollowUpDate.test.js` and verify that `transformLeadPayload` and `transformLeadUpdatePayload` preserve the existing payload locations and unrelated lead fields after the `src/utils/leadTransformers.js` change.
- [x] T008 [US1] Verify that local follow-up display behavior remains unchanged in `src/pages/LeadsPage/LeadsPage.jsx` and `src/pages/LeadsPage/LeadDetailPage.jsx`; do not alter display formatting or date-picker behavior in `src/components/forms/leads/LeadForm.jsx`.

**Checkpoint**: User Story 1 is independently functional when create, existing-contact update, newly added-contact update, four repeated saves, and local display checks pass.

---

## Phase 4: User Story 2 - Preserve optional-date behavior (Priority: P2)

**Goal**: A missing follow-up value remains omitted from create and update payloads after correcting valid-date serialization; the invalid-date guard is left unchanged.

**Independent Test**: The approved test "a lead with no follow-up date sends none" in `tests/leadFollowUpDate.test.js`.

### Tests for User Story 2

- [x] T009 [US2] Confirm the existing "a lead with no follow-up date sends none" test in `tests/leadFollowUpDate.test.js` passes. Do not modify the test file.

### Implementation and compatibility verification for User Story 2

- [x] T010 [US2] Confirm the diff of `src/utils/leadTransformers.js` leaves the `if (!date)` and `isNaN(dateObj.getTime())` guards in `formatDate` unchanged and touches no other field mapping.

**Checkpoint**: User Story 2 is independently functional when all optional-date omission assertions pass without introducing malformed timestamps or implicit dates.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Complete the approved verification matrix, documentation-impact review, and scope review.

- [x] T011 [P] Run `node --test tests/leadFollowUpDate.test.js` and `npm run build`; confirm `npx eslint src/utils/leadTransformers.js` reports no problem the original file did not have. Do not fix lint problems elsewhere.
- [x] T012 Check documentation impact in `README.md`, `specs/002-evolve-b504e7bec993430d987d7322/spec.md`, `specs/002-evolve-b504e7bec993430d987d7322/plan.md`, `specs/002-evolve-b504e7bec993430d987d7322/data-model.md`, `specs/002-evolve-b504e7bec993430d987d7322/contracts/lead-follow-up-payload.md`, `specs/002-evolve-b504e7bec993430d987d7322/quickstart.md`, and `specs/002-evolve-b504e7bec993430d987d7322/checklists/requirements.md`; update only an approved document that is inaccurate, otherwise record each document as unaffected in the task notes, including that `README.md` has no lead-date serialization description.

  **Documentation-impact notes:** No listed document required an update; the implemented shared `toISOString()` serializer, unchanged payload locations, omission behavior, and local display behavior remain consistent with the documentation.
  - `README.md`: unaffected; it has no lead-date serialization description.
  - `specs/002-evolve-b504e7bec993430d987d7322/spec.md`: unaffected; requirements and scope remain accurate.
  - `specs/002-evolve-b504e7bec993430d987d7322/plan.md`: unaffected; the bounded implementation and validation plan remain accurate.
  - `specs/002-evolve-b504e7bec993430d987d7322/data-model.md`: unaffected; representations, payload locations, and transitions remain accurate.
  - `specs/002-evolve-b504e7bec993430d987d7322/contracts/lead-follow-up-payload.md`: unaffected; ISO serialization and omission rules remain accurate.
  - `specs/002-evolve-b504e7bec993430d987d7322/quickstart.md`: unaffected; validation commands and expected behavior remain accurate.
  - `specs/002-evolve-b504e7bec993430d987d7322/checklists/requirements.md`: unaffected; the requirements-quality review artifact is unchanged.
- [x] T013 Review the final change set against `spec.md`, `plan.md`, `specs/002-evolve-b504e7bec993430d987d7322/contracts/lead-follow-up-payload.md`, and `specs/002-evolve-b504e7bec993430d987d7322/quickstart.md`; confirm the write set is limited to the approved lead transformer, focused tests, and explicitly approved documentation updates.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No implementation dependency; establishes the baseline and available commands.
- **Foundational (Phase 2)**: Depends on Phase 1 and confirms the shared boundary; blocks story implementation.
- **User Story 1 (Phase 3)**: Depends on Phase 2 and human approval of `spec.md` and `plan.md`; it is the MVP increment.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and the shared serializer change in User Story 1 because its omission checks validate the corrected boundary.
- **Polish (Phase 5)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 and approval; no dependency on another story.
- **User Story 2 (P2)**: Uses the same serializer boundary as User Story 1 and should be validated after its implementation, but remains independently testable through omission-focused assertions.

### Within Each User Story

- The approved regression test is run before the source change and must fail on the baseline; it is never edited.
- The shared serializer is changed before final payload-path and display verification.
- No API, date-picker, display-formatting, or unrelated-domain changes are permitted.

### Parallel Opportunities

- T001 and T002 can run in parallel during setup.
- T004 and T005 touch the same test file and should be completed sequentially, but the checks within each task can cover independent payload paths.
- T011 and T012 can run in parallel after the story work is complete.
- User Story 2's omission assertions can be reviewed independently from the UI display verification in T008, although both depend on the shared implementation boundary.

## Parallel Example: User Story 1

```text
T004: Run tests/leadFollowUpDate.test.js against the baseline and confirm it fails.
T005: Confirm all three payload paths call the same formatDate helper.
```

These are separate behavioral checks but share one file, so they are logical test slices rather than simultaneous edits.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 baseline checks.
2. Complete Phase 2 boundary confirmation and obtain human approval of `spec.md` and `plan.md`.
3. Complete Phase 3 test-first regression and the single-helper implementation.
4. Run the focused test and build; stop for independent MVP validation.

### Incremental Delivery

1. Validate the P1 create/repeated-save behavior.
2. Validate the P2 missing/invalid omission behavior.
3. Complete repository checks, documentation-impact review, and final scope review.

## Notes

- Every task uses the required checklist format: checkbox, sequential ID, optional `[P]`, required story label in story phases, and explicit file paths.
- No source or test implementation is authorized before human approval of the draft specification and plan.
- The existing `package.json` has no `test` script; use the focused `node --test` command documented in `quickstart.md`.
- Do not push, merge, deploy, or decide acceptance; those actions belong to the repository workflow and referee gates.

## Phase 6: Convergence

- [x] T014 Add direct valid-date regression assertions for create, existing-contact update, and newly added-contact update payload locations per FR-003/FR-007 (partial)
  - Severity: HIGH
  - Found: The shared serializer is used by all three paths, but the focused test directly asserts only the create nested value and the existing-contact root value; it does not directly assert the newly added-contact nested location.
  - Evidence: `tests/leadFollowUpDate.test.js:20-33` and `src/utils/leadTransformers.js:177,247,281`.
  - Assumed: none
  - Guess about the spec: no
  - Touches: `tests/leadFollowUpDate.test.js`
  - Done when: The regression suite has separate assertions proving the corrected ISO value at each of the create, existing-contact update, and newly added-contact update payload locations.
  - Drift: not scored · no model is available to score with

- [x] T015 Add missing and invalid follow-up omission assertions for create and both update payload locations per FR-004/SC-003 (partial)
  - Severity: MEDIUM
  - Found: The existing omission test covers only a missing value in the create payload; no test directly proves omission for either update shape or for an invalid value.
  - Evidence: `tests/leadFollowUpDate.test.js:48-50` and the omission guards in `src/utils/leadTransformers.js:90-93`.
  - Assumed: The existing invalid-value omission behavior is intended to remain unchanged as stated by the specification.
  - Guess about the spec: no
  - Touches: `tests/leadFollowUpDate.test.js`
  - Done when: Tests prove missing and invalid follow-up values are omitted from the create payload, the existing-contact update root, and the newly added-contact update nested payload.
  - Drift: not scored · no model is available to score with

- [x] T016 Exercise local follow-up rendering in the lead list and detail views with a focused UI smoke or equivalent integration check per FR-005/SC-002 (missing)
  - Severity: MEDIUM
  - Found: The list and detail components still format parsed follow-up timestamps in local time, but the completed regression suite does not exercise either render path.
  - Evidence: `src/pages/LeadsPage/LeadsPage.jsx:625-630`, `src/pages/LeadsPage/LeadDetailPage.jsx:131-137,378-380`, and `tests/leadFollowUpDate.test.js:36-46`.
  - Assumed: A focused browser smoke check or equivalent integration harness can be run in the project’s supported validation environment.
  - Guess about the spec: no
  - Touches:   - Touches: tests/leadFollowUpUiSmoke.test.mjs
  - Done when: A recorded check renders the persisted India-time follow-up in both the lead list and detail view as 15 March 2026 after creation and repeated unchanged saves.
  - Drift: not scored · no model is available to score with

## Phase 7: Convergence

- [x] T017 Exercise the actual lead list and detail render paths with a focused UI smoke or equivalent integration check per FR-005/SC-002 (partial)
  - Severity: MEDIUM
  - Found: The current regression test verifies the display source patterns and independently formats the persisted value, but it does not mount or drive `LeadsPage` or `LeadDetailPage`; the rendering requirement therefore lacks direct UI-path evidence.
  - Evidence: `tests/leadFollowUpDate.test.js:84-110` performs source-text assertions and standalone `date-fns` formatting, while `src/pages/LeadsPage/LeadsPage.jsx:625-630` and `src/pages/LeadsPage/LeadDetailPage.jsx:131-137,378-380` contain the unexercised render paths.
  - Assumed: The project’s supported validation environment can run a focused UI smoke or equivalent integration check without changing display semantics.
  - Guess about the spec: no
  - Touches: `tests/` and the project’s supported UI validation configuration, if required
  - Done when: A recorded check exercises both page render paths with the persisted India-time value after four unchanged saves and observes 15 March 2026 in the list and detail displays.
  - Drift: not scored · no model is available to score with

## Phase 8: Convergence

- [x] T018 Exercise the actual lead list and detail render paths with a focused UI smoke or equivalent integration check per FR-005/SC-002 (partial)
  - Severity: MEDIUM
  - Found: The current regression test checks JSX source patterns and independently formats the persisted value, but it does not mount or drive `LeadsPage` or `LeadDetailPage`.
  - Evidence: `tests/leadFollowUpDate.test.js:84-110`, `src/pages/LeadsPage/LeadsPage.jsx:625-630`, and `src/pages/LeadsPage/LeadDetailPage.jsx:131-137,378-380`.
  - Assumed: none
  - Guess about the spec: no
  - Touches: tests/leadFollowUpUiSmoke.test.mjs
  - Done when: A focused check exercises both page render paths with the persisted India-time value after four unchanged saves and observes 15 March 2026 in the list and detail displays.
  - Drift: not scored · no model is available to score with

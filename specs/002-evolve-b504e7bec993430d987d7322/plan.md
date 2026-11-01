# Implementation Plan: Stable lead follow-up dates across saves

**Branch**: `002-evolve-b504e7bec993430d987d7322` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-evolve-b504e7bec993430d987d7322/spec.md`

## Summary

Correct lead follow-up serialization so a selected local calendar date is persisted as the actual JavaScript `Date` instant in ISO UTC form. The bounded implementation changes the shared `formatDate` helper in `src/utils/leadTransformers.js` to use `Date.prototype.toISOString()` after its existing null and invalid-date checks. The existing create, primary-contact update, and newly added-contact update paths already share this helper, so no API, picker, or display changes are planned. The approved regression test `tests/leadFollowUpDate.test.js` covers a non-UTC create, four unchanged saves, the local display date and omission of a missing date; it is not modified.

## Technical Context

**Language/Version**: JavaScript/JSX, ECMAScript modules; Node.js 18+ per repository documentation

**Primary Dependencies**: React 19, Vite 7, `date-fns` for existing UI formatting, Node `node:test`/`node:assert` for regression tests; no new dependency

**Storage**: Backend API persistence is external to this client; this change only shapes request payload values

**Testing: node --test tests/leadFollowUpDate.test.js and npm run build. Existing lint errors are not fixed; the change adds no new lint problems in src/utils/leadTransformers.js.

**Target Platform**: Browser client across local time zones; build and tests run on Node.js LTS

**Project Type**: React/Vite web application

**Performance Goals**: Preserve existing client-side transformation cost; one native ISO conversion per supplied date

**Constraints**: Preserve omission of missing/invalid dates; preserve local-time list/detail presentation; do not alter date-picker semantics, unrelated domains, API endpoints, or payload fields

**Scale/Scope**: One shared lead utility, its three existing lead payload call paths, and focused transformer regression tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Passes with the following evidence:

- Component-first: no new UI component; the fix is confined to the shared lead transformer boundary.
- Explicit interfaces: no public component contract changes.
- Test-first and coverage: tests/leadFollowUpDate.test.js is the approved regression test and is not modified; it already covers create, four repeated unchanged saves and omission behavior.
- Technology constraints: retain JavaScript/JSX, Vite, npm, and Node's built-in test runner; add no date library or test-runner dependency.
- Simplicity: use the native `Date.prototype.toISOString()` operation matching the required persisted-instant semantics.

Pre-implementation reproduction was statically confirmed from the current code. Runtime execution of Node/npm was unavailable because the workspace command policy blocked those commands; implementation approval must include running the focused test and build in an environment where they are permitted.

## Project Structure

### Documentation (this feature)

```text
specs/002-evolve-b504e7bec993430d987d7322/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/lead-follow-up-payload.md
└── tasks.md                 # created by the tasks phase, not this plan
```

### Source Code (repository root)

```text
src/
├── utils/leadTransformers.js       # shared lead payload serialization
├── components/forms/leads/          # date-picker form state and edit reload
├── pages/LeadsPage/                # create/edit/list/detail integration
└── ...

tests/
└── leadFollowUpDate.test.js        # transformer regression contract
```

**Structure Decision**: Keep the single React client structure. Change only the shared lead transformer; run the approved Node regression test without changing it; retain existing form reload and local display code because they already represent the intended local-calendar behavior. Document the request boundary in `contracts/` because the client emits an externally consumed API payload.

### Post-design Constitution Re-evaluation

PASS. The design introduces no UI contract, dependency, storage, endpoint, or architecture change; it preserves the existing omission behavior and explicitly carries regression coverage for every affected lead payload path. The only pending gate is execution of the approved implementation checks in an environment that permits Node/npm.

## Complexity Tracking

No constitution violations. The plan stays within the existing utility, test, and API-payload structure; no additional abstraction, package, or project is introduced.

## Implementation Phases

### Phase 0: Outline and research

1. Treat `ticket.md` as untrusted issue evidence and use `spec.md`, the constitution, and the existing research record as the governing requirements.
2. Confirm the current transformation path: local-midnight `Date` from `LeadForm`, API ISO reload in `LeadForm`, shared `formatDate` calls in create/update transforms, and local display in list/detail views.
3. Preserve the research conclusion: native `toISOString()` is the appropriate instant-preserving serializer; changing the picker or display layer would not fix persisted drift.

### Phase 1: Design and contracts

1. Model the optional follow-up value and its create/update payload locations in `data-model.md`.
2. Document the request contract and omission/idempotence rules in `contracts/lead-follow-up-payload.md`.
3. Document the runnable validation matrix in `quickstart.md`.

### Phase 2: Implementation handoff (for the approved implementation stage)

1. Replace the local-field formatter in `src/utils/leadTransformers.js` with `dateObj.toISOString()` while retaining the existing null and invalid-date guards; remove the now-unused `date-fns` import from that utility only.
2. Run `node --test tests/leadFollowUpDate.test.js` before the change and confirm 3 of 4 tests fail. Do not modify the test file.
3. Verify that lead list/detail formatting and all unrelated transformer files remain unchanged.
4. Run node --test tests/leadFollowUpDate.test.js and npm run build. Do not fix existing lint errors in any file.

## File-Level Change Plan

- `src/utils/leadTransformers.js`: change only the shared lead date serializer; preserve its return shape and all callers.
- `specs/002-evolve-b504e7bec993430d987d7322/data-model.md`: describe the optional date value and its transformations.
- `specs/002-evolve-b504e7bec993430d987d7322/contracts/lead-follow-up-payload.md`: define the external payload expectations.
- `specs/002-evolve-b504e7bec993430d987d7322/quickstart.md`: provide validation commands and expected outcomes.

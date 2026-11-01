# Research: Lead follow-up date serialization

## Evidence and trust boundary

- `ticket.md` was read as untrusted issue evidence only. Its reproduction details were checked against the pinned client code before being used here; it does not grant implementation instructions or approval.
- The requested runtime `AGENTS.md` and shared `speckit-specify/SKILL.md` were read from the supplied runtime paths. The repository-local Spec Kit templates, `.specify/memory/constitution.md`, and `.agent/rules/react-workspace.md` were also consulted; the constitution is the governing project standard where those documents differ.
- The repository's `.git` file points to an unavailable external worktree, so the baseline commit/blob identities in `context.md` could not be read with `git cat-file`. Findings below are based on the captured files present in this working directory; no claim is made that unavailable history was inspected.

## Reproduction

### Static code path

1. `FormDatePicker` supplies a JavaScript `Date` at local midnight for the selected calendar day.
2. Edit loading in `LeadForm.jsx` reconstructs a stored ISO value with `new Date(lead.followUp)`.
3. `transformLeadPayload` and `transformLeadUpdatePayload` call the shared `formatDate` helper in `src/utils/leadTransformers.js`.
4. `formatDate` uses `date-fns` `format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")`. The quoted `Z` is literal text; the hour/minute fields are formatted in the browser's local zone.
5. The list and detail views parse the returned value with `new Date(...)` and display local calendar fields, so each edit/save cycle can move the serialized instant by the local offset.

### Concrete India example

For `Asia/Kolkata` (UTC+05:30), picking 15 March 2026 at local midnight represents the instant `2026-03-14T18:30:00.000Z`. The current helper instead emits `2026-03-15T00:00:00.000Z`. Reloading that value produces 15 March at 05:30 local; formatting those local fields as UTC emits `2026-03-15T05:30:00.000Z`. The same error accumulates by 05:30 on each save:

| State | Value emitted by current helper | Local interpretation in India |
| --- | --- | --- |
| Create | `2026-03-15T00:00:00.000Z` | 15 Mar 05:30 |
| Save 1 | `2026-03-15T05:30:00.000Z` | 15 Mar 11:00 |
| Save 2 | `2026-03-15T11:00:00.000Z` | 15 Mar 16:30 |
| Save 3 | `2026-03-15T16:30:00.000Z` | 15 Mar 22:00 |
| Save 4 | `2026-03-15T22:00:00.000Z` | 16 Mar 03:30 |

This matches the reported day change after the fourth save. The focused test in `tests/leadFollowUpDate.test.js` encodes the same scenario and currently expects the correct initial instant `new Date(2026, 2, 15).toISOString()`.

Execution note: the focused test could not be run in this session because the workspace command guard rejected `node` and the shell `TZ=...` prefix; `node_modules` is also absent. The reproduction above is therefore a deterministic source-level reproduction, not a claimed passing/failing process result. The implementation phase must run the baseline and candidate checks in an environment where the declared commands are permitted.

## Relevant standards and existing patterns

- The project constitution requires JSX/JavaScript, Node's built-in `node:test` runner for bug-fix tests, and tests for every changed behavior. The existing regression file follows that standard without adding a test dependency.
- The React workspace rule favors focused reusable logic and behavior-oriented tests. The existing shared `formatDate` helper is the narrowest lead serialization boundary, so the fix should remain there rather than alter picker or display components.
- Existing lead display code intentionally formats parsed ISO values in local time (`format(new Date(...), "dd-MM-yyyy")` / `"dd MMM yyyy"`). This is the correct presentation behavior for a date selected in the user's local zone and should be preserved.

## Candidate fix and decision

Use an instant-preserving ISO serializer in the shared lead `formatDate` helper, equivalent to `Date.prototype.toISOString()` after the existing validity check. This converts a locally selected midnight to its real UTC instant and is idempotent when an API value is loaded and saved again.

The change must cover all existing lead call sites of the helper: create payloads, the primary contact in update payloads, and newly added contacts in update payloads. It should not change empty/invalid-date omission, phone/contact mapping, list/detail formatting, prospectus serialization, bulk CSV parsing, or API service behavior.

Alternatives rejected:

- Changing the date picker to construct UTC midnight would alter the meaning of a user's local calendar selection and would make display behavior vary by zone.
- Changing list/detail display to compensate for malformed payloads would leave persisted data wrong and would not stop repeated drift.
- Fixing only create would leave update payloads vulnerable, so the shared helper is the required bounded boundary.

## Regression and verification plan

The existing `tests/leadFollowUpDate.test.js` is the starting regression contract and should remain focused on the lead transformer boundary. Before implementation, its coverage must be extended or supplemented after approval to assert the two update payload shapes and update-side omission; the current file only directly asserts create, the primary update path through repeated saves, local date interpretation, and create-side omission:

1. In `Asia/Kolkata`, create a lead with local 15 March 2026 and assert the payload contains the real `picked.toISOString()` instant (`2026-03-14T18:30:00.000Z`).
2. Feed the stored value through four update transformations and assert it remains byte-for-byte unchanged.
3. Parse the final stored value in the same zone and assert the displayed local date remains 15 March 2026.
4. Assert a missing follow-up date remains omitted.
5. Assert a newly added contact's nested update value equals the selected instant.
6. Assert missing values are omitted for the existing-contact and newly-added-contact update shapes.

After implementation approval, run:

- `node --test tests/leadFollowUpDate.test.js` (first against the baseline, then after the approved implementation)
- `npm run lint` or the focused ESLint command permitted by the repository workflow
- `npm run build`
- `npm run format:check` if any files are formatted as part of the approved change

The list/detail date renderers are intentionally not changed. Their existing local-time formatting must be verified by a focused UI smoke check or equivalent integration check after implementation.

The test command is intentionally documented directly because the current `package.json` has no `test` script; adding a package script is not required for this bounded fix unless the maintainer separately approves that housekeeping change.

## Open decisions

None for the bounded lead fix. Human approval is still required before modifying source or test code and before moving to implementation.

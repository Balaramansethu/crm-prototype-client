# Quickstart: Validate stable lead follow-up dates

## Prerequisites

- Node.js 18+ and npm installed.
- Dependencies installed with `npm install`.
- The commands run from the repository root.

## Focused regression

Run the non-UTC regression suite:

```bash
node --test tests/leadFollowUpDate.test.js
```

Expected outcomes:

- A local 15 March 2026 selection in `Asia/Kolkata` produces `2026-03-14T18:30:00.000Z`.
- Four unchanged reload/save cycles preserve the exact serialized value.
- Local rendering still resolves to 15 March 2026.
- A missing follow-up value is omitted.
- Create, existing-contact update, and newly added-contact update use the corrected value.

The test sets `process.env.TZ` before constructing dates, so it runs the same in any shell.

## Repository checks

```bash
npx eslint src/utils/leadTransformers.js  # no new problems; repo-wide lint already fails
npm run build
npm run format:check
```

`format:check` is only required when the changed files are included in the repository's formatting scope. No API server or backend migration is required for this client-only fix.

## Manual UI smoke check

In a browser configured to a non-UTC zone:

1. Create a lead with follow-up date 15 March 2026.
2. Confirm the list shows 15-03-2026.
3. Open the lead, save without changing the date, and repeat at least four times.
4. Confirm the list and detail views still show 15-03-2026.

The server payload should contain the real instant for local midnight, not local clock fields followed by a literal `Z`.

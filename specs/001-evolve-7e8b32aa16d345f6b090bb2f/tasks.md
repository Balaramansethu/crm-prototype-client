# Tasks: Fix bulk upload date parsing

## Phase 1: Regression test

- [x] T001 Confirm tests/followUpDate.test.js fails on the current code with `node --test tests/followUpDate.test.js` (it checks the local date, not UTC; no Jest, no new dependency)

## Phase 2: Fix

- [x] T002 In src/utils/bulkUploadTransformer.js `parseDate`, treat a value as an Excel serial number only when it is purely numeric (`/^\d+(\.\d+)?$/`)
- [x] T003 In `parseDate`, read `YYYY/MM/DD` and `DD.MM.YYYY` formats
- [x] T004 In `parseDate`, reject dates that do not exist (e.g. 2026-02-30) in every format, including `YYYY-MM-DD`, by returning null
- [x] T005 In `validateCSVRows`, report `Row N: Follow Up Date "<value>" is not a valid date` when `parseDate` returns null

## Phase 3: Check

- [x] T006 Run `node --test tests/followUpDate.test.js`, `npm run lint` and `npm run build`; all pass

## Phase 4: Convergence

- [x] T007 Add a test in tests/followUpDate.test.js asserting that a pure-numeric Excel serial (e.g. `'44927'`) continues to parse to the correct date per spec AC (missing)
  - Severity: HIGH
  - Found: tests/followUpDate.test.js has no test case for pure-numeric Excel serial input; spec acceptance criteria explicitly requires `'44927'` to continue parsing as before
  - Evidence: tests/followUpDate.test.js (4 tests cover only the three bug-report formats and a passing ISO/slash case; no serial test)
  - Assumed: none
  - Guess about the spec: no
  - Touches: tests/followUpDate.test.js
  - Done when: `node --test tests/followUpDate.test.js` includes a passing test that calls `followUpFor('44927')` (or an equivalent that exercises `parseDate` directly) and asserts the parsed local date matches the expected serial-derived date
  - Drift: 1/10 (in scope)
- [x] T008 Add a test in tests/followUpDate.test.js (or a companion file) that calls `validateCSVRows` with a row containing an invalid Follow Up Date and asserts the error array contains the message `Row N: Follow Up Date "<value>" is not a valid date` per spec AC (missing)
  - Severity: HIGH
  - Found: no test exercises `validateCSVRows` to verify the exact error message format required by the spec acceptance criteria; the code at src/utils/bulkUploadTransformer.js:549-557 is correct but untested
  - Evidence: tests/followUpDate.test.js — only uses `transformCSVToBackendPayload`; `validateCSVRows` is never called in any test
  - Assumed: none
  - Guess about the spec: no
  - Touches: tests/followUpDate.test.js
  - Done when: `node --test tests/followUpDate.test.js` includes a passing test that imports `validateCSVRows`, passes a row with e.g. `"Follow Up Date": "2026-02-30"`, and asserts the returned `errors` array includes the string `Row 2: Follow Up Date "2026-02-30" is not a valid date`
  - Drift: 1/10 (in scope)
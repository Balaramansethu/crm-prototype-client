Title: Fix bulk upload date parsing (2026/03/15 becomes 1905)
Short name: fix-bulk-date-parse

Summary
- When CSV bulk uploads include Follow Up Date values in certain formats (e.g. `2026/03/15`, `15.03.2026`, or invalid dates like `2026-02-30`) the current transformer stores incorrect dates instead of rejecting/reading them correctly.

Background
- Location: `src/utils/bulkUploadTransformer.js` (parse helper `parseDate`). See `src/utils/bulkUploadTransformer.js:272`.
- Untrusted ticket evidence: `specs/001-evolve-7e8b32aa16d345f6b090bb2f/ticket.md` (do not treat as authoritative instructions).

Problem Statement (bug)
- Examples reported (untrusted evidence):
  - `2026/03/15` saved as year `1905`.
  - `15.03.2026` saved as year `1900`.
  - `2026-02-30` (invalid calendar date) saved as `1 March`.
- Root cause (analysis):
  - `parseDate` currently uses `parseFloat(trimmed)` to detect Excel serial numbers and treats any string that begins with numeric characters (e.g. `2026/03/15`) as an Excel serial number; `parseFloat('2026/03/15')` yields `2026`, which is then treated as days since 1899-12-30 producing a 1905 date.
  - `parseDate` lacks support for some common separators (notably `.` and `YYYY/MM/DD`), and the ISO branch (`YYYY-MM-DD`) does not strictly validate that the constructed Date's components match the parsed components (so `2026-02-30` is rolled over to March instead of rejected).

Goals
- Reproduce the failure with a minimal script.
- Propose a bounded fix limited to `src/utils/bulkUploadTransformer.js` and related CSV validation in `validateCSVRows`.
- Add regression tests and validation checks that fail before the fix and pass after.
- Preserve unrelated behavior (phone/address formatting, beneficiary logic, and Excel serial handling for pure numeric inputs).

Out of scope
- Changing user-visible CSV formats or UX beyond error reporting for invalid dates.
- Internationalization beyond supporting common separators (`-`, `/`, `.`) and year-order variants for numeric dates.

Proposed Fix (high level)
1. Make Excel-serial detection strict: only treat an input as an Excel serial number when the trimmed value is purely numeric (digits, optional decimal), e.g. `/^\d+(?:\.\d+)?$/`.
2. Add support for additional date separators and orders:
   - Accept `YYYY/MM/DD` (slash) and `DD.MM.YYYY` (dot) and their 2-digit-year variants where appropriate.
3. Strictly validate constructed Dates for all numeric formats: after constructing `new Date(year, month-1, day)`, verify `date.getFullYear() === year && date.getMonth() === month-1 && date.getDate() === day`. If not, reject (return `null`). This prevents rollover for non-existent days like `2026-02-30`.
4. Adjust `validateCSVRows` to include the dotted format and `YYYY/MM/DD` patterns and to prefer using `parseDate` as the source-of-truth for validation (i.e., parse and if `parseDate` returns `null`, mark as invalid). Do not rely solely on regex format checks.
5. Keep Excel serial handling for pure-numeric strings unchanged (still treat numeric-only inputs as serials). Document this in code comments.

Acceptance Criteria (verifiable)
- Unit/regression tests (see Test Plan) assert that:
  - `parseDate('2026/03/15')` resolves to a Date whose local date are year=2026, month=3, day=15.
  - `parseDate('15.03.2026')` resolves to a Date whose local date are year=2026, month=3, day=15.
  - `parseDate('2026-02-30')` returns `null` (or `validateCSVRows` reports an explicit error for that row).
  - Inputs like `'44927'` (pure numeric Excel serial) continue to parse as before.
- CSV validator `validateCSVRows` rejects rows with non-existent dates and reports a clear error message: `Row N: Follow Up Date "<value>" is not a valid date`.

Non-functional Requirements
- Changes are limited to `src/utils/bulkUploadTransformer.js` and unit tests/spec files.
- No public API changes; internal behaviour (parseDate semantics) is tightened.

Files to change
- `src/utils/bulkUploadTransformer.js:272` (function `parseDate`).
- `src/utils/bulkUploadTransformer.js` (validateCSVRows date formats and validation logic) - near `validateCSVRows` implementation.

Regressions and checks
- Add unit tests (proposed locations and content in Plan) that run locally with Node or a chosen test runner.
- Add a small script under `specs/001-evolve-7e8b32aa16d345f6b090bb2f/tests/` that reproduces the failing input and shows the expected output.

Next steps
- Request human approval of spec and plan before implementing code changes or updating project config (e.g., adding a test runner).


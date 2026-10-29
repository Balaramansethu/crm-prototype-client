## Specification Analysis Report

### Context
- Feature directory: `specs/001-evolve-7e8b32aa16d345f6b090bb2f`
- I ran the prerequisites checker and opened `spec.md`, `plan.md`, and `tasks.md` as requested.
- Constitution file loaded: `.specify/memory/constitution.md` (version 1.0.0, ratified 2026-10-29).

---

## Findings

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Bug / Logic | HIGH | `src/utils/bulkUploadTransformer.js:272` (parseDate), `src/utils/bulkUploadTransformer.js:398-407` (excel detection) | `parseDate` uses `parseFloat(trimmed)` to detect Excel serial numbers. `parseFloat('2026/03/15') === 2026` leads to misclassification (treated as Excel serial) and wrong year (1905). This is the bug described in `spec.md`. | Replace `parseFloat`-based detection with a strict numeric-only test (e.g. `/^\d+(?:\.\d+)?$/`) and only treat strictly numeric inputs as Excel serials. Ensure parsing of explicit `YYYY/MM/DD` and dotted formats happens before numeric-only fallback. Add a comment documenting why numeric-only is required. |
| A2 | Missing format support | MEDIUM | `src/utils/bulkUploadTransformer.js:290-366` (format parsing) | `parseDate` currently supports `YYYY-MM-DD` and several DD/MM or DD-MM variants but does not explicitly support `YYYY/MM/DD` (slash) or dotted `DD.MM.YYYY`. Tests and spec expect `2026/03/15` and `15.03.2026` to parse to 2026-03-15. | Add explicit parsing for `YYYY/MM/DD` and `DD.MM.YYYY` (and short-year dotted variants if desired). Try `YYYY/MM/DD` before falling back to other slash-based patterns so year-first strings are not mis-parsed as other formats. |
| A3 | Validation gap | MEDIUM | `src/utils/bulkUploadTransformer.js:546-553` (dateFormats in `validateCSVRows`) | `validateCSVRows` uses a regex-first format check that omits `^\d{4}\/\d{1,2}\/\d{1,2}$` (YYYY/MM/DD) and dotted patterns; this causes some valid-looking strings to be rejected at the validator level (and it relies on `parseDate` as a second step). | Update `dateFormats` to include `YYYY/MM/DD` and dotted regex (e.g. `/^\d{1,2}\.\d{1,2}\.\d{4}$/`). Prefer calling `parseDate` for final validation (already done) but ensure the format whitelist is consistent with `parseDate`'s accepted formats. |
| A4 | Process risk | MEDIUM | `src/utils/bulkUploadTransformer.js:13-47` (transformCSVToBackendPayload) and `src/utils/bulkUploadTransformer.js:131-133` (buildContactObject) | `transformCSVToBackendPayload` does not call `validateCSVRows` before transforming rows. If `parseDate` misparses values, invalid data may be transformed and returned to callers. | Either (a) call `validateCSVRows` as a pre-check in `transformCSVToBackendPayload` (fail fast and return errors), or (b) ensure `parseDate` is made robust (recommended) and keep transformation tolerant. Prefer (a) for stricter safety in bulk uploads. |
| A5 | Test determinism / Timezone ambiguity | MEDIUM | `tests/followUpDate.test.js` (tests rely on local date conversion) | Tests compare local date parts derived from an ISO string (`new Date(iso)` then `getFullYear()`/`getMonth()`/`getDate()`), which can be sensitive to timezone assumptions if parse/format are not anchored consistently. This may cause flaky results across environments/timezones. | Make tests timezone-deterministic: either construct Date objects with `new Date(year, month-1, day)` and compare UTC components, or compare `date.getUTCFullYear()`/`getUTCMonth()`/`getUTCDate()` after ensuring `parseDate` returns a UTC-aligned ISO at midnight. Document the expected timezone semantics in `spec.md` (the spec already notes "checks the local date, not UTC"). |
| A6 | Minor code smell / naming | LOW | `src/utils/bulkUploadTransformer.js:142-146` (buildContactObject) | `contact.benificiary` is used (note: backend expects the misspelled key), which is surprising and easy to miss. | Leave as-is if backend contract requires the misspelling; otherwise align naming and add a comment. Add a short comment referencing backend contract to avoid accidental renames. |

---

## Coverage Summary

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001: Excel-serial strict detection (only numeric inputs are Excel) | Yes | T002 | Covered by T002. Change should be in `parseDate` detection logic. |
| FR-002: Support `YYYY/MM/DD` and `DD.MM.YYYY` (and related) | Yes | T003 | Covered by T003; implement explicit parsing before numeric fallback. |
| FR-003: Reject non-existent dates (e.g., 2026-02-30) across formats | Yes | T004 | Covered by T004; requires strict post-construction validation (`getFullYear()/getMonth()/getDate()` equality). |
| FR-004: Validator message and behavior (`validateCSVRows` reports `Row N: Follow Up Date "<value>" is not a valid date`) | Yes | T005 | Covered: update `dateFormats` and prefer parseDate for final validation. |
| FR-005: Tests & regression verification | Yes | T001, T006 | Tests exist at `tests/followUpDate.test.js` and plan calls for running them. |

No unmapped tasks found: all tasks T001–T006 map to at least one requirement above.

---

## Constitution Alignment Issues

- I checked `.specify/memory/constitution.md` (Project Constitution v1.0.0). The main non-negotiable principle relevant here is **Test-First & Coverage** (unit tests required for changes). The spec and plan explicitly include tests (`tests/followUpDate.test.js`) and the plan instructs running them with `node --test`. This aligns with the constitution.

- No constitution principles are violated by the proposed scope (changes are limited to `src/utils/bulkUploadTransformer.js` and tests). No CRITICAL constitution issues found.

---

## Metrics

- Total Requirements (identified): 5
- Total Tasks (from `tasks.md`): 6 (T001–T006)
- Coverage % (requirements with ≥1 task): 100%
- Ambiguity Count (timezone / Excel-decimal handling): 2 (see A5 and note below)
- Duplication Count: 0
- Critical Issues Count: 0

---

## Next Actions (concise)

- Priority fixes to implement (in order):
  - Update `parseDate` to use strict numeric detection for Excel serials and to parse `YYYY/MM/DD` and dotted formats before numeric fallback. (addresses A1, A2)
  - Add dotted and `YYYY/MM/DD` regex entries to `validateCSVRows` and rely on `parseDate` for final validation. (addresses A3)
  - Make tests timezone-deterministic (or document the local-date expectation explicitly). (addresses A5)
  - Consider calling `validateCSVRows` at the start of `transformCSVToBackendPayload` to fail fast on invalid inputs; optional but recommended. (addresses A4)

- Quick commands to run locally:
  - `node --test tests/followUpDate.test.js` — run the regression tests (plan uses Node builtin runner).
  - `npm run lint` and `npm run build` — per the plan's checklist.

- If you want, I can produce a precise code patch (small, targeted edits) for the top items above (parseDate and validateCSVRows). Do you want me to prepare that patch? (I will not apply it until you approve.)

---

## Offer

Would you like me to suggest concrete remediation edits for the top 3 issues (A1–A3)? I can produce a focused patch for `src/utils/bulkUploadTransformer.js` and an accompanying test tweak to make the tests deterministic if you say "yes".


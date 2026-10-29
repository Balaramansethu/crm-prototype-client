Implementation Plan (do not implement until human approval)

Short summary
- Tighten `parseDate` and CSV validation: guard the Excel-serial path to only pure-numeric inputs; add dotted and YYYY/MM/DD format support; and strictly validate constructed dates to reject non-existent calendar dates.

High-level tasks
1. Regression test: use the existing tests/followUpDate.test.js, run with `node --test tests/followUpDate.test.js` (no Jest, no new dependency). It checks the local date, not UTC.

2. Implement the code changes (one small PR):
   - Edit `src/utils/bulkUploadTransformer.js`:
     - In `parseDate`:
       - Add an early guard: if the trimmed string does not match `/^\d+(?:\.\d+)?$/` then do not treat it as an Excel serial number.
       - Add support for `YYYY/MM/DD` (slash) and `DD.MM.YYYY` (dot) patterns (and short-year variants if needed). Try `YYYY/MM/DD` before falling back.
       - For the ISO (`YYYY-MM-DD`) branch and other numeric-to-Date branches, after constructing `new Date(year, month-1, day)` verify that `date.getFullYear() === year && date.getMonth() === month-1 && date.getDate() === day`. If not, treat as invalid and don't return a rolled date.
     - In `validateCSVRows`:
       - Add regex entries for dotted format `^\d{1,2}\.\d{1,2}\.\d{4}$` and for `^\d{4}\/\d{1,2}\/\d{1,2}$` (YYYY/MM/DD).
       - Prefer calling `parseDate` for final validation; i.e., after regex match, call `parseDate` and check return value.
   - Keep Excel serial behaviour for pure-numeric inputs unchanged.

3. Run tests and adjust as necessary.

4. Code review and submit for human approval.

Acceptance test checklist (developer-run)
- [ ] Add tests that demonstrate the three issues fail against current code
- [ ] Implement change
- [ ] Tests pass locally
- [ ] Run `npm run lint` and `npm run format:check` (if configured) and fix any style issues

Risk analysis
- Excel-serial edge cases: current code uses epoch `1899-12-30` to account for Excel bug. Keep that behaviour for numeric-only strings.

Rollout notes
- Small focused PR changing only `src/utils/bulkUploadTransformer.js` and adding tests under `test/`.
- No database migrations or external API changes.

Estimated effort
- Tests + spec: 1-2 hours
- Implementation + tests passing + lint: 1-3 hours
- Code review + followups: 1 hour


Reproduction and analysis notes

Reproduction (minimal):
- I created a temporary Node script that implements the repository's current `parseDate` logic (copied from `src/utils/bulkUploadTransformer.js`) and ran it to observe the outputs for the reported examples.

Commands run (on this machine):
- Created and executed: `/tmp/tmp_repro_parse.js` (script replicates `parseDate` logic)

Observed output (raw):
```
2026/03/15 -> 1905-07-17T18:38:50.000Z
15.03.2026 -> 1900-01-13T19:22:02.000Z
2026-02-30 -> 2026-03-01T18:30:00.000Z
```

Interpretation
- `2026/03/15` is parsed as `2026` (parseFloat('2026/03/15') -> 2026) and treated as an Excel serial -> results in 1905 date (explains ticket).
- `15.03.2026` is parsed as a float -> `15.03` and treated as Excel serial -> 1900-ish date.
- `2026-02-30` falls through to the ISO branch and rolls over to March 1, 2026 rather than being rejected because the ISO branch does not validate that the constructed date matches parsed components.

Root cause summary
- The function treats inputs containing non-digit separators as numeric if they start with digits, due to `parseFloat(trimmed)` used for Excel serial detection.
- Some common formats (dot as separator, or `YYYY/MM/DD`) are not explicitly supported by regex checks.
- The ISO branch accepts invalid day values because it does not perform component equality checks after constructing the Date.

Recommended immediate mitigations (summary)
- Only accept Excel serial numbers for strings that are purely numeric (regex-guarded).
- Add explicit patterns for `YYYY/MM/DD` and `DD.MM.YYYY` and their 2-digit-year variants.
- Strictly validate constructed dates by comparing year/month/day components; if mismatch, reject as invalid.

Research notes saved to: `specs/001-evolve-7e8b32aa16d345f6b090bb2f/research.md` (this file).

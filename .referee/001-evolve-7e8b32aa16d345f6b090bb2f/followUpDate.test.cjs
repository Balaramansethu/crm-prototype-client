const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

// Referee acceptance tests for the bulk upload date parsing fix.
// These tests exercise the public module at `src/utils/bulkUploadTransformer.js`
// and verify the behavior described in specs/001-evolve-7e8b32aa16d345f6b090bb2f/spec.md.

function getParseDate(mod) {
  if (!mod) return null;
  if (typeof mod === 'function') return mod;
  if (typeof mod.parseDate === 'function') return mod.parseDate;
  if (typeof mod.parse_date === 'function') return mod.parse_date;
  if (mod && mod.default) {
    if (typeof mod.default === 'function') return mod.default;
    if (typeof mod.default.parseDate === 'function') return mod.default.parseDate;
    if (typeof mod.default.parse_date === 'function') return mod.default.parse_date;
  }
  return null;
}

async function loadTransformer() {
  // Try synchronous require first (CommonJS). If it fails because the
  // module is ESM, fall back to dynamic import.
  try {
    // Path must be exactly as plan.md / tasks.md name it, relative to this file:
    // '../../src/utils/bulkUploadTransformer.js'
    return require('../../src/utils/bulkUploadTransformer.js');
  } catch (err) {
    // If it's an ESM module, import it dynamically.
    const p = path.resolve(__dirname, '../../src/utils/bulkUploadTransformer.js');
    return import(pathToFileURL(p).href);
  }
}

test('parseDate: YYYY/MM/DD (2026/03/15) -> 2026-03-15 local date', async () => {
  const mod = await loadTransformer();
  const parseDate = getParseDate(mod);
  assert.ok(parseDate, 'module does not export parseDate (or equivalent)');

  const d = parseDate('2026/03/15');
  assert.ok(d === null || d instanceof Date, 'parseDate should return a Date or null');
  assert.notStrictEqual(d, null, 'Expected a valid Date for "2026/03/15" but got null');
  assert.strictEqual(d.getFullYear(), 2026, 'year should be 2026');
  assert.strictEqual(d.getMonth() + 1, 3, 'month should be March (3)');
  assert.strictEqual(d.getDate(), 15, 'day should be 15');
});

test('parseDate: DD.MM.YYYY (15.03.2026) -> 2026-03-15 local date', async () => {
  const mod = await loadTransformer();
  const parseDate = getParseDate(mod);
  assert.ok(parseDate, 'module does not export parseDate (or equivalent)');

  const d = parseDate('15.03.2026');
  assert.ok(d === null || d instanceof Date, 'parseDate should return a Date or null');
  assert.notStrictEqual(d, null, 'Expected a valid Date for "15.03.2026" but got null');
  assert.strictEqual(d.getFullYear(), 2026, 'year should be 2026');
  assert.strictEqual(d.getMonth() + 1, 3, 'month should be March (3)');
  assert.strictEqual(d.getDate(), 15, 'day should be 15');
});

test('parseDate: invalid calendar date (2026-02-30) -> null', async () => {
  const mod = await loadTransformer();
  const parseDate = getParseDate(mod);
  assert.ok(parseDate, 'module does not export parseDate (or equivalent)');

  const d = parseDate('2026-02-30');
  assert.strictEqual(d, null, 'Expected parseDate("2026-02-30") to return null for non-existent date');
});

test('parseDate: pure-numeric Excel serial ("44927") still parses to a Date', async () => {
  const mod = await loadTransformer();
  const parseDate = getParseDate(mod);
  assert.ok(parseDate, 'module does not export parseDate (or equivalent)');

  const d = parseDate('44927');
  assert.ok(d instanceof Date, 'Excel-serial numeric string should still parse to a Date');
  assert.ok(!isNaN(d.getTime()), 'Parsed Excel serial should be a valid Date');
});


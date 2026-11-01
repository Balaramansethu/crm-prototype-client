import test from 'node:test';
import assert from 'node:assert/strict';

// The acceptance matrix is deliberately non-UTC, as required by the work order.
process.env.TZ = 'Asia/Kolkata';

const { transformLeadPayload, transformLeadUpdatePayload } = await import(
  '../../src/utils/leadTransformers.js'
);

const contact = { name: 'Sara' };

function localMidnight() {
  return new Date(2026, 2, 15);
}

function leadInput(followUp) {
  return {
    contact,
    followUp,
    // The public contract describes this as the nested lead-item location.
    // Supplying it also keeps the fixture valid for the update shape.
    leads: [{ contact, ...(followUp === undefined ? {} : { followUp }) }],
  };
}

function localCalendarDay(isoValue) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoValue));

  return Object.fromEntries(
    parts
      .filter(({ type }) => ['year', 'month', 'day'].includes(type))
      .map(({ type, value }) => [type, value])
  );
}

function assertFollowUpOmitted(payload, path) {
  assert.equal(Object.hasOwn(path, 'followUp'), false, JSON.stringify(payload));
}

test('create serializes local 15 March 2026 as its actual UTC instant', () => {
  const selected = localMidnight();
  const expected = '2026-03-14T18:30:00.000Z';
  const payload = transformLeadPayload(leadInput(selected));

  assert.equal(payload.leads[0].followUp, expected);
  assert.deepEqual(payload.leads[0].contact, contact);
  assert.deepEqual(localCalendarDay(payload.leads[0].followUp), {
    year: '2026',
    month: '03',
    day: '15',
  });
});

test('existing-contact update and newly-added-contact update use the same instant', () => {
  const expected = localMidnight().toISOString();
  const payload = transformLeadUpdatePayload(leadInput(localMidnight()));

  assert.equal(payload.followUp, expected);
  assert.equal(payload.leads[0].followUp, expected);
  assert.deepEqual(payload.leads[0].contact, contact);
});

test('four unchanged edit/save cycles are idempotent and keep the local day', () => {
  const expected = localMidnight().toISOString();
  let stored = expected;

  for (let save = 0; save < 4; save += 1) {
    const payload = transformLeadUpdatePayload(
      leadInput(new Date(stored))
    );

    assert.equal(payload.followUp, stored);
    assert.equal(payload.leads[0].followUp, stored);
    assert.deepEqual(localCalendarDay(payload.followUp), {
      year: '2026',
      month: '03',
      day: '15',
    });
    stored = payload.followUp;
  }
});

test('missing follow-up remains omitted at create and both update locations', () => {
  const createPayload = transformLeadPayload(leadInput(undefined));
  const updatePayload = transformLeadUpdatePayload(leadInput(undefined));

  assertFollowUpOmitted(createPayload, createPayload.leads[0]);
  assertFollowUpOmitted(updatePayload, updatePayload);
  assertFollowUpOmitted(updatePayload, updatePayload.leads[0]);
});

test('invalid follow-up remains omitted at create and both update locations', () => {
  const invalid = new Date('not a date');
  const createPayload = transformLeadPayload(leadInput(invalid));
  const updatePayload = transformLeadUpdatePayload(leadInput(invalid));

  assertFollowUpOmitted(createPayload, createPayload.leads[0]);
  assertFollowUpOmitted(updatePayload, updatePayload);
  assertFollowUpOmitted(updatePayload, updatePayload.leads[0]);
});

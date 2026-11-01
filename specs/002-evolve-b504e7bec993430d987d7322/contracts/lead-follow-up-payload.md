# Contract: Lead follow-up payload

This client-side contract documents the value sent to the existing lead API. It does not change the endpoint, field names, backend schema, or unrelated payload fields.

## Valid date

For a valid `Date`, `followUp` is the exact ISO UTC representation of that instant:

```text
followUp = date.toISOString()
```

Example in `Asia/Kolkata`:

```text
local selection: 15 March 2026 at 00:00 local
payload value:   2026-03-14T18:30:00.000Z
```

## Create payload

The value is emitted at the existing lead-item location:

```json
{
  "leads": [
    {
      "contact": { "name": "Sara" },
      "followUp": "2026-03-14T18:30:00.000Z"
    }
  ]
}
```

## Existing-contact update

The value remains at the existing root location:

```json
{
  "followUp": "2026-03-14T18:30:00.000Z"
}
```

Reloading this value into a `Date` and saving without edits must emit the same string byte-for-byte.

## Newly added-contact update

The value is emitted at the existing nested lead-item location under `leads[]`, using the same serialization rule as create.

## Omission rules

If `followUp` is missing, null-like, or invalid, the field is omitted after the existing payload cleanup. No malformed date string is sent. All other fields and endpoints retain their current behavior.

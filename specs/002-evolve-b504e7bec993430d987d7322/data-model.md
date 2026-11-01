# Data Model: Lead follow-up date

## Lead follow-up date

An optional calendar date selected in the lead form and represented in form state as a JavaScript `Date` at local midnight. The persisted representation is an ISO 8601 UTC timestamp for that exact instant.

| Property | Form representation | Persisted representation | Rules |
|---|---|---|---|
| `followUp` | `Date` or absent | ISO UTC string or omitted | A valid date is serialized with `toISOString()`; missing or invalid input is omitted. |

The local calendar day is presentation behavior: parsing the persisted instant with `new Date(...)` and formatting it in the user's local zone must continue to show the selected day.

## Payload locations

- Create: `leads[].followUp` in the object returned by `transformLeadPayload`.
- Existing-contact update: root `followUp` in the object returned by `transformLeadUpdatePayload`.
- Newly added-contact update: `leads[].followUp` in the object returned by `transformLeadUpdatePayload`.

All three locations use the same internal serializer. No new entity, backend field, migration, or client state is introduced.

## State transitions

```text
local date-picker Date
        │ create/update transform
        ▼
actual ISO UTC instant
        │ API response / edit form reload
        ▼
Date representing the same instant
        │ unchanged save
        └──────────────► identical ISO UTC instant
```

An absent or invalid value remains absent through transformation and cleanup; it must not become a malformed string or an implicit current date.

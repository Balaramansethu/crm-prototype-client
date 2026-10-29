import { test } from "node:test"
import assert from "node:assert/strict"
import {
    transformCSVToBackendPayload,
    validateCSVRows,
} from "../src/utils/bulkUploadTransformer.js"

function followUpFor(value) {
    const [entry] = transformCSVToBackendPayload([
        { "Company Name": "Acme", "Contact Name": "Sara", "Follow Up Date": value },
    ])
    return entry.prospectuses[0].followUp
}

function localDay(iso) {
    const d = new Date(iso)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

test("reads 2026/03/15 as 15 March 2026", () => {
    assert.equal(localDay(followUpFor("2026/03/15")), "2026-3-15")
})

test("reads 15.03.2026 as 15 March 2026", () => {
    assert.equal(localDay(followUpFor("15.03.2026")), "2026-3-15")
})

test("rejects 2026-02-30, a day that does not exist", () => {
    assert.equal(followUpFor("2026-02-30"), null)
})

test("still reads 2026-03-15 and 15/03/2026", () => {
    assert.equal(localDay(followUpFor("2026-03-15")), "2026-3-15")
    assert.equal(localDay(followUpFor("15/03/2026")), "2026-3-15")
})

test("reads pure-numeric Excel serial 44927 as 1 January 2023", () => {
    assert.equal(localDay(followUpFor("44927")), "2023-1-1")
})

test("validateCSVRows reports error for invalid Follow Up Date", () => {
    const { errors } = validateCSVRows([
        {
            "Company Name": "Acme",
            "Company Phone Number": "0400000000",
            "Follow Up Date": "2026-02-30",
        },
    ])
    assert.ok(
        errors.includes('Row 2: Follow Up Date "2026-02-30" is not a valid date'),
        `expected error not found; got: ${JSON.stringify(errors)}`,
    )
})

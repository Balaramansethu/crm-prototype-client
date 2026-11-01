// The bug only shows away from UTC, and the checks run with no shell to set TZ, so set it here
// before any date is made. India (UTC+5:30) is where the drift was reported.
process.env.TZ = "Asia/Kolkata"

import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { format } from "date-fns"
import {
    transformLeadPayload,
    transformLeadUpdatePayload,
} from "../src/utils/leadTransformers.js"

const leadsPageSource = readFileSync(
    new URL("../src/pages/LeadsPage/LeadsPage.jsx", import.meta.url),
    "utf8",
)
const leadDetailPageSource = readFileSync(
    new URL("../src/pages/LeadsPage/LeadDetailPage.jsx", import.meta.url),
    "utf8",
)

// The lead form's date picker is date-only: picking a day gives that day at local midnight.
const picked = new Date(2026, 2, 15)

const form = (followUp) => ({
    companyDetails: { name: "Acme" },
    contacts: [{ name: "Sara", followUp }],
})

const createdFollowUp = () =>
    transformLeadPayload(form(picked), "owner-1").leads[0].followUp

test("sends the picked follow-up date as the real moment, not local time labelled UTC", () => {
    assert.equal(createdFollowUp(), picked.toISOString())
})

test("uses the real moment at each create and update payload location", () => {
    const expected = picked.toISOString()
    const existingContactUpdate = transformLeadUpdatePayload(
        form(picked),
        0,
    )
    const newlyAddedContactUpdate = transformLeadUpdatePayload(
        {
            companyDetails: { name: "Acme" },
            contacts: [
                { _id: "contact-1", name: "Sara" },
                { name: "Nina", followUp: picked },
            ],
        },
        0,
    )

    assert.equal(
        transformLeadPayload(form(picked), "owner-1").leads[0].followUp,
        expected,
    )
    assert.equal(existingContactUpdate.followUp, expected)
    assert.equal(newlyAddedContactUpdate.leads[0].followUp, expected)
})

test("saving a lead without changes keeps its follow-up date", () => {
    let stored = createdFollowUp()
    for (let save = 1; save <= 4; save++) {
        // The edit form loads the stored value with new Date(...), then saves it back.
        stored = transformLeadUpdatePayload(form(new Date(stored)), 0).followUp
    }
    assert.equal(stored, picked.toISOString())
})

test("still shows 15 March 2026 after four saves", () => {
    let stored = createdFollowUp()
    for (let save = 1; save <= 4; save++) {
        stored = transformLeadUpdatePayload(form(new Date(stored)), 0).followUp
    }
    const shown = new Date(stored)
    assert.deepEqual(
        [shown.getFullYear(), shown.getMonth() + 1, shown.getDate()],
        [2026, 3, 15],
    )
})

test("list and detail render the persisted follow-up as 15 March after four saves", () => {
    // This source-backed smoke check covers the two existing JSX render paths
    // without adding a browser or component-test dependency to the project.
    assert.match(
        leadsPageSource,
        /format\(\s*new Date\(lead\.followUp\),\s*"dd-MM-yyyy",\s*\)/,
    )
    assert.match(
        leadDetailPageSource,
        /format\(new Date\(dateString\), "dd MMM yyyy"\)/,
    )
    assert.match(
        leadDetailPageSource,
        /value=\{formatDate\(mainContact\.followUp\)\}/,
    )

    let stored = createdFollowUp()
    for (let save = 1; save <= 4; save++) {
        stored = transformLeadUpdatePayload(form(new Date(stored)), 0).followUp
    }

    const listDate = format(new Date(stored), "dd-MM-yyyy")
    const detailDate = format(new Date(stored), "dd MMM yyyy")

    assert.equal(listDate, "15-03-2026")
    assert.equal(detailDate, "15 Mar 2026")
})

test("missing or invalid follow-up dates are omitted from every payload location", () => {
    for (const followUp of [undefined, new Date("invalid")]) {
        const lead = transformLeadPayload(form(followUp), "owner-1").leads[0]
        const existingContactUpdate = transformLeadUpdatePayload(
            {
                companyDetails: { name: "Acme" },
                contacts: [{ _id: "contact-1", name: "Sara", followUp }],
            },
            0,
        )
        const newlyAddedContactUpdate = transformLeadUpdatePayload(
            {
                companyDetails: { name: "Acme" },
                contacts: [
                    { _id: "contact-1", name: "Sara" },
                    { name: "Nina", followUp },
                ],
            },
            0,
        )

        assert.equal(lead.followUp, undefined)
        assert.equal(existingContactUpdate.followUp, undefined)
        assert.equal(
            newlyAddedContactUpdate.leads[0].followUp,
            undefined,
        )
    }
})

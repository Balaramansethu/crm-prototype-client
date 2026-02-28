/**
 * Prospectus data transformation utilities.
 *
 * API shapes:
 *
 * GET ALL → data.prospectuses[] → each group = { company, prospectuses[] }
 *   each prospectus = { _id, contact: { name, phone, email, department, remarks },
 *                        status, source, followUp, priority, benificiary,
 *                        convertedToLead, createdBy }
 *
 * GET BY ID → single prospectus  (same shape as above, company is populated)
 *
 * POST → { company: {...}, leads: [{ name, email, phone, department, remarks,
 *            status, source, followUp, priority, benificiary }] }
 */
import { format } from "date-fns"

// ─── Constants ───────────────────────────────────────────────

export const PROSPECTUS_STATUS_OPTIONS = [
    { value: "new", label: "statusNew", color: "bg-sky-100 text-sky-800" },
    {
        value: "qualified",
        label: "statusQualified",
        color: "bg-emerald-100 text-emerald-800",
    },
]

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Builds a phone object for the API payload.
 * Returns undefined if no phone number is present.
 */
const buildPhone = (countryCode, number, extension) => {
    if (!number) return undefined
    const phone = { number }
    if (countryCode) phone.countryCode = countryCode
    if (extension) phone.extension = extension
    return phone
}

/**
 * Builds an address object, omitting empty fields.
 */
const buildAddress = (address) => {
    if (!address) return undefined
    const result = {}
    const fields = [
        "door",
        "street",
        "area",
        "city",
        "pincode",
        "shortAddress",
    ]
    fields.forEach((f) => {
        if (address[f]) result[f] = address[f]
    })

    const lat = parseFloat(address.latitude)
    const lng = parseFloat(address.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
        result.location = { latitude: lat, longitude: lng }
    }

    return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Builds a beneficiary object from form data.
 */
const buildBeneficiary = (ben) => {
    if (!ben || !ben.name) return undefined
    return {
        name: ben.name,
        phone: buildPhone(
            ben.phoneCountryCode,
            ben.phoneNumber,
            ben.phoneExtension,
        ),
    }
}

const formatDate = (date) => {
    if (!date) return undefined
    try {
        return new Date(date).toISOString()
    } catch {
        return undefined
    }
}

/**
 * Removes undefined/null/empty-string values from an object.
 */
const cleanObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj
    const result = {}
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
        ) {
            const nested = cleanObject(value)
            if (nested && Object.keys(nested).length > 0) result[key] = nested
        } else {
            result[key] = value
        }
    })
    return Object.keys(result).length > 0 ? result : undefined
}

// ─── Flatten for grid ────────────────────────────────────────

/**
 * Flatten grouped API response into flat rows for the table.
 *
 * API shape:  data.prospectuses[] where each = { company, prospectuses[] }
 * Each inner prospectus has `contact` object (may be absent for company-only rows),
 * `status`, `source`, `followUp`, `priority`, `convertedToLead`, `createdBy`.
 */
export const flattenProspectusGroups = (companyGroups = []) => {
    const flattened = []
    companyGroups.forEach((group) => {
        const company = group.company || {}
        const prospectuses = group.prospectuses || []

        if (prospectuses.length > 0) {
            prospectuses.forEach((prospectus, index) => {
                flattened.push({
                    _id: prospectus._id,
                    companyId: company._id,
                    company,
                    // Merge contact data with prospectus-level fields for easy access
                    contact: prospectus.contact || null,
                    status: prospectus.status,
                    source: prospectus.source,
                    followUp: prospectus.followUp,
                    priority: prospectus.priority,
                    benificiary: prospectus.benificiary,
                    convertedToLead: prospectus.convertedToLead,
                    createdBy: prospectus.createdBy,
                    createdAt: prospectus.createdAt,
                    prospectIndex: index,
                    isCompanyOnly: !prospectus.contact,
                })
            })
        } else {
            // Company with no prospectuses – show company-only row
            flattened.push({
                _id: company._id,
                companyId: company._id,
                company,
                contact: null,
                status: null,
                prospectIndex: 0,
                isCompanyOnly: true,
            })
        }
    })
    return flattened
}

// ─── Form defaults from API response (GET by ID) ────────────

/**
 * Normalizes phone data, handling old records that stored
 * country code in the extension field.
 */
const normalizePhone = (phone) => {
    let countryCode = phone?.countryCode || "+966"
    let extension = phone?.extension || ""
    const number = phone?.number || ""

    if (!phone?.countryCode && extension.startsWith("+")) {
        countryCode = extension
        extension = ""
    }
    if (extension === "+966") extension = ""

    return {
        phoneCountryCode: countryCode,
        phoneExtension: extension,
        phoneNumber: number,
    }
}

/**
 * Extracts form default values from a GET-by-ID response.
 *
 * API shape (single prospectus):
 *   { company: {...}, contact: { name, phone, email, department, remarks },
 *     status, source, followUp, priority, benificiary }
 */
export const extractFormDefaults = (data) => {
    if (!data) return null

    const company = data.company || {}
    const contact = data.contact || {}
    const companyPhone = normalizePhone(company.phone)
    const contactPhone = normalizePhone(contact.phone)
    const benPhone = normalizePhone(data.benificiary?.phone)

    return {
        companyDetails: {
            name: company.name || "",
            email: company.email || "",
            ...companyPhone,
            website: company.website || "",
            socialProfile: company.socialProfile || "",
            serviceType: company.serviceType || "",
            address: {
                door: company.address?.door || "",
                street: company.address?.street || "",
                area: company.address?.area || "",
                city: company.address?.city || "",
                pincode: company.address?.pincode || "",
                latitude: company.address?.location?.latitude ?? "",
                longitude: company.address?.location?.longitude ?? "",
                shortAddress: company.address?.shortAddress || "",
            },
        },
        // Contact fields (from nested `contact` object)
        name: contact.name || "",
        email: contact.email || "",
        ...contactPhone,
        department: contact.department || "",
        remarks: contact.remarks || "",
        // Prospectus-level fields (at root)
        status: data.status || "new",
        source: data.source || "",
        followUp: data.followUp ? new Date(data.followUp) : undefined,
        priority: data.priority ?? 0,
        beneficiary: {
            name: data.benificiary?.name || "",
            ...benPhone,
        },
    }
}

// ─── Payload builders ────────────────────────────────────────

/**
 * Transforms form data to API payload for CREATE.
 *
 * Output shape: { company: {...}, leads: [{ contact: { name, phone, email, department, remarks }, status, source, ... }] }
 */
export const transformProspectusPayload = (formData) => {
    const { companyDetails, beneficiary, ...contactFields } = formData

    const companyPayload = cleanObject({
        name: companyDetails.name,
        phone: buildPhone(
            companyDetails.phoneCountryCode,
            companyDetails.phoneNumber,
            companyDetails.phoneExtension,
        ),
        email: companyDetails.email || undefined,
        website: companyDetails.website || undefined,
        socialProfile: companyDetails.socialProfile || undefined,
        serviceType: companyDetails.serviceType || undefined,
        address: buildAddress(companyDetails.address),
    })

    const payload = { company: companyPayload }

    // Build leads array — each lead has nested contact object + lead-level fields
    const lead = cleanObject({
        contact: {
            name: contactFields.name || undefined,
            phone: buildPhone(
                contactFields.phoneCountryCode,
                contactFields.phoneNumber,
                contactFields.phoneExtension,
            ),
            email: contactFields.email || undefined,
            department: contactFields.department || undefined,
            remarks: contactFields.remarks || undefined,
        },
        status: contactFields.status || "new",
        source: contactFields.source || undefined,
        followUp: formatDate(contactFields.followUp),
        priority: contactFields.priority ?? 0,
        benificiary: buildBeneficiary(beneficiary),
    })

    if (lead) {
        payload.leads = [lead]
    }

    return payload
}

/**
 * Transforms form data for UPDATE (PATCH).
 * Contact fields go inside a `contact` object; lead-level fields at root.
 *
 * PATCH payload: { company, contact: { name, phone, ... }, status, source, ... }
 */
export const transformProspectusUpdatePayload = (formData, originalData) => {
    const payload = {}
    const { companyDetails, beneficiary, ...contactFields } = formData
    const origCompany = originalData?.companyDetails || {}
    const origContact = originalData || {}

    // ── Company changes ──
    const companyChanges = {}
    if (companyDetails.name !== origCompany.name) {
        companyChanges.name = companyDetails.name
    }
    if (companyDetails.phoneNumber !== origCompany.phoneNumber) {
        companyChanges.phone = buildPhone(
            companyDetails.phoneCountryCode,
            companyDetails.phoneNumber,
            companyDetails.phoneExtension,
        )
    }
    if ((companyDetails.email || "") !== (origCompany.email || "")) {
        companyChanges.email = companyDetails.email || undefined
    }
    if ((companyDetails.website || "") !== (origCompany.website || "")) {
        companyChanges.website = companyDetails.website || undefined
    }
    if (
        (companyDetails.socialProfile || "") !==
        (origCompany.socialProfile || "")
    ) {
        companyChanges.socialProfile =
            companyDetails.socialProfile || undefined
    }
    if (
        (companyDetails.serviceType || "") !== (origCompany.serviceType || "")
    ) {
        companyChanges.serviceType = companyDetails.serviceType || undefined
    }
    if (
        JSON.stringify(companyDetails.address) !==
        JSON.stringify(origCompany.address)
    ) {
        companyChanges.address = buildAddress(companyDetails.address)
    }
    if (Object.keys(companyChanges).length > 0) {
        payload.company = companyChanges
    }

    // ── Contact fields (nested inside `contact` object) ──
    const contactChanges = {}
    if ((contactFields.name || "") !== (origContact.name || ""))
        contactChanges.name = contactFields.name
    if ((contactFields.email || "") !== (origContact.email || ""))
        contactChanges.email = contactFields.email
    if ((contactFields.department || "") !== (origContact.department || ""))
        contactChanges.department = contactFields.department
    if ((contactFields.remarks || "") !== (origContact.remarks || ""))
        contactChanges.remarks = contactFields.remarks
    if (contactFields.phoneNumber !== origContact.phoneNumber) {
        contactChanges.phone = buildPhone(
            contactFields.phoneCountryCode,
            contactFields.phoneNumber,
            contactFields.phoneExtension,
        )
    }
    if (Object.keys(contactChanges).length > 0) {
        payload.contact = contactChanges
    }

    // ── Lead-level changes (at root) ──
    if (contactFields.status !== origContact.status)
        payload.status = contactFields.status
    if ((contactFields.source || "") !== (origContact.source || ""))
        payload.source = contactFields.source
    if (
        formatDate(contactFields.followUp) !==
        formatDate(origContact.followUp)
    ) {
        payload.followUp = formatDate(contactFields.followUp)
    }
    if (contactFields.priority !== origContact.priority)
        payload.priority = contactFields.priority

    // Beneficiary comparison
    const origBen = origContact.beneficiary || {}
    if (
        JSON.stringify(beneficiary) !== JSON.stringify(origBen)
    ) {
        payload.benificiary = buildBeneficiary(beneficiary)
    }

    return payload
}

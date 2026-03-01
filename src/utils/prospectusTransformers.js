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
    const fields = ["door", "street", "area", "city", "pincode", "shortAddress"]
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
            // Sort by priority to find primary contact
            const sorted = [...prospectuses].sort(
                (a, b) => (a.priority || 99) - (b.priority || 99),
            )
            const firstProp = sorted[0]

            flattened.push({
                _id: firstProp._id || company._id,
                companyId: company._id,
                company,
                // Merge contact data with prospectus-level fields for easy access
                contact: firstProp.contact || null,
                status: firstProp.status,
                source: firstProp.source,
                followUp: firstProp.followUp,
                priority: firstProp.priority,
                benificiary: firstProp.benificiary,
                convertedToLead: firstProp.convertedToLead,
                createdBy: firstProp.createdBy,
                createdAt: firstProp.createdAt || company.createdAt,
                prospectIndex: 0,
                isCompanyOnly: !firstProp.contact,
                prospectusesCount: prospectuses.length,
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
                prospectusesCount: 0,
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
    let allContacts = []

    // 1. Extract root prospectus
    let rootProp = null
    if (data.contact) {
        rootProp = { ...data, contact: data.contact }
    } else if (data.name) {
        rootProp = {
            ...data,
            contact: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                department: data.department,
                remarks: data.remarks,
            },
        }
    }

    if (rootProp) {
        allContacts.push(rootProp)
    } else if (data.prospectuses && data.prospectuses.length > 0) {
        allContacts = [...data.prospectuses]
    }

    // 2. Extract nested prospectuses
    if (company.prospectuses && company.prospectuses.length > 0) {
        company.prospectuses.forEach((p) => {
            if (!allContacts.some((c) => c._id === p._id)) {
                allContacts.push(p)
            }
        })
    }

    // Sort array identically to detail view
    allContacts.sort((a, b) => (a.priority || 99) - (b.priority || 99))

    // Fallback if completely empty
    if (allContacts.length === 0) {
        allContacts = [{ contact: {}, priority: 0, status: "new" }]
    }

    const companyPhone = normalizePhone(company.phone)

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
        contacts: allContacts.map((c) => {
            const contactPhone = normalizePhone(c.contact?.phone)
            const benPhone = normalizePhone(c.benificiary?.phone)
            return {
                _id: c._id,
                name: c.contact?.name || "",
                email: c.contact?.email || "",
                ...contactPhone,
                department: c.contact?.department || "",
                remarks: c.contact?.remarks || "",
                status: c.status || "new",
                source: c.source || "",
                followUp: c.followUp ? new Date(c.followUp) : undefined,
                priority: c.priority ?? 0,
                beneficiary: {
                    name: c.benificiary?.name || "",
                    ...benPhone,
                },
            }
        }),
    }
}

// ─── Payload builders ────────────────────────────────────────

/**
 * Transforms form data to API payload for CREATE.
 *
 * Output shape: { company: {...}, prospectuses: [{ name, email, phone, department, remarks, status, source, ... }] }
 */
export const transformProspectusPayload = (formData) => {
    const { companyDetails, contacts = [] } = formData

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

    // Build prospectuses array from form contacts
    if (contacts.length > 0) {
        payload.prospectuses = contacts.map((contactField) =>
            cleanObject({
                name: contactField.name || undefined,
                phone: buildPhone(
                    contactField.phoneCountryCode,
                    contactField.phoneNumber,
                    contactField.phoneExtension,
                ),
                email: contactField.email || undefined,
                department: contactField.department || undefined,
                remarks: contactField.remarks || undefined,
                status: contactField.status || "new",
                source: contactField.source || undefined,
                followUp: formatDate(contactField.followUp),
                priority: contactField.priority ?? 0,
                benificiary: buildBeneficiary(contactField.beneficiary),
            }),
        )
    }

    return payload
}

/**
 * Transforms form data for UPDATE (PATCH).
 * Contact fields are flat at root level, same as CREATE.
 *
 * PATCH payload: { company, name, phone, email, department, remarks, status, source, ... }
 */
export const transformProspectusUpdatePayload = (
    formData,
    originalData,
    editableContactIndex = null,
) => {
    const payload = {}
    const { companyDetails, contacts = [] } = formData
    const origCompany = originalData?.companyDetails || {}

    // Determine which contact is actively being edited
    const contactIndex =
        editableContactIndex !== null ? editableContactIndex : 0
    const activeContact = contacts[contactIndex] || {}
    const origContact = originalData?.contacts?.[contactIndex] || {}

    // ── Company changes ──
    const companyChanges = {}
    if (companyDetails.name !== origCompany.name) {
        companyChanges.name = companyDetails.name?.trim() || undefined
    }
    if (companyDetails.phoneNumber !== origCompany.phoneNumber) {
        companyChanges.phone = buildPhone(
            companyDetails.phoneCountryCode,
            companyDetails.phoneNumber,
            companyDetails.phoneExtension,
        )
    }
    if ((companyDetails.email || "") !== (origCompany.email || "")) {
        companyChanges.email = companyDetails.email?.trim() || undefined
    }
    if ((companyDetails.website || "") !== (origCompany.website || "")) {
        companyChanges.website = companyDetails.website?.trim() || undefined
    }
    if (
        (companyDetails.socialProfile || "") !==
        (origCompany.socialProfile || "")
    ) {
        companyChanges.socialProfile =
            companyDetails.socialProfile?.trim() || undefined
    }
    if (
        (companyDetails.serviceType || "") !== (origCompany.serviceType || "")
    ) {
        companyChanges.serviceType =
            companyDetails.serviceType?.trim() || undefined
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

    // ── Active Contact level fields ──
    if ((activeContact.name || "") !== (origContact.name || "")) {
        payload.name = activeContact.name?.trim() || undefined
    }
    if ((activeContact.email || "") !== (origContact.email || "")) {
        payload.email = activeContact.email?.trim() || undefined
    }
    if ((activeContact.department || "") !== (origContact.department || "")) {
        payload.department = activeContact.department?.trim() || undefined
    }
    if ((activeContact.remarks || "") !== (origContact.remarks || "")) {
        payload.remarks = activeContact.remarks?.trim() || undefined
    }
    if (activeContact.phoneNumber !== origContact.phoneNumber) {
        payload.phone = buildPhone(
            activeContact.phoneCountryCode,
            activeContact.phoneNumber,
            activeContact.phoneExtension,
        )
    }

    // ── Prospectus-level metadata changes ──
    if (activeContact.status !== origContact.status) {
        payload.status = activeContact.status || "new"
    }
    if ((activeContact.source || "") !== (origContact.source || "")) {
        payload.source = activeContact.source?.trim() || undefined
    }
    if (
        formatDate(activeContact.followUp) !== formatDate(origContact.followUp)
    ) {
        payload.followUp = formatDate(activeContact.followUp)
    }

    // Send priority if changed or if this is the only element updating priority structure
    if (
        activeContact.priority !== origContact.priority ||
        contacts.length > 1
    ) {
        payload.priority = activeContact.priority || contactIndex + 1
    }

    // Beneficiary comparison
    const origBen = origContact.beneficiary || {}
    if (JSON.stringify(activeContact.beneficiary) !== JSON.stringify(origBen)) {
        payload.benificiary = buildBeneficiary(activeContact.beneficiary)
    }

    // ── Handle new contacts added during edit ──
    const newContacts =
        contacts?.filter((ct) => !ct._id && ct.name?.trim()) || []
    if (newContacts.length > 0) {
        payload.prospectuses = newContacts.map((ct, idx) => {
            return cleanObject({
                name: ct.name?.trim() || undefined,
                phone: buildPhone(
                    ct.phoneCountryCode,
                    ct.phoneNumber,
                    ct.phoneExtension,
                ),
                email: ct.email?.trim() || undefined,
                department: ct.department?.trim() || undefined,
                remarks: ct.remarks?.trim() || undefined,
                status: ct.status || "new",
                source: ct.source?.trim() || undefined,
                followUp: formatDate(ct.followUp),
                priority: ct.priority || contacts.length + idx + 1,
                benificiary: buildBeneficiary(ct.beneficiary),
            })
        })
    }

    return payload
}

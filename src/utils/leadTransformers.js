/**
 * Lead data transformation utilities.
 * Transforms between form data and API payload formats.
 *
 * API Structure:
 * - company: { name, phone, website, socialProfile }
 * - leads: [{ name, phone, email, status, source, followUp, priority }]
 */
import { format } from "date-fns"

/**
 * Builds phone object if data exists
 */
const buildPhone = (extension, number) => {
    if (!number?.trim()) return undefined
    return {
        extension: extension?.trim() || "",
        number: number.trim(),
    }
}

/**
 * Formats date to ISO string
 */
const formatDate = (date) => {
    if (!date) return undefined
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return undefined
    return format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
}

/**
 * Removes undefined/null/empty values from object
 */
const cleanObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj
    if (Array.isArray(obj)) return obj.map(cleanObject).filter(Boolean)

    const cleaned = {}
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
        ) {
            const nested = cleanObject(value)
            if (nested && Object.keys(nested).length > 0) {
                cleaned[key] = nested
            }
        } else if (Array.isArray(value) && value.length > 0) {
            cleaned[key] = value
        } else if (typeof value !== "object") {
            cleaned[key] = value
        }
    })
    return cleaned
}

/**
 * Transforms form data to API payload for creating a lead
 * Each lead (contact person) has its own status, source, followUp
 * Priority is only included when there are multiple leads (1-based)
 *
 * API Structure:
 * - company: { name, phone, website, socialProfile }
 * - leads: [{ name, phone, email, status, source, followUp, priority? }]
 */
export const transformLeadPayload = (formData, ownerId) => {
    const { companyDetails, contacts } = formData

    const payload = {
        company: {
            name: companyDetails.name.trim(),
            email: companyDetails.email?.trim() || undefined,
            website: companyDetails.website?.trim() || undefined,
            socialProfile: companyDetails.socialProfile?.trim() || undefined,
            phone: buildPhone(
                companyDetails.phoneExtension,
                companyDetails.phoneNumber,
            ),
            serviceType: companyDetails.serviceType?.trim() || undefined,
        },
        leads: [],
        owner: ownerId,
    }

    // Only include priority when there are multiple contacts
    const includesPriority = contacts?.length > 1

    if (contacts?.length > 0) {
        contacts.forEach((contact, index) => {
            if (!contact.name?.trim()) return

            const leadData = {
                name: contact.name.trim(),
                email: contact.email?.trim() || undefined,
                phone: buildPhone(contact.phoneExtension, contact.phoneNumber),
                status: contact.status || "new",
                droppedReason: contact.droppedReason || undefined,
                source: contact.source?.trim() || undefined,
                followUp: formatDate(contact.followUp),
            }

            // Add priority only when there are multiple leads (1-based)
            if (includesPriority) {
                leadData.priority = contact.priority || index + 1
            }

            payload.leads.push(leadData)
        })
    }

    return cleanObject(payload)
}

/**
 * Transforms form data for updating a lead.
 * Sends the edited contact's data to the backend.
 * The lead ID is passed in the URL, so we just need to send the data.
 *
 * @param {Object} formData - Form data from the lead form
 * @param {number|null} editableContactIndex - Index of the contact being edited in the form
 */
export const transformLeadUpdatePayload = (
    formData,
    editableContactIndex = null,
) => {
    const { companyDetails, contacts } = formData

    const payload = {
        company: {
            name: companyDetails?.name?.trim() || undefined,
            email: companyDetails?.email?.trim() || undefined,
            website: companyDetails?.website?.trim() || undefined,
            socialProfile: companyDetails?.socialProfile?.trim() || undefined,
            phone: buildPhone(
                companyDetails?.phoneExtension,
                companyDetails?.phoneNumber,
            ),
            serviceType: companyDetails?.serviceType?.trim() || undefined,
        },
    }

    // 1. Handle the primary contact being edited (sent at root level)
    const contactIndex =
        editableContactIndex !== null ? editableContactIndex : 0
    const contact = contacts?.[contactIndex]

    if (contact) {
        payload.name = contact.name?.trim() || undefined
        payload.email = contact.email?.trim() || undefined
        payload.phone = buildPhone(contact.phoneExtension, contact.phoneNumber)
        payload.status = contact.status || "new"
        payload.droppedReason = contact.droppedReason || undefined
        payload.source = contact.source?.trim() || undefined
        payload.followUp = formatDate(contact.followUp)

        if (contacts.length > 1) {
            payload.priority = contact.priority || contactIndex + 1
        }
    }

    // 2. Handle new contacts (those without _id)
    const newContacts =
        contacts?.filter((c, idx) => !c._id && c.name?.trim()) || []

    if (newContacts.length > 0) {
        payload.leads = newContacts.map((c, idx) => ({
            name: c.name.trim(),
            email: c.email?.trim() || undefined,
            phone: buildPhone(c.phoneExtension, c.phoneNumber),
            status: c.status || "new",
            droppedReason: c.droppedReason || undefined,
            source: c.source?.trim() || undefined,
            followUp: formatDate(c.followUp),
            priority: c.priority || contacts.length + idx + 1,
        }))
    }

    return cleanObject(payload)
}

/**
 * Transforms API response to form-compatible data
 */
export const transformApiToFormData = (apiData) => {
    if (!apiData) return null

    const company = typeof apiData.company === "object" ? apiData.company : {}
    const contact = typeof apiData.contact === "object" ? apiData.contact : {}

    return {
        company: company.name || apiData.company || "",
        companyEmail: company.email || "",
        companyPhoneExtension: company.phone?.extension || "",
        companyPhoneNumber: company.phone?.number || "",
        website: company.website || apiData.website || "",
        socialProfile: company.socialProfile || apiData.socialProfile || "",
        contact: contact.name || apiData.contact || "",
        email: contact.email || apiData.email || "",
        phoneExtension:
            contact.phone?.extension || apiData.phone?.extension || "",
        phoneNumber: contact.phone?.number || apiData.phone?.number || "",
        status: apiData.status || "new",
        source: apiData.source || "",
        followUp: apiData.followUp || null,
    }
}

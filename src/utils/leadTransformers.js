/**
 * Lead data transformation utilities.
 * Transforms between form data and API payload formats.
 * Aligned with backend schema structure.
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
 * Removes undefined/null/empty values from object
 */
const cleanObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj
    if (Array.isArray(obj)) return obj.map(cleanObject).filter(Boolean)

    const cleaned = {}
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
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
 */
export const transformLeadPayload = (formData, ownerId) => {
    const { companyDetails, contacts } = formData

    const payload = {
        company: {
            name: companyDetails.name.trim(),
            email: companyDetails.email?.trim() || undefined,
            website: companyDetails.website?.trim() || undefined,
            socialProfile: companyDetails.socialProfile?.trim() || undefined,
            phone: buildPhone(companyDetails.phoneExtension, companyDetails.phoneNumber),
        },
        contacts: [],
        status: "new",
        owner: ownerId,
    }

    if (contacts?.length > 0) {
        contacts.forEach((contact, index) => {
            if (!contact.name?.trim()) return

            const contactData = {
                name: contact.name.trim(),
                email: contact.email?.trim() || undefined,
                phone: buildPhone(contact.phoneExtension, contact.phoneNumber),
            }

            payload.contacts.push(contactData)

            if (index === 0) {
                if (contact.status) payload.status = contact.status
                if (contact.source?.trim()) payload.source = contact.source.trim()
                if (contact.followUp) {
                    payload.followUp = format(contact.followUp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                }
            }
        })
    }

    return cleanObject(payload)
}

/**
 * Transforms form data for updating a lead
 */
export const transformLeadUpdatePayload = (formData) => {
    const { companyDetails, contacts } = formData
    const contact = contacts?.[0]

    const payload = {
        company: {
            name: companyDetails.name.trim(),
            email: companyDetails.email?.trim() || undefined,
            website: companyDetails.website?.trim() || undefined,
            socialProfile: companyDetails.socialProfile?.trim() || undefined,
            phone: buildPhone(companyDetails.phoneExtension, companyDetails.phoneNumber),
        },
        status: contact?.status || "new",
    }

    if (contact?.name?.trim()) {
        payload.contact = {
            name: contact.name.trim(),
            email: contact.email?.trim() || undefined,
            phone: buildPhone(contact.phoneExtension, contact.phoneNumber),
        }

        if (contact.source?.trim()) payload.source = contact.source.trim()
        if (contact.followUp) {
            payload.followUp = format(contact.followUp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        }
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
        phoneExtension: contact.phone?.extension || apiData.phone?.extension || "",
        phoneNumber: contact.phone?.number || apiData.phone?.number || "",
        status: apiData.status || "new",
        source: apiData.source || "",
        followUp: apiData.followUp || null,
    }
}

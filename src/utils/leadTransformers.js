/**
 * Lead data transformation utilities.
 * Transforms between form data and API payload formats.
 *
 * API Structure:
 * - company: { name, phone, website, socialProfile }
 * - contacts: [{ name, phone, email, status, source, followUp }]
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
 * Each contact has its own status, source, and followUp
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
        },
        contacts: [],
        owner: ownerId,
    }

    if (contacts?.length > 0) {
        contacts.forEach((contact) => {
            if (!contact.name?.trim()) return

            const contactData = {
                name: contact.name.trim(),
                email: contact.email?.trim() || undefined,
                phone: buildPhone(contact.phoneExtension, contact.phoneNumber),
                status: contact.status || "new",
                source: contact.source?.trim() || undefined,
                followUp: formatDate(contact.followUp),
            }

            payload.contacts.push(contactData)
        })
    }

    return cleanObject(payload)
}

/**
 * Transforms form data for updating a lead.
 * Sends all changed form data to the backend.
 */
export const transformLeadUpdatePayload = (formData) => {
    const { companyDetails, contacts } = formData
    const contact = contacts?.[0]

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
        },
        contact: contact
            ? {
                  name: contact.name?.trim() || undefined,
                  email: contact.email?.trim() || undefined,
                  phone: buildPhone(
                      contact.phoneExtension,
                      contact.phoneNumber,
                  ),
              }
            : undefined,
        status: contact?.status || "new",
        source: contact?.source?.trim() || undefined,
        followUp: formatDate(contact?.followUp),
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

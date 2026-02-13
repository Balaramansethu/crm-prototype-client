/**
 * Lead data transformation utilities.
 * Transforms between form data and API payload formats.
 *
 * API Structure:
 * - company: { name, phone: { countryCode, number, extension }, address, email, website, socialProfile, serviceType }
 * - leads: [{ name, phone, email, status, source, followUp, priority, department, remarks }]
 * - benificiary: { name, phone: { countryCode, number, extension } }
 */
import { format } from "date-fns"

/**
 * Builds phone object if data exists.
 * Now includes countryCode field for the new API structure.
 */
const buildPhone = (countryCode, extension, number) => {
    if (!number?.trim()) return undefined
    // Strip spaces/dashes/parens/plus from number before sending to API
    const cleanNumber = number.replace(/[\s\-\(\)\+]/g, "")
    // If number became empty after cleaning (e.g. only symbols), treat as empty
    if (!cleanNumber) return undefined

    return {
        countryCode: countryCode?.trim() || undefined,
        extension: extension?.trim() || "",
        number: cleanNumber,
    }
}

/**
 * Builds address object from form data.
 * Only includes fields that have values.
 */
const buildAddress = (address) => {
    if (!address) return undefined

    const result = {}

    if (address.door?.trim()) result.door = address.door.trim()
    if (address.street?.trim()) result.street = address.street.trim()
    if (address.area?.trim()) result.area = address.area.trim()
    if (address.city?.trim()) result.city = address.city.trim()
    if (address.pincode?.trim()) result.pincode = address.pincode.trim()
    if (address.shortAddress?.trim())
        result.shortAddress = address.shortAddress.trim()

    // Build location sub-object
    const lat = address.latitude !== "" && address.latitude != null
        ? Number(address.latitude)
        : undefined
    const lng = address.longitude !== "" && address.longitude != null
        ? Number(address.longitude)
        : undefined

    if (lat !== undefined || lng !== undefined) {
        result.location = {}
        if (lat !== undefined) result.location.latitude = lat
        if (lng !== undefined) result.location.longitude = lng
    }

    return Object.keys(result).length > 0 ? result : undefined
}

/**
 * Builds beneficiary object from form data.
 * Note: API uses "benificiary" (their spelling)
 */
const buildBeneficiary = (beneficiary) => {
    if (!beneficiary) return undefined

    const name = beneficiary.name?.trim()
    const phone = buildPhone(
        beneficiary.phoneCountryCode,
        beneficiary.phoneExtension,
        beneficiary.phoneNumber,
    )

    if (!name && !phone) return undefined

    const result = {}
    if (name) result.name = name
    if (phone) result.phone = phone

    return result
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
 * Transforms form data to API payload for creating a lead.
 * Each lead (contact person) has its own status, source, followUp.
 * Priority is only included when there are multiple leads (1-based).
 *
 * API Structure:
 * - company: { name, phone, address, email, website, socialProfile, serviceType }
 * - leads: [{ name, phone, email, status, source, followUp, priority?, department?, remarks? }]
 * - benificiary: { name, phone }
 */
export const transformLeadPayload = (formData, ownerId) => {
    const { companyDetails, contacts, beneficiary } = formData

    // Build beneficiary once (API uses "benificiary" spelling)
    const benificiary = buildBeneficiary(beneficiary)

    const payload = {
        company: {
            name: companyDetails.name.trim(),
            email: companyDetails.email?.trim() || undefined,
            website: companyDetails.website?.trim() || undefined,
            socialProfile: companyDetails.socialProfile?.trim() || undefined,
            phone: buildPhone(
                companyDetails.phoneCountryCode,
                companyDetails.phoneExtension,
                companyDetails.phoneNumber,
            ),
            serviceType: companyDetails.serviceType?.trim() || undefined,
            address: buildAddress(companyDetails.address),
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
                phone: buildPhone(
                    contact.phoneCountryCode,
                    contact.phoneExtension,
                    contact.phoneNumber,
                ),
                status: contact.status || "new",
                droppedReason: contact.droppedReason || undefined,
                source: contact.source?.trim() || undefined,
                followUp: formatDate(contact.followUp),
                department: contact.department?.trim() || undefined,
                remarks: contact.remarks?.trim() || undefined,
            }

            // Attach beneficiary to the first contact/lead only
            if (index === 0 && benificiary) {
                leadData.benificiary = benificiary
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
    const { companyDetails, contacts, beneficiary } = formData

    const payload = {
        company: {
            name: companyDetails?.name?.trim() || undefined,
            email: companyDetails?.email?.trim() || undefined,
            website: companyDetails?.website?.trim() || undefined,
            socialProfile: companyDetails?.socialProfile?.trim() || undefined,
            phone: buildPhone(
                companyDetails?.phoneCountryCode,
                companyDetails?.phoneExtension,
                companyDetails?.phoneNumber,
            ),
            serviceType: companyDetails?.serviceType?.trim() || undefined,
            address: buildAddress(companyDetails?.address),
        },
    }

    // Add beneficiary if present (API uses "benificiary" spelling)
    const benificiary = buildBeneficiary(beneficiary)
    if (benificiary) {
        payload.benificiary = benificiary
    }

    // 1. Handle the primary contact being edited (sent at root level)
    const contactIndex =
        editableContactIndex !== null ? editableContactIndex : 0
    const contact = contacts?.[contactIndex]

    if (contact) {
        payload.name = contact.name?.trim() || undefined
        payload.email = contact.email?.trim() || undefined
        payload.phone = buildPhone(
            contact.phoneCountryCode,
            contact.phoneExtension,
            contact.phoneNumber,
        )
        payload.status = contact.status || "new"
        payload.droppedReason = contact.droppedReason || undefined
        payload.source = contact.source?.trim() || undefined
        payload.followUp = formatDate(contact.followUp)
        payload.department = contact.department?.trim() || undefined
        payload.remarks = contact.remarks?.trim() || undefined

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
            phone: buildPhone(c.phoneCountryCode, c.phoneExtension, c.phoneNumber),
            status: c.status || "new",
            droppedReason: c.droppedReason || undefined,
            source: c.source?.trim() || undefined,
            followUp: formatDate(c.followUp),
            department: c.department?.trim() || undefined,
            remarks: c.remarks?.trim() || undefined,
            priority: c.priority || contacts.length + idx + 1,
        }))
    }

    return cleanObject(payload)
}

/**
 * Transforms API response to form-compatible data.
 * Handles backward compatibility for old records.
 */
export const transformApiToFormData = (apiData) => {
    if (!apiData) return null

    const company = typeof apiData.company === "object" ? apiData.company : {}
    const contact = typeof apiData.contact === "object" ? apiData.contact : {}

    return {
        company: company.name || apiData.company || "",
        companyEmail: company.email || "",
        companyPhoneCountryCode: company.phone?.countryCode || "+966",
        companyPhoneExtension: company.phone?.extension || "",
        companyPhoneNumber: company.phone?.number || "",
        website: company.website || apiData.website || "",
        socialProfile: company.socialProfile || apiData.socialProfile || "",
        contact: contact.name || apiData.contact || "",
        email: contact.email || apiData.email || "",
        phoneCountryCode:
            contact.phone?.countryCode || apiData.phone?.countryCode || "+966",
        phoneExtension:
            contact.phone?.extension || apiData.phone?.extension || "",
        phoneNumber: contact.phone?.number || apiData.phone?.number || "",
        department: contact.department || apiData.department || "",
        remarks: contact.remarks || apiData.remarks || "",
        status: apiData.status || "new",
        source: apiData.source || "",
        followUp: apiData.followUp || null,
    }
}

/**
 * Formats a phone object for display.
 * Format: +966 123456789 x101
 *
 * @param {Object} phone - Phone object { countryCode, number, extension }
 * @returns {string} Formatted phone string
 */
export const formatPhoneDisplay = (phone) => {
    if (!phone?.number) return "-"
    const parts = []

    // Use countryCode if present, or if extension looks like countryCode and countryCode is missing (legacy migration)
    let code = phone.countryCode
    let ext = phone.extension

    if (!code && ext?.startsWith("+")) {
        code = ext
        ext = ""
    }

    if (code) parts.push(code)
    parts.push(phone.number)

    if (ext && ext !== code) parts.push(`x${ext}`)

    return parts.join(" ")
}

/**
 * Normalizes a lead payload from the API.
 * Ensures all nested fields exist with safe defaults for rendering.
 *
 * @param {Object} lead - Raw lead data from API
 * @returns {Object} Normalized lead data
 */
export const normalizeLeadData = (lead) => {
    if (!lead) return null

    return {
        ...lead,
        phone: {
            countryCode: lead.phone?.countryCode || "",
            number: lead.phone?.number || "",
            extension: lead.phone?.extension || "",
        },
        department: lead.department || "",
        remarks: lead.remarks || "",
        company: lead.company
            ? {
                  ...lead.company,
                  phone: {
                      countryCode: lead.company?.phone?.countryCode || "",
                      number: lead.company?.phone?.number || "",
                      extension: lead.company?.phone?.extension || "",
                  },
                  address: {
                      door: lead.company?.address?.door || "",
                      street: lead.company?.address?.street || "",
                      area: lead.company?.address?.area || "",
                      city: lead.company?.address?.city || "",
                      pincode: lead.company?.address?.pincode || "",
                      shortAddress: lead.company?.address?.shortAddress || "",
                      location: {
                          latitude:
                              lead.company?.address?.location?.latitude ?? "",
                          longitude:
                              lead.company?.address?.location?.longitude ?? "",
                      },
                  },
              }
            : lead.company,
        benificiary: lead.benificiary
            ? {
                  name: lead.benificiary?.name || "",
                  phone: {
                      countryCode:
                          lead.benificiary?.phone?.countryCode || "",
                      number: lead.benificiary?.phone?.number || "",
                      extension: lead.benificiary?.phone?.extension || "",
                  },
              }
            : undefined,
    }
}

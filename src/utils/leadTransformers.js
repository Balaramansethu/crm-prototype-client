/**
 * Lead data transformation utilities.
 * Transforms between form data and API payload formats.
 *
 * API Structure:
 * - company: { name, phone, address, email, website, socialProfile, serviceType }
 * - leads: [{ contact: { name, phone, email, department, remarks }, status, source, followUp, priority, benificiary }]
 */
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
        extension: extension?.trim() || undefined,
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
    const lat =
        address.latitude !== "" && address.latitude != null
            ? Number(address.latitude)
            : undefined
    const lng =
        address.longitude !== "" && address.longitude != null
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
    return dateObj.toISOString()
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
 * Each lead has a `contact` object and lead-level fields.
 *
 * API Structure:
 * - company: { name, phone, address, email, website, socialProfile, serviceType }
 * - leads: [{ contact: { name, phone, email, department, remarks }, status, source, followUp, priority?, benificiary }]
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
        contacts.forEach((c, index) => {
            if (!c.name?.trim()) return

            const benificiary = buildBeneficiary(c.beneficiary)

            const leadData = {
                contact: {
                    name: c.name.trim(),
                    email: c.email?.trim() || undefined,
                    phone: buildPhone(
                        c.phoneCountryCode,
                        c.phoneExtension,
                        c.phoneNumber,
                    ),
                    department: c.department?.trim() || undefined,
                    remarks: c.remarks?.trim() || undefined,
                },
                status: c.status || "new",
                droppedReason: c.droppedReason || undefined,
                source: c.source?.trim() || undefined,
                followUp: formatDate(c.followUp),
            }

            if (benificiary) {
                leadData.benificiary = benificiary
            }

            if (includesPriority) {
                leadData.priority = c.priority || index + 1
            }

            payload.leads.push(leadData)
        })
    }

    return cleanObject(payload)
}

/**
 * Transforms form data for updating a lead.
 * Contact fields go inside a `contact` object; lead-level fields at root.
 *
 * PATCH payload: { company, contact: { name, phone, ... }, status, source, ... }
 * New contacts via leads array: { leads: [{ contact: {...}, status, ... }] }
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
                companyDetails?.phoneCountryCode,
                companyDetails?.phoneExtension,
                companyDetails?.phoneNumber,
            ),
            serviceType: companyDetails?.serviceType?.trim() || undefined,
            address: buildAddress(companyDetails?.address),
        },
    }

    // 1. Handle the primary contact being edited
    const contactIndex =
        editableContactIndex !== null ? editableContactIndex : 0
    const c = contacts?.[contactIndex]

    if (c) {
        // Contact-level fields nested inside `contact` object
        payload.contact = {
            name: c.name?.trim() || undefined,
            email: c.email?.trim() || undefined,
            phone: buildPhone(
                c.phoneCountryCode,
                c.phoneExtension,
                c.phoneNumber,
            ),
            department: c.department?.trim() || undefined,
            remarks: c.remarks?.trim() || undefined,
        }

        // Lead-level fields at root
        payload.status = c.status || "new"
        payload.droppedReason = c.droppedReason || undefined
        payload.source = c.source?.trim() || undefined
        payload.followUp = formatDate(c.followUp)

        const benificiary = buildBeneficiary(c.beneficiary)
        if (benificiary) {
            payload.benificiary = benificiary
        }

        if (contacts.length > 1) {
            payload.priority = c.priority || contactIndex + 1
        }
    }

    // 2. Handle new contacts (those without _id)
    const newContacts =
        contacts?.filter((ct) => !ct._id && ct.name?.trim()) || []

    if (newContacts.length > 0) {
        payload.leads = newContacts.map((ct, idx) => {
            const benificiary = buildBeneficiary(ct.beneficiary)
            const leadData = {
                contact: {
                    name: ct.name.trim(),
                    email: ct.email?.trim() || undefined,
                    phone: buildPhone(
                        ct.phoneCountryCode,
                        ct.phoneExtension,
                        ct.phoneNumber,
                    ),
                    department: ct.department?.trim() || undefined,
                    remarks: ct.remarks?.trim() || undefined,
                },
                status: ct.status || "new",
                droppedReason: ct.droppedReason || undefined,
                source: ct.source?.trim() || undefined,
                followUp: formatDate(ct.followUp),
                priority: ct.priority || contacts.length + idx + 1,
            }

            if (benificiary) {
                leadData.benificiary = benificiary
            }

            return leadData
        })
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

    if (ext && ext !== code) parts.push(ext)

    return parts.join(" - ")
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

    const contact = lead.contact || {}

    return {
        ...lead,
        contact: {
            ...contact,
            phone: {
                countryCode: contact.phone?.countryCode || "",
                number: contact.phone?.number || "",
                extension: contact.phone?.extension || "",
            },
            department: contact.department || "",
            remarks: contact.remarks || "",
        },
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
                      countryCode: lead.benificiary?.phone?.countryCode || "",
                      number: lead.benificiary?.phone?.number || "",
                      extension: lead.benificiary?.phone?.extension || "",
                  },
              }
            : undefined,
    }
}

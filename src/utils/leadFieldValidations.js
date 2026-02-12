/**
 * Lead form validation utilities.
 *
 * Required fields (Company Details only):
 * - Company name (2-100 chars)
 * - Company phone number (8-15 digits)
 *
 * Contact Persons section has NO required fields.
 */
import {
    FIELD_LIMITS,
    validateLength,
    validateEmail,
    validatePhoneNumber,
    validatePhoneExtension,
    validateStatus,
} from "@/constants/validationSchema"

/**
 * Validates company details from the form
 * Required: Company name, Company phone
 */
export function validateCompanyDetails(company, setError, t) {
    let hasErrors = false

    // Company name is REQUIRED
    if (!validateLength(company.name, FIELD_LIMITS.COMPANY_NAME)) {
        setError("companyDetails.name", {
            type: "manual",
            message: company.name?.trim()
                ? t("invalidFormat")
                : t("companyRequired"),
        })
        hasErrors = true
    }

    // Company phone is REQUIRED
    if (!company.phoneNumber?.trim()) {
        setError("companyDetails.phoneNumber", {
            type: "manual",
            message: t("phoneRequired"),
        })
        hasErrors = true
    }

    // Optional fields - only validate format if provided
    if (company.email?.trim() && !validateEmail(company.email)) {
        setError("companyDetails.email", {
            type: "manual",
            message: t("emailInvalid"),
        })
        hasErrors = true
    }

    // Service Type is REQUIRED
    if (!company.serviceType?.trim()) {
        setError("companyDetails.serviceType", {
            type: "manual",
            message: t("serviceTypeRequired") || "Service type is required",
        })
        hasErrors = true
    }

    if (
        company.phoneExtension?.trim() &&
        !validatePhoneExtension(company.phoneExtension)
    ) {
        setError("companyDetails.phoneExtension", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    // Website and socialProfile - no validation, accept any value

    return !hasErrors
}

/**
 * Validates a single contact from the form
 * NO required fields - all optional, only validate format if provided
 */
export function validateContact(contact, index, setError, t) {
    let hasErrors = false

    // Skip validation if contact has no data
    const hasAnyData =
        contact.name?.trim() ||
        contact.email?.trim() ||
        contact.phoneNumber?.trim()

    if (!hasAnyData) return true

    // All fields are optional - validate format only if provided
    if (
        contact.name?.trim() &&
        !validateLength(contact.name, FIELD_LIMITS.CONTACT_NAME)
    ) {
        setError(`contacts.${index}.name`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (contact.email?.trim() && !validateEmail(contact.email)) {
        setError(`contacts.${index}.email`, {
            type: "manual",
            message: t("emailInvalid"),
        })
        hasErrors = true
    }

    if (
        contact.phoneNumber?.trim() &&
        !validatePhoneNumber(contact.phoneNumber)
    )

    if (
        contact.phoneExtension?.trim() &&
        !validatePhoneExtension(contact.phoneExtension)
    ) {
        setError(`contacts.${index}.phoneExtension`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (
        contact.source?.trim() &&
        !validateLength(contact.source, FIELD_LIMITS.SOURCE)
    ) {
        setError(`contacts.${index}.source`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (contact.status && !validateStatus(contact.status)) {
        setError(`contacts.${index}.status`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    // Validate dropReason is required when status is 'dropped'
    if (contact.status === "dropped" && !contact.dropReason?.trim()) {
        setError(`contacts.${index}.dropReason`, {
            type: "manual",
            message: t("dropReasonRequired"),
        })
        hasErrors = true
    }

    return !hasErrors
}

/**
 * Validates entire lead form data
 */
export function validateLeadForm(data, setError, t) {
    const companyValid = validateCompanyDetails(
        data.companyDetails,
        setError,
        t,
    )

    let contactsValid = true
    data.contacts?.forEach((contact, index) => {
        if (!validateContact(contact, index, setError, t)) {
            contactsValid = false
        }
    })

    return companyValid && contactsValid
}

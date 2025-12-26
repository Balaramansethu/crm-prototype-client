/**
 * Lead form validation utilities.
 * Aligned with backend Mongoose schemas.
 */
import {
    FIELD_LIMITS,
    validateLength,
    validateEmail,
    validatePhoneNumber,
    validatePhoneExtension,
    validateUrl,
    validateStatus,
} from "@/constants/validationSchema"

/**
 * Validates company details from the form
 */
export function validateCompanyDetails(company, setError, t) {
    let hasErrors = false

    if (!validateLength(company.name, FIELD_LIMITS.COMPANY_NAME)) {
        setError("companyDetails.name", {
            type: "manual",
            message: company.name?.trim()
                ? t("invalidFormat")
                : t("companyRequired"),
        })
        hasErrors = true
    }

    if (company.email?.trim() && !validateEmail(company.email)) {
        setError("companyDetails.email", {
            type: "manual",
            message: t("emailInvalid"),
        })
        hasErrors = true
    }

    if (!validatePhoneNumber(company.phoneNumber)) {
        setError("companyDetails.phoneNumber", {
            type: "manual",
            message: t("phoneTooShort"),
        })
        hasErrors = true
    }

    if (!validatePhoneExtension(company.phoneExtension)) {
        setError("companyDetails.phoneExtension", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (!validateUrl(company.website)) {
        setError("companyDetails.website", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (!validateUrl(company.socialProfile)) {
        setError("companyDetails.socialProfile", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    return !hasErrors
}

/**
 * Validates a single contact from the form
 */
export function validateContact(contact, index, setError, t) {
    let hasErrors = false

    const hasAnyData =
        contact.name?.trim() ||
        contact.email?.trim() ||
        contact.phoneNumber?.trim()

    if (!hasAnyData) return true

    if (!validateLength(contact.name, FIELD_LIMITS.CONTACT_NAME)) {
        setError(`contacts.${index}.name`, {
            type: "manual",
            message: contact.name?.trim()
                ? t("invalidFormat")
                : t("contactRequired"),
        })
        hasErrors = true
    }

    if (!validateEmail(contact.email)) {
        setError(`contacts.${index}.email`, {
            type: "manual",
            message: contact.email?.trim()
                ? t("emailInvalid")
                : t("emailRequired"),
        })
        hasErrors = true
    }

    if (!validatePhoneNumber(contact.phoneNumber)) {
        setError(`contacts.${index}.phoneNumber`, {
            type: "manual",
            message: t("phoneTooShort"),
        })
        hasErrors = true
    }

    if (!validatePhoneExtension(contact.phoneExtension)) {
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

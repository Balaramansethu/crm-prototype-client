/**
 * Prospectus form validation.
 *
 * Required fields:
 * - Company name (2-100 chars)
 * - Company phone number (8-15 digits)
 *
 * Contact fields are all optional; format is validated when provided.
 */
import {
    FIELD_LIMITS,
    validateLength,
    validateEmail,
    validatePhoneNumber,
    validatePhoneExtension,
    validateCountryCode,
    validateCity,
    validatePincode,
    validateShortAddress,
    validateLatitude,
    validateLongitude,
} from "@/constants/validationSchema"

/**
 * Validates the company details section.
 */
const validateCompanyDetails = (company, setError, t) => {
    let isValid = true

    // Company name — required
    if (!company.name?.trim()) {
        setError("companyDetails.name", {
            type: "manual",
            message: t("companyRequired"),
        })
        isValid = false
    } else if (!validateLength(company.name, FIELD_LIMITS.COMPANY_NAME)) {
        setError("companyDetails.name", {
            type: "manual",
            message: t("companyRequired"),
        })
        isValid = false
    }

    // Company phone — required
    if (!company.phoneNumber?.trim()) {
        setError("companyDetails.phoneNumber", {
            type: "manual",
            message: t("phoneRequired"),
        })
        isValid = false
    } else if (!validatePhoneNumber(company.phoneNumber)) {
        setError("companyDetails.phoneNumber", {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    // Optional format checks
    if (
        company.phoneExtension &&
        !validatePhoneExtension(company.phoneExtension)
    ) {
        setError("companyDetails.phoneExtension", {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    if (company.email?.trim() && !validateEmail(company.email)) {
        setError("companyDetails.email", {
            type: "manual",
            message: t("emailInvalid"),
        })
        isValid = false
    }

    // Address validations
    const addr = company.address || {}
    if (addr.city && !validateCity(addr.city)) {
        setError("companyDetails.address.city", {
            type: "manual",
            message: t("cityInvalid"),
        })
        isValid = false
    }
    if (addr.pincode && !validatePincode(addr.pincode)) {
        setError("companyDetails.address.pincode", {
            type: "manual",
            message: t("pincodeInvalid"),
        })
        isValid = false
    }
    if (addr.shortAddress && !validateShortAddress(addr.shortAddress)) {
        setError("companyDetails.address.shortAddress", {
            type: "manual",
            message: t("shortAddressInvalid"),
        })
        isValid = false
    }
    if (addr.latitude && !validateLatitude(addr.latitude)) {
        setError("companyDetails.address.latitude", {
            type: "manual",
            message: t("latitudeInvalid"),
        })
        isValid = false
    }
    if (addr.longitude && !validateLongitude(addr.longitude)) {
        setError("companyDetails.address.longitude", {
            type: "manual",
            message: t("longitudeInvalid"),
        })
        isValid = false
    }

    return isValid
}

/**
 * Validates the contact (prospect) fields.
 * All optional — validate format only when provided.
 */
const validateContact = (data, setError, t, index) => {
    let isValid = true
    const prefix = `contacts.${index}.`

    if (
        data.name?.trim() &&
        !validateLength(data.name, FIELD_LIMITS.CONTACT_NAME)
    ) {
        setError(`${prefix}name`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    if (data.email?.trim() && !validateEmail(data.email)) {
        setError(`${prefix}email`, {
            type: "manual",
            message: t("emailInvalid"),
        })
        isValid = false
    }

    if (data.phoneNumber?.trim() && !validatePhoneNumber(data.phoneNumber)) {
        setError(`${prefix}phoneNumber`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    if (
        data.phoneExtension?.trim() &&
        !validatePhoneExtension(data.phoneExtension)
    ) {
        setError(`${prefix}phoneExtension`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    // Beneficiary validations
    const ben = data.beneficiary || {}
    if (ben.phoneNumber?.trim() && !validatePhoneNumber(ben.phoneNumber)) {
        setError(`${prefix}beneficiary.phoneNumber`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        isValid = false
    }

    return isValid
}

/**
 * Full form validation entry point.
 */
export const validateProspectusForm = (data, setError, t) => {
    const companyValid = validateCompanyDetails(
        data.companyDetails,
        setError,
        t,
    )

    let contactsValid = true
    if (data.contacts && Array.isArray(data.contacts)) {
        data.contacts.forEach((contact, index) => {
            if (!validateContact(contact, setError, t, index)) {
                contactsValid = false
            }
        })
    }

    return companyValid && contactsValid
}

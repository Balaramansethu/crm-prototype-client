/**
 * Lead form validation utilities.
 *
 * Required fields (Company Details only):
 * - Company name (2-100 chars)
 * - Company phone number (8-15 digits)
 *
 * Contact Persons section has NO required fields.
 * Address, beneficiary, department, remarks are all optional — validate format only if provided.
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

    // Country code validation (optional, validate format if provided)
    if (
        company.phoneCountryCode?.trim() &&
        !validateCountryCode(company.phoneCountryCode)
    ) {
        setError("companyDetails.phoneCountryCode", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    // Address validation (all optional, format-only)
    if (company.address) {
        if (
            company.address.city?.trim() &&
            !validateCity(company.address.city)
        ) {
            setError("companyDetails.address.city", {
                type: "manual",
                message: t("cityInvalid") || t("invalidFormat"),
            })
            hasErrors = true
        }

        if (
            company.address.pincode?.trim() &&
            !validatePincode(company.address.pincode)
        ) {
            setError("companyDetails.address.pincode", {
                type: "manual",
                message: t("pincodeInvalid") || t("invalidFormat"),
            })
            hasErrors = true
        }

        if (
            company.address.shortAddress?.trim() &&
            !validateShortAddress(company.address.shortAddress)
        ) {
            setError("companyDetails.address.shortAddress", {
                type: "manual",
                message: t("shortAddressInvalid") || t("invalidFormat"),
            })
            hasErrors = true
        }

        if (
            company.address.latitude !== "" &&
            company.address.latitude != null &&
            !validateLatitude(company.address.latitude)
        ) {
            setError("companyDetails.address.latitude", {
                type: "manual",
                message: t("latitudeInvalid") || t("invalidFormat"),
            })
            hasErrors = true
        }

        if (
            company.address.longitude !== "" &&
            company.address.longitude != null &&
            !validateLongitude(company.address.longitude)
        ) {
            setError("companyDetails.address.longitude", {
                type: "manual",
                message: t("longitudeInvalid") || t("invalidFormat"),
            })
            hasErrors = true
        }
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

    // Country code validation
    if (
        contact.phoneCountryCode?.trim() &&
        !validateCountryCode(contact.phoneCountryCode)
    ) {
        setError(`contacts.${index}.phoneCountryCode`, {
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

    // Department - optional, max 100 chars
    if (
        contact.department?.trim() &&
        !validateLength(contact.department, FIELD_LIMITS.DEPARTMENT)
    ) {
        setError(`contacts.${index}.department`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    // Remarks - optional, max 500 chars
    if (
        contact.remarks?.trim() &&
        !validateLength(contact.remarks, FIELD_LIMITS.REMARKS)
    ) {
        setError(`contacts.${index}.remarks`, {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    return !hasErrors
}

/**
 * Validates beneficiary section from the form
 * All fields optional, validate format only if provided
 */
export function validateBeneficiary(beneficiary, setError, t) {
    if (!beneficiary) return true
    let hasErrors = false

    const hasAnyData =
        beneficiary.name?.trim() || beneficiary.phoneNumber?.trim()

    if (!hasAnyData) return true

    if (
        beneficiary.name?.trim() &&
        !validateLength(beneficiary.name, FIELD_LIMITS.BENEFICIARY_NAME)
    ) {
        setError("beneficiary.name", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (
        beneficiary.phoneNumber?.trim() &&
        !validatePhoneNumber(beneficiary.phoneNumber)
    ) {
        setError("beneficiary.phoneNumber", {
            type: "manual",
            message: t("invalidFormat"),
        })
        hasErrors = true
    }

    if (
        beneficiary.phoneCountryCode?.trim() &&
        !validateCountryCode(beneficiary.phoneCountryCode)
    ) {
        setError("beneficiary.phoneCountryCode", {
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

    const beneficiaryValid = validateBeneficiary(data.beneficiary, setError, t)

    return companyValid && contactsValid && beneficiaryValid
}

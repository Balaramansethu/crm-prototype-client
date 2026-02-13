/**
 * Validation schema aligned with backend Mongoose models.
 * Reuses existing validation utilities.
 */

// Field length constraints from backend schemas
export const FIELD_LIMITS = {
    COMPANY_NAME: { min: 2, max: 100 },
    CONTACT_NAME: { min: 2, max: 50 },
    SOURCE: { min: 2, max: 50 },
    PHONE_NUMBER: { min: 8, max: 15 },
    PHONE_EXTENSION: { max: 10 },
    COUNTRY_CODE: { min: 2, max: 5 },
    BENEFICIARY_NAME: { min: 2, max: 50 },
    DEPARTMENT: { max: 100 },
    REMARKS: { max: 500 },
    PINCODE: { exact: 5 },
    SHORT_ADDRESS: { min: 8, max: 8 },
}

// Regex patterns from backend schemas
export const PATTERNS = {
    EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    PHONE_NUMBER: /^\d+$/,
    PHONE_EXTENSION: /^\d+$/,
    COUNTRY_CODE: /^\+\d+$/,
    CITY: /^[a-zA-Z\s]+$/,
    PINCODE: /^\d{5}$/,
    SHORT_ADDRESS: /^[A-Z]{4}\d{4}$/,
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
}

// Valid enum values from backend
// Valid enum values from backend
export const VALID_STATUS = [
    "new",
    "qualified",
    "contacted_by_email",
    "dropped",
    "interested",
    "not_interested",
    "follow_up_needed",
    "promoted_to_meeting",
    "conversion_in_progress",
]
export const VALID_OUTCOMES = [
    "interested",
    "not_interested",
    "follow_up_needed",
    "promoted_to_meeting",
    "conversion_in_progress",
]

// API Error codes
export const API_ERROR_CODES = {
    VALIDATION_ERROR: "1001",
    TOKEN_EXPIRED: "2003",
    CONFLICT: "4402",
    SERVER_ERROR: "5001",
}

/**
 * Validates string length against min/max limits
 */
export const validateLength = (value, limits) => {
    if (!value) return !limits.min
    const trimmed = value.trim()
    const meetsMin = !limits.min || trimmed.length >= limits.min
    const meetsMax = !limits.max || trimmed.length <= limits.max
    return meetsMin && meetsMax
}

/**
 * Validates email format using backend pattern
 */
export const validateEmail = (email) => {
    if (!email?.trim()) return false
    return PATTERNS.EMAIL.test(email.trim())
}

/**
 * Validates phone number (digits only, 8-15 chars)
 */
export const validatePhoneNumber = (phone) => {
    if (!phone?.trim()) return true
    const trimmed = phone.trim()
    // Sanitize to digits only for length check
    // Allow spaces, dashes, parens, plus in input
    const digits = trimmed.replace(/[\s\-\(\)\+]/g, "")
    // Check if result is distinct digits (guards against letters)
    if (!/^\d+$/.test(digits)) return false

    return (
        digits.length >= FIELD_LIMITS.PHONE_NUMBER.min &&
        digits.length <= FIELD_LIMITS.PHONE_NUMBER.max
    )
}

/**
 * Validates phone extension (+digits, max 10 chars)
 */
export const validatePhoneExtension = (ext) => {
    if (!ext?.trim()) return true
    const trimmed = ext.trim()
    return (
        PATTERNS.PHONE_EXTENSION.test(trimmed) &&
        trimmed.length <= FIELD_LIMITS.PHONE_EXTENSION.max
    )
}

/**
 * Validates country code (starts with +, digits, 2-5 chars)
 */
export const validateCountryCode = (code) => {
    if (!code?.trim()) return true
    const trimmed = code.trim()
    return (
        PATTERNS.COUNTRY_CODE.test(trimmed) &&
        trimmed.length >= FIELD_LIMITS.COUNTRY_CODE.min &&
        trimmed.length <= FIELD_LIMITS.COUNTRY_CODE.max
    )
}

/**
 * Validates city (letters and spaces only)
 */
export const validateCity = (city) => {
    if (!city?.trim()) return true
    return PATTERNS.CITY.test(city.trim())
}

/**
 * Validates pincode (exactly 5 digits)
 */
export const validatePincode = (pincode) => {
    if (!pincode?.trim()) return true
    return PATTERNS.PINCODE.test(pincode.trim())
}

/**
 * Validates short address (pattern: AAAA1234 — 4 uppercase letters + 4 digits)
 */
export const validateShortAddress = (addr) => {
    if (!addr?.trim()) return true
    return PATTERNS.SHORT_ADDRESS.test(addr.trim())
}

/**
 * Validates latitude (-90 to 90)
 */
export const validateLatitude = (lat) => {
    if (lat === null || lat === undefined || lat === "") return true
    const num = Number(lat)
    return !isNaN(num) && num >= -90 && num <= 90
}

/**
 * Validates longitude (-180 to 180)
 */
export const validateLongitude = (lng) => {
    if (lng === null || lng === undefined || lng === "") return true
    const num = Number(lng)
    return !isNaN(num) && num >= -180 && num <= 180
}

/**
 * Validates URL format
 */
export const validateUrl = (url) => {
    if (!url?.trim()) return true
    return PATTERNS.URL.test(url.trim())
}

/**
 * Validates status enum
 */
export const validateStatus = (status) => {
    return VALID_STATUS.includes(status)
}

/**
 * Validates outcome enum
 */
export const validateOutcome = (outcome) => {
    return VALID_OUTCOMES.includes(outcome)
}

/**
 * Creates React Hook Form error object
 */
export const createError = (message) => ({
    type: "manual",
    message,
})

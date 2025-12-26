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
    PHONE_EXTENSION: { max: 5 },
}

// Regex patterns from backend schemas
export const PATTERNS = {
    EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    PHONE_NUMBER: /^\d+$/,
    PHONE_EXTENSION: /^\+\d+$/,
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
}

// Valid enum values from backend
export const VALID_STATUS = ["new", "qualified", "contacted", "done"]
export const VALID_OUTCOMES = ["interested", "not_interested", "contacted", "done"]

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
    return (
        PATTERNS.PHONE_NUMBER.test(trimmed) &&
        trimmed.length >= FIELD_LIMITS.PHONE_NUMBER.min &&
        trimmed.length <= FIELD_LIMITS.PHONE_NUMBER.max
    )
}

/**
 * Validates phone extension (+digits, max 5 chars)
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

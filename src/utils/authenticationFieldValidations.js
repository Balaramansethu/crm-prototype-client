export const validateEmail = (email) => {
    if (!email) {
        return "*email is required"
    }

    email = email.trim()

    if (!email.includes("@")) {
        return "*Just @ is missing."
    }

    if (email.startsWith("@")) {
        return "*Email must contain characters before @"
    }

    if (email.endsWith("@")) {
        return "*Email must contain characters after @"
    }

    const [name, domain] = email.split("@")

    if (!name) {
        return "*Email must contain characters before @"
    }

    if (!domain) {
        return "*Email must contain characters after @"
    }

    if (!domain.includes(".")) {
        return "*Email domain must contain a dot (.)"
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailPattern.test(email)) {
        return "*Please enter a valid email address."
    }

    return ""
}

function validateRequiredLength(fieldName, value, min, max) {
    if (!value?.trim()) {
        return `${fieldName} is a mandatory field`
    }
    if (min !== undefined && value.length < min) {
        return `${fieldName} length must be greater than ${min - 1}`
    }
    if (max !== undefined && value.length > max) {
        return `${fieldName} length must be less than ${max}`
    }
    return ""
}

function validateLettersOnly(value, fieldName) {
    if (!/^[a-zA-Z\s]+$/.test(value)) {
        return `${fieldName} must contain only letters and spaces`
    }
    return ""
}

function validatePasswordRules(password) {
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter"
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter"
    }
    if (!/\d/.test(password)) {
        return "Password must contain at least one number"
    }
    if (!/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password)) {
        return "Password must contain at least one special character"
    }
    return ""
}

export function validateSignupFields(form) {
    const errors = {}

    let err = validateRequiredLength("First name", form.firstName, 2, 25)
    if (!err) err = validateLettersOnly(form.firstName, "First name")
    if (err) errors.firstName = err

    err = validateRequiredLength("Last name", form.lastName, 1, 25)
    if (!err) err = validateLettersOnly(form.lastName, "Last name")
    if (err) errors.lastName = err

    err = validateEmail(form.email)
    if (err) errors.email = err

    err = validateRequiredLength("Password", form.password, 8, 25)
    if (!err) err = validatePasswordRules(form.password)
    if (err) errors.password = err

    if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Passwords do not match"
    }

    return errors
}

export function validateLoginFields(form) {
    const errors = {}

    // EMAIL (your custom validator)
    const emailErr = validateEmail(form.email)
    if (emailErr) errors.email = emailErr

    // PASSWORD
    let err = validateRequiredLength("Password", form.password, 8, 25)
    if (!err) err = validatePasswordRules(form.password)
    if (err) errors.password = err

    return errors
}

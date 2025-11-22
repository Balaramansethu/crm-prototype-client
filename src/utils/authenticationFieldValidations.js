export function validateSignupFields(form) {
    const errors = {}

    // First Name
    if (!form.firstName?.trim()) {
        errors.firstName = "First name is required."
    } else if (form.firstName.length < 2) {
        errors.firstName = "Minimum 2 characters required."
    } else if (form.firstName.length > 25) {
        errors.firstName = "Maximum 25 characters allowed."
    }

    // Last Name
    if (!form.lastName?.trim()) {
        errors.lastName = "Last name is required."
    } else if (form.lastName.length < 1) {
        errors.lastName = "Minimum 1 character required."
    } else if (form.lastName.length > 25) {
        errors.lastName = "Maximum 25 characters allowed."
    }

    // Email
    if (!form.email?.trim()) {
        errors.email = "Email is required."
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Enter a valid email address."
    }

    // Password
    if (!form.password) {
        errors.password = "Password is required."
    } else if (form.password.length < 8) {
        errors.password = "Minimum 8 characters required."
    } else if (form.password.length > 25) {
        errors.password = "Maximum 25 characters allowed."
    }

    // Confirm Password
    if (form.confirmPassword !== form.password) {
        errors.confirmPassword = "Passwords do not match."
    }

    // Role Validation
    const allowedRoles = ["super_admin", "admin", "employee"]
    if (!allowedRoles.includes(form.role)) {
        errors.role = "Invalid role selected."
    }

    return errors
}

export function mapBackendErrorToField(errorCode, message) {
    const fieldErrors = {}

    switch (errorCode) {
        case "invalid_email":
            fieldErrors.email = message
            break

        case "email_exists":
            fieldErrors.email = message
            break

        case "invalid_password":
            fieldErrors.password = message
            break

        case "organization_not_found":
            fieldErrors.email = message
            break

        case "validation_error":
            fieldErrors.general = message
            break

        default:
            fieldErrors.general = message || "Something went wrong"
    }

    return fieldErrors
}

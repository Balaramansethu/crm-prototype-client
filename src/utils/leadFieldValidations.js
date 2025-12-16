import {
    validateEmail,
    validateRequiredLength,
} from "./authenticationFieldValidations"

function validateField(fieldName, value, min, max) {
    if (!value?.trim()) return ""
    return validateRequiredLength(fieldName, value, min, max)
}

export function validateLeadFields(form) {
    const errors = {}

    let err = validateRequiredLength("Company name", form.company, 2, 100)
    if (err) errors.company = err

    err = validateRequiredLength("Contact name", form.contact, 2, 50)
    if (err) errors.contact = err

    err = validateEmail(form.email)
    if (err) errors.email = err

    if (form.source && form.source.trim()) {
        err = validateRequiredLength("Source", form.source, 2, 50)
        if (err) errors.source = err
    }

    if (form.phoneNumber?.trim() && form.phoneNumber.length < 8) {
        errors.phoneNumber = "Phone number must be at least 8 digits"
    }

    const validStatuses = ["new", "qualified", "contacted", "done"]

    if (!form.status) {
        errors.status = "Status is required"
    } else if (!validStatuses.includes(form.status)) {
        errors.status = "Invalid status selected"
    }
    if (form.followUp && isNaN(new Date(form.followUp).getTime())) {
        errors.followUp = "Invalid date"
    }

    return errors
}

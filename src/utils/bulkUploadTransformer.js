/**
 * Bulk Upload CSV to Backend Payload Transformer
 *
 * Converts CSV rows to the backend bulk upload payload format.
 * Groups rows by company and creates the proper nested structure.
 */

/**
 * Transform CSV rows to backend bulk upload payload
 * @param {Array<Object>} rows - Parsed CSV rows
 * @returns {Array<Object>} Backend payload format
 */
export function transformCSVToBackendPayload(rows) {
    // Group rows by company (using company name + phone as unique key)
    const companyMap = new Map()

    rows.forEach((row, index) => {
        const rowNumber = index + 2 // +2 because row 1 is header, data starts at row 2

        // Extract company data
        const companyKey = `${row["Company Name"]?.trim() || ""}_${row["Company Phone Number"]?.trim() || ""}`

        if (!companyMap.has(companyKey)) {
            // Create new company entry
            const company = buildCompanyObject(row)
            companyMap.set(companyKey, {
                company,
                prospectuses: [],
                rowNumber,
            })
        }

        // Extract contact data (if present)
        const contact = buildContactObject(row)

        // Only add contact if it has at least a name, email, or phone
        if (contact.name || contact.email || contact.phone?.number) {
            companyMap.get(companyKey).prospectuses.push(contact)
        }
    })

    // Convert map to array
    return Array.from(companyMap.values()).map((entry) => ({
        company: entry.company,
        prospectuses: entry.prospectuses,
    }))
}

/**
 * Build company object from CSV row
 */
function buildCompanyObject(row) {
    const company = {
        name: row["Company Name"]?.trim() || "",
        phone: buildPhone(
            row["Company Phone Country Code"],
            row["Company Phone Number"],
            row["Company Phone Extension"],
        ),
    }

    // Add optional fields
    if (row["Company Email"]?.trim()) {
        company.email = row["Company Email"].trim()
    }

    if (row["Website"]?.trim()) {
        company.website = row["Website"].trim()
    }

    if (row["Social Profile"]?.trim()) {
        company.socialProfile = row["Social Profile"].trim()
    }

    if (row["Service Type"]?.trim()) {
        company.serviceType = row["Service Type"].trim()
    }

    // Build address if any address field is present
    const address = buildAddress(row)
    if (address && Object.keys(address).length > 0) {
        company.address = address
    }

    return company
}

/**
 * Build contact object from CSV row
 * WARNING: Keep fields flat, do NOT nest under "contact" object
 */
function buildContactObject(row) {
    const contact = {}

    // Basic contact info
    if (row["Contact Name"]?.trim()) {
        contact.name = row["Contact Name"].trim()
    }

    if (row["Contact Email"]?.trim()) {
        contact.email = row["Contact Email"].trim()
    }

    // Phone
    const phone = buildPhone(
        row["Contact Phone Country Code"],
        row["Contact Phone Number"],
        row["Contact Phone Extension"],
    )
    if (phone) {
        contact.phone = phone
    }

    // Optional fields
    if (row["Department"]?.trim()) {
        contact.department = row["Department"].trim()
    }

    if (row["Remarks"]?.trim()) {
        contact.remarks = row["Remarks"].trim()
    }

    if (row["Status"]?.trim()) {
        contact.status = row["Status"].trim().toLowerCase()
    }

    if (row["Source"]?.trim()) {
        contact.source = row["Source"].trim()
    }

    if (row["Follow Up Date"]?.trim()) {
        contact.followUp = parseDate(row["Follow Up Date"])
    }

    if (row["Priority"]?.trim()) {
        const priority = parseInt(row["Priority"], 10)
        if (!isNaN(priority) && priority >= 0) {
            contact.priority = priority
        }
    }

    // Beneficiary
    const beneficiary = buildBeneficiary(row)
    if (beneficiary && Object.keys(beneficiary).length > 0) {
        contact.benificiary = beneficiary // Note: backend uses "benificiary" (typo)
    }

    return contact
}

/**
 * Build phone object
 */
function buildPhone(countryCode, number, extension) {
    if (!number?.trim()) return null

    // Format country code: ensure it starts with + and contains only digits
    let formattedCountryCode = "+966" // default
    if (countryCode?.trim()) {
        const cleaned = countryCode.trim()
        // Remove all non-digit characters
        const digits = cleaned.replace(/\D/g, "")
        // Add + prefix
        formattedCountryCode = digits ? `+${digits}` : "+966"
    }

    const phone = {
        countryCode: formattedCountryCode,
        number: number.trim().replace(/\D/g, ""), // Remove non-digits
    }

    if (extension?.trim()) {
        phone.extension = extension.trim()
    }

    return phone
}

/**
 * Build address object
 */
function buildAddress(row) {
    const address = {}

    if (row["Address Door"]?.trim()) {
        address.door = row["Address Door"].trim()
    }

    if (row["Address Street"]?.trim()) {
        address.street = row["Address Street"].trim()
    }

    if (row["Address Area"]?.trim()) {
        address.area = row["Address Area"].trim()
    }

    if (row["Address City"]?.trim()) {
        address.city = row["Address City"].trim()
    }

    if (row["Address Pincode"]?.trim()) {
        address.pincode = row["Address Pincode"].trim()
    }

    // Note: Backend expects location object with latitude/longitude
    const lat = parseFloat(row["Address Latitude"])
    const lng = parseFloat(row["Address Longitude"])
    if (!isNaN(lat) && !isNaN(lng)) {
        address.location = { latitude: lat, longitude: lng }
    }

    // Short Address: Format as 4 uppercase letters + 4 digits
    if (row["Address Short Address"]?.trim()) {
        const formatted = formatShortAddress(row["Address Short Address"].trim())
        if (formatted) {
            address.shortAddress = formatted
        }
    }

    return address
}

/**
 * Format short address to 4 uppercase letters + 4 digits
 * Returns null if format is invalid
 */
function formatShortAddress(value) {
    if (!value) return null

    // Remove spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, "").toUpperCase()

    // Check if it matches the expected format (4 letters + 4 digits)
    const regex = /^[A-Z]{4}\d{4}$/
    if (regex.test(cleaned)) {
        return cleaned
    }

    // If not in correct format, return as-is (validation will catch it)
    return value.trim().toUpperCase()
}

/**
 * Build beneficiary object
 */
function buildBeneficiary(row) {
    const beneficiary = {}

    if (row["Beneficiary Name"]?.trim()) {
        beneficiary.name = row["Beneficiary Name"].trim()
    }

    const phone = buildPhone(
        row["Beneficiary Phone Country Code"],
        row["Beneficiary Phone Number"],
        row["Beneficiary Phone Extension"],
    )

    if (phone) {
        beneficiary.phone = phone
    }

    return beneficiary
}

/**
 * Parse date string to ISO format
 * Supports multiple formats: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, MM-DD-YYYY, MM/DD/YYYY
 */
function parseDate(dateString) {
    if (!dateString?.trim()) return null

    const trimmed = dateString.trim()

    // Helper to check if date is valid
    const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime())

    // Helper to convert 2-digit year to 4-digit year
    // Assumes 00-99 -> 2000-2099 (for CRM context, all dates are modern)
    const expandYear = (yy) => {
        const year = parseInt(yy)
        if (year >= 0 && year <= 99) {
            return 2000 + year
        }
        return year
    }

    // Try YYYY-MM-DD format first (ISO, unambiguous)
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (isoMatch) {
        const date = new Date(
            parseInt(isoMatch[1]),
            parseInt(isoMatch[2]) - 1,
            parseInt(isoMatch[3]),
        )
        if (isValidDate(date)) {
            return date.toISOString()
        }
    }

    // Try DD-MM-YY or DD/MM/YY (2-digit year, European format - MOST COMMON in Excel)
    const europeanShortMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/)
    if (europeanShortMatch) {
        const day = parseInt(europeanShortMatch[1])
        const month = parseInt(europeanShortMatch[2])
        const year = expandYear(europeanShortMatch[3])

        // Try DD-MM-YY first (European convention)
        const dateEU = new Date(year, month - 1, day)
        if (
            isValidDate(dateEU) &&
            dateEU.getFullYear() === year &&
            dateEU.getMonth() === month - 1 &&
            dateEU.getDate() === day
        ) {
            return dateEU.toISOString()
        }

        // If day > 12, it must be DD-MM-YY format, but month is invalid
        // Try MM-DD-YY as fallback
        if (day > 12 && month <= 12) {
            const dateUS = new Date(year, day - 1, month)
            if (
                isValidDate(dateUS) &&
                dateUS.getFullYear() === year &&
                dateUS.getMonth() === day - 1 &&
                dateUS.getDate() === month
            ) {
                return dateUS.toISOString()
            }
        }

        // If month > 12, it must be MM-DD-YY format
        if (month > 12 && day <= 12) {
            const dateUS = new Date(year, day - 1, month)
            if (
                isValidDate(dateUS) &&
                dateUS.getFullYear() === year &&
                dateUS.getMonth() === day - 1 &&
                dateUS.getDate() === month
            ) {
                return dateUS.toISOString()
            }
        }
    }

    // Try DD-MM-YYYY or DD/MM/YYYY (4-digit year, European format)
    const europeanMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
    if (europeanMatch) {
        const day = parseInt(europeanMatch[1])
        const month = parseInt(europeanMatch[2])
        const year = parseInt(europeanMatch[3])

        // Try DD-MM-YYYY first (European convention)
        const dateEU = new Date(year, month - 1, day)
        if (
            isValidDate(dateEU) &&
            dateEU.getFullYear() === year &&
            dateEU.getMonth() === month - 1 &&
            dateEU.getDate() === day
        ) {
            return dateEU.toISOString()
        }

        // If day > 12, it must be DD-MM-YYYY format, but month is invalid
        if (day > 12) {
            // Try MM-DD-YYYY as fallback
            const dateUS = new Date(year, day - 1, month)
            if (
                isValidDate(dateUS) &&
                dateUS.getFullYear() === year &&
                dateUS.getMonth() === day - 1 &&
                dateUS.getDate() === month
            ) {
                return dateUS.toISOString()
            }
        }

        // If month > 12, it must be MM-DD-YYYY format
        if (month > 12) {
            const dateUS = new Date(year, day - 1, month)
            if (
                isValidDate(dateUS) &&
                dateUS.getFullYear() === year &&
                dateUS.getMonth() === day - 1 &&
                dateUS.getDate() === month
            ) {
                return dateUS.toISOString()
            }
        }
    }

    // Check if it's an Excel serial number (e.g., 44927 for 2023-01-01)
    const excelSerial = parseFloat(trimmed)
    if (!isNaN(excelSerial) && excelSerial > 0) {
        // Excel serial date: days since 1900-01-01 (with some quirks)
        const excelEpoch = new Date(1899, 11, 30) // Excel's epoch (accounting for the 1900 leap year bug)
        const date = new Date(excelEpoch.getTime() + excelSerial * 24 * 60 * 60 * 1000)
        if (isValidDate(date)) {
            return date.toISOString()
        }
    }

    // Fallback: try native Date parsing
    try {
        const date = new Date(trimmed)
        if (isValidDate(date)) {
            return date.toISOString()
        }
    } catch (e) {
        // Ignore
    }

    return null
}

/**
 * Validate CSV rows before transformation
 * @param {Array<Object>} rows - Parsed CSV rows
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export function validateCSVRows(rows) {
    const errors = []

    if (!rows || rows.length === 0) {
        errors.push("No data rows found in CSV file")
        return { valid: false, errors }
    }

    // Check required headers
    const requiredHeaders = ["Company Name", "Company Phone Number"]
    const firstRow = rows[0]

    requiredHeaders.forEach((header) => {
        if (!(header in firstRow)) {
            errors.push(`Missing required column: "${header}"`)
        }
    })

    // Validate each row
    rows.forEach((row, index) => {
        const rowNumber = index + 2 // +2 for header

        // Company Name is required
        if (!row["Company Name"]?.trim()) {
            errors.push(`Row ${rowNumber}: Company Name is required`)
        } else if (row["Company Name"].trim().length < 2) {
            errors.push(
                `Row ${rowNumber}: Company Name must be at least 2 characters`,
            )
        } else if (row["Company Name"].trim().length > 100) {
            errors.push(
                `Row ${rowNumber}: Company Name must be at most 100 characters`,
            )
        }

        // Company Phone Number is required
        if (!row["Company Phone Number"]?.trim()) {
            errors.push(`Row ${rowNumber}: Company Phone Number is required`)
        } else {
            const phoneDigits = row["Company Phone Number"].replace(/\D/g, "")
            if (phoneDigits.length < 8 || phoneDigits.length > 15) {
                errors.push(
                    `Row ${rowNumber}: Company Phone Number must be 8-15 digits`,
                )
            }
        }

        // Validate email format if provided
        if (row["Company Email"]?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(row["Company Email"].trim())) {
                errors.push(`Row ${rowNumber}: Invalid Company Email format`)
            }
        }

        if (row["Contact Email"]?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(row["Contact Email"].trim())) {
                errors.push(`Row ${rowNumber}: Invalid Contact Email format`)
            }
        }

        // Validate phone country codes (should be + followed by digits)
        const validateCountryCode = (code, fieldName) => {
            if (!code?.trim()) return true // Empty is OK (will use default)
            const cleaned = code.trim().replace(/\s/g, "")
            // Check if it's just digits (we'll add + automatically) or starts with +
            const validPattern = /^(\+)?\d+$/
            if (!validPattern.test(cleaned)) {
                errors.push(
                    `Row ${rowNumber}: ${fieldName} must contain only numbers (+ will be added automatically)`,
                )
                return false
            }
            return true
        }

        validateCountryCode(
            row["Company Phone Country Code"],
            "Company Phone Country Code",
        )
        validateCountryCode(
            row["Contact Phone Country Code"],
            "Contact Phone Country Code",
        )
        validateCountryCode(
            row["Beneficiary Phone Country Code"],
            "Beneficiary Phone Country Code",
        )

        // Validate status enum
        if (row["Status"]?.trim()) {
            const validStatuses = ["new", "qualified"]
            if (
                !validStatuses.includes(row["Status"].trim().toLowerCase())
            ) {
                errors.push(
                    `Row ${rowNumber}: Status must be "new" or "qualified"`,
                )
            }
        }

        // Validate service type enum
        if (row["Service Type"]?.trim()) {
            const validServiceTypes = [
                "hiring_service",
                "peo_and_eor",
                "digital_marketing",
                "digital_solutions",
            ]
            if (!validServiceTypes.includes(row["Service Type"].trim())) {
                errors.push(
                    `Row ${rowNumber}: Invalid Service Type. Must be one of: ${validServiceTypes.join(", ")}`,
                )
            }
        }

        // Validate date format (accept multiple formats)
        if (row["Follow Up Date"]?.trim()) {
            // Check if it's a valid date in any common format
            const dateFormats = [
                /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
                /^\d{2}-\d{1,2}-\d{1,2}$/, // YY-MM-DD
                /^\d{1,2}-\d{1,2}-\d{4}$/, // DD-MM-YYYY or MM-DD-YYYY
                /^\d{1,2}-\d{1,2}-\d{2}$/, // DD-MM-YY or MM-DD-YY
                /^\d{1,2}\/\d{1,2}\/\d{4}$/, // DD/MM/YYYY or MM/DD/YYYY
                /^\d{1,2}\/\d{1,2}\/\d{2}$/, // DD/MM/YY or MM/DD/YY
                /^\d+$/, // Excel serial number
            ]

            const matchesFormat = dateFormats.some(regex => regex.test(row["Follow Up Date"].trim()))

            if (!matchesFormat) {
                errors.push(
                    `Row ${rowNumber}: Follow Up Date must be a valid date format`,
                )
            } else {
                // Validate that it parses to a valid date
                const parsed = parseDate(row["Follow Up Date"])
                if (!parsed) {
                    errors.push(
                        `Row ${rowNumber}: Follow Up Date "${row["Follow Up Date"]}" is not a valid date`,
                    )
                }
            }
        }

        // Validate short address format (4 uppercase letters + 4 digits)
        if (row["Address Short Address"]?.trim()) {
            const shortAddressRegex = /^[A-Z]{4}\d{4}$/
            if (!shortAddressRegex.test(row["Address Short Address"].trim())) {
                errors.push(
                    `Row ${rowNumber}: Address Short Address must be 4 uppercase letters followed by 4 digits (e.g., RYDH1234)`,
                )
            }
        }
    })

    return {
        valid: errors.length === 0,
        errors,
    }
}

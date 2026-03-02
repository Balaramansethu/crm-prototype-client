/**
 * Prospectus Bulk Upload CSV Template Generator
 *
 * Generates a CSV template that exactly matches the ProspectusForm structure.
 * This template includes all fields from CompanyDetailsForm and ContactPersonForm.
 */

/**
 * Generate CSV content from array of rows
 */
function generateCSV(rows) {
    return rows
        .map((row) =>
            row
                .map((cell) => {
                    // Handle cells with commas, quotes, or newlines
                    const cellStr = String(cell ?? "")
                    if (
                        cellStr.includes(",") ||
                        cellStr.includes('"') ||
                        cellStr.includes("\n")
                    ) {
                        return `"${cellStr.replace(/"/g, '""')}"`
                    }
                    return cellStr
                })
                .join(","),
        )
        .join("\n")
}

/**
 * Generate and download prospectus CSV template
 */
export function downloadProspectusTemplate() {
    // Define template columns matching ProspectusForm structure
    const headers = [
        // ─── COMPANY DETAILS ───
        "Company Name",
        "Company Email",
        "Company Phone Country Code",
        "Company Phone Number",
        "Company Phone Extension",
        "Service Type",
        "Website",
        "Social Profile",
        "Address Door",
        "Address Street",
        "Address Area",
        "Address City",
        "Address Pincode",
        "Address Latitude",
        "Address Longitude",
        "Address Short Address",

        // ─── CONTACT PERSON DETAILS ───
        "Contact Name",
        "Contact Email",
        "Contact Phone Country Code",
        "Contact Phone Number",
        "Contact Phone Extension",
        "Department",
        "Status",
        "Source",
        "Follow Up Date",
        "Priority",
        "Remarks",

        // ─── BENEFICIARY DETAILS ───
        "Beneficiary Name",
        "Beneficiary Phone Country Code",
        "Beneficiary Phone Number",
        "Beneficiary Phone Extension",
    ]

    // Sample data row with instructions
    const sampleRow1 = [
        // Company Details
        "Acme Corporation",
        "contact@acme.com",
        "966",
        "501234567",
        "",
        "hiring_service",
        "https://www.acme.com",
        "https://linkedin.com/company/acme",
        "Building 123",
        "King Fahd Road",
        "Al Olaya",
        "Riyadh",
        "12345",
        "24.7136",
        "46.6753",
        "RYDH1234",

        // Contact Person Details
        "John Doe",
        "john.doe@acme.com",
        "966",
        "501234567",
        "",
        "Sales",
        "new",
        "Website",
        "15-03-26",
        "1",
        "Initial contact via website form",

        // Beneficiary Details
        "Jane Smith",
        "966",
        "509876543",
        "",
    ]

    // Second sample row
    const sampleRow2 = [
        // Company Details
        "Tech Solutions Ltd",
        "info@techsolutions.com",
        "966",
        "502345678",
        "101",
        "digital_solutions",
        "https://techsolutions.com",
        "",
        "Suite 456",
        "Olaya Street",
        "Downtown",
        "Jeddah",
        "23456",
        "21.4858",
        "39.1925",
        "JEDD5678",

        // Contact Person Details
        "Sarah Ahmed",
        "sarah@techsolutions.com",
        "966",
        "502345678",
        "202",
        "Marketing",
        "qualified",
        "Referral",
        "20/03/26",
        "2",
        "Follow up on marketing campaign",

        // Beneficiary Details
        "",
        "",
        "",
        "",
    ]

    // Create CSV rows
    const csvRows = [headers, sampleRow1, sampleRow2]

    // Generate CSV content
    const csvContent = generateCSV(csvRows)

    // Add UTF-8 BOM for proper Excel compatibility
    const BOM = "\uFEFF"
    const csvWithBOM = BOM + csvContent

    // Create blob
    const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "Prospectus_Bulk_Upload_Template.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

/**
 * Alternative: Generate and return CSV blob (for custom download handling)
 */
export function generateProspectusTemplateBlob() {
    const headers = [
        // Company Details
        "Company Name",
        "Company Email",
        "Company Phone Country Code",
        "Company Phone Number",
        "Company Phone Extension",
        "Service Type",
        "Website",
        "Social Profile",
        "Address Door",
        "Address Street",
        "Address Area",
        "Address City",
        "Address Pincode",
        "Address Latitude",
        "Address Longitude",
        "Address Short Address",

        // Contact Person Details
        "Contact Name",
        "Contact Email",
        "Contact Phone Country Code",
        "Contact Phone Number",
        "Contact Phone Extension",
        "Department",
        "Status",
        "Source",
        "Follow Up Date",
        "Priority",
        "Remarks",

        // Beneficiary Details
        "Beneficiary Name",
        "Beneficiary Phone Country Code",
        "Beneficiary Phone Number",
        "Beneficiary Phone Extension",
    ]

    const sampleRow = [
        "Acme Corporation",
        "contact@acme.com",
        "+966",
        "501234567",
        "",
        "hiring_service",
        "https://www.acme.com",
        "https://linkedin.com/company/acme",
        "Building 123",
        "King Fahd Road",
        "Al Olaya",
        "Riyadh",
        "12345",
        "24.7136",
        "46.6753",
        "RYDH1234",
        "John Doe",
        "john.doe@acme.com",
        "+966",
        "501234567",
        "",
        "Sales",
        "new",
        "Website",
        "2026-03-15",
        "1",
        "Initial contact via website form",
        "Jane Smith",
        "+966",
        "509876543",
        "",
    ]

    const csvRows = [headers, sampleRow]
    const csvContent = generateCSV(csvRows)
    const BOM = "\uFEFF"
    const csvWithBOM = BOM + csvContent

    return new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
}

/**
 * Template field descriptions for documentation
 */
export const TEMPLATE_FIELD_DESCRIPTIONS = {
    // Company Details
    companyName: "Required. The name of the company/organization",
    companyEmail: "Optional. Primary email for the company",
    companyPhoneCountryCode: "Optional. Default: +966",
    companyPhoneNumber: "Optional. Digits only (e.g., 501234567)",
    companyPhoneExtension: "Optional. Phone extension",
    serviceType:
        "Optional. Must be: hiring_service, peo_and_eor, digital_marketing, or digital_solutions",
    website: "Optional. Company website URL",
    socialProfile: "Optional. LinkedIn or other social media URL",
    addressDoor: "Optional. Building/door number",
    addressStreet: "Optional. Street name",
    addressArea: "Optional. Area/district",
    addressCity: "Optional. City name",
    addressPincode: "Optional. Postal/ZIP code",
    addressLatitude: "Optional. Decimal number (e.g., 24.7136)",
    addressLongitude: "Optional. Decimal number (e.g., 46.6753)",
    addressShortAddress: "Optional. 4 uppercase letters + 4 digits (e.g., RYDH1234)",

    // Contact Person Details
    contactName: "Optional. Name of the contact person",
    contactEmail: "Optional. Contact person's email",
    contactPhoneCountryCode: "Optional. Default: +966",
    contactPhoneNumber: "Optional. Digits only",
    contactPhoneExtension: "Optional. Phone extension",
    department: "Optional. Department of the contact person",
    status: "Optional. Must be: new or qualified (default: new)",
    source: "Optional. Where this prospectus came from",
    followUpDate: "Optional. Format: YYYY-MM-DD (e.g., 2026-03-15)",
    priority: "Optional. Number (1 = highest priority)",
    remarks: "Optional. Additional notes or comments",

    // Beneficiary Details
    beneficiaryName: "Optional. Name of the beneficiary",
    beneficiaryPhoneCountryCode: "Optional. Default: +966",
    beneficiaryPhoneNumber: "Optional. Digits only",
    beneficiaryPhoneExtension: "Optional. Phone extension",
}

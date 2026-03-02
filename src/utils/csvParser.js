/**
 * CSV Parser Utility
 * Parses CSV content and converts it to JSON
 */

/**
 * Parse CSV string to array of objects
 * @param {string} csvContent - Raw CSV content
 * @returns {Array<Object>} Array of row objects
 */
export function parseCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim())

    if (lines.length === 0) {
        throw new Error("CSV file is empty")
    }

    // Parse header row
    const headers = parseCSVLine(lines[0])

    // Parse data rows
    const rows = []
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])

        // Skip empty rows
        if (values.every((v) => !v || !v.trim())) continue

        // Create object from headers and values
        const row = {}
        headers.forEach((header, index) => {
            row[header] = values[index] || ""
        })

        rows.push(row)
    }

    return rows
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Array of values
 */
function parseCSVLine(line) {
    const values = []
    let currentValue = ""
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote
                currentValue += '"'
                i++ // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes
            }
        } else if (char === "," && !insideQuotes) {
            // End of value
            values.push(currentValue.trim())
            currentValue = ""
        } else {
            currentValue += char
        }
    }

    // Push last value
    values.push(currentValue.trim())

    return values
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content as string
 */
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file, "UTF-8")
    })
}

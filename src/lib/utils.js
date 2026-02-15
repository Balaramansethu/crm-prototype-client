import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
    CALL_OUTCOME_OPTIONS,
    LEAD_STATUS_OPTIONS_EDIT,
} from "@/constants/formOptions"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Converts a snake_case enum value to a camelCase translation key with prefix
 * e.g., "not_interested" with prefix "outcome" -> "outcomeNotInterested"
 * e.g., "contacted_by_email" with prefix "status" -> "statusContactedByEmail"
 */
export function enumToTranslationKey(value, prefix = "") {
    if (!value) return ""
    const camelCase = value
        .split("_")
        .map((word, index) =>
            index === 0 && !prefix
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join("")
    return prefix
        ? `${prefix}${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}`
        : camelCase
}

/**
 * Gets the color class for a call outcome
 */
export function getOutcomeColor(outcome) {
    if (!outcome) return "bg-gray-100 text-gray-700"
    const option = CALL_OUTCOME_OPTIONS.find((opt) => opt.value === outcome)
    if (option) return option.color

    // Check if it's a lead status
    const statusOption = LEAD_STATUS_OPTIONS_EDIT.find(
        (opt) => opt.value === outcome,
    )
    if (statusOption) return statusOption.color

    // Legacy/Fallback mapping
    const lower = outcome.toLowerCase()
    if (lower === "contacted") return "bg-blue-100 text-blue-700"

    return "bg-gray-100 text-gray-700"
}

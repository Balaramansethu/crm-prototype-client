/**
 * Centralized form options for consistent use across the application.
 * This eliminates duplicate option definitions and ensures consistency.
 */

// Lead Status Options
export const LEAD_STATUS_OPTIONS = [
    { value: "new", color: "bg-blue-100 text-blue-900" },
    { value: "qualified", color: "bg-green-100 text-green-900" },
    { value: "contacted", color: "bg-yellow-100 text-yellow-900" },
    { value: "done", color: "bg-gray-100 text-gray-900" },
]

// Lead Priority Options
export const LEAD_PRIORITY_OPTIONS = [
    { value: "high", color: "bg-red-100 text-red-700" },
    { value: "medium", color: "bg-yellow-100 text-yellow-700" },
    { value: "low", color: "bg-green-100 text-green-700" },
]

// Call Log Outcome Options
export const CALL_OUTCOME_OPTIONS = [
    { value: "interested", color: "bg-green-100 text-green-700" },
    { value: "not_interested", color: "bg-red-100 text-red-700" },
    { value: "contacted", color: "bg-blue-100 text-blue-700" },
    { value: "done", color: "bg-gray-100 text-gray-700" },
]

// Default form values
export const DEFAULT_CONTACT_VALUES = {
    name: "",
    designation: "",
    phoneExtension: "",
    phoneNumber: "",
    email: "",
    priority: "medium",
    status: "new",
    source: "",
    followUp: undefined,
}

export const DEFAULT_COMPANY_VALUES = {
    name: "",
    phone: "",
    website: "",
    socialProfile: "",
}

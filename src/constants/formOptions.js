/**
 * Centralized form options for consistent use across the application.
 * Aligned with backend API schema.
 */

// Lead Status Options (enum: new, qualified, contacted, done)
export const LEAD_STATUS_OPTIONS = [
    { value: "new", label: "new", color: "bg-blue-100 text-blue-900" },
    {
        value: "qualified",
        label: "qualified",
        color: "bg-green-100 text-green-900",
    },
    {
        value: "contacted",
        label: "contacted",
        color: "bg-yellow-100 text-yellow-900",
    },
    { value: "done", label: "done", color: "bg-gray-100 text-gray-900" },
]

// Call Log Outcome Options
export const CALL_OUTCOME_OPTIONS = [
    {
        value: "interested",
        label: "interested",
        color: "bg-green-100 text-green-700",
    },
    {
        value: "not_interested",
        label: "notInterested",
        color: "bg-red-100 text-red-700",
    },
    {
        value: "contacted",
        label: "contacted",
        color: "bg-blue-100 text-blue-700",
    },
    { value: "done", label: "done", color: "bg-gray-100 text-gray-700" },
]

// Default contact form values
export const DEFAULT_CONTACT_VALUES = {
    name: "",
    email: "",
    phoneExtension: "",
    phoneNumber: "",
    status: "new",
    source: "",
    followUp: undefined,
}

// Default company form values
export const DEFAULT_COMPANY_VALUES = {
    name: "",
    email: "",
    phoneExtension: "",
    phoneNumber: "",
    website: "",
    socialProfile: "",
}

/**
 * Centralized form options for consistent use across the application.
 * Aligned with backend API schema.
 */

// Service Type Options for Company
export const SERVICE_TYPE_OPTIONS = [
    {
        value: "hiring_service",
        label: "hiringService",
        color: "bg-blue-100 text-blue-700",
    },
    {
        value: "peo_and_eor",
        label: "peoAndEor",
        color: "bg-purple-100 text-purple-700",
    },
    {
        value: "digital_marketing",
        label: "digitalMarketing",
        color: "bg-green-100 text-green-700",
    },
    {
        value: "digital_solutions",
        label: "digitalSolutions",
        color: "bg-orange-100 text-orange-700",
    },
]

// Lead Status Options (enum: new, qualified, contacted_by_email, dropped)
export const LEAD_STATUS_OPTIONS = [
    { value: "new", label: "statusNew", color: "bg-blue-100 text-blue-900" },
    {
        value: "qualified",
        label: "statusQualified",
        color: "bg-green-100 text-green-900",
    },
    {
        value: "contacted_by_email",
        label: "statusContactedByEmail",
        color: "bg-yellow-100 text-yellow-900",
    },
]

// Lead Status Options for Edit mode (includes dropped)
export const LEAD_STATUS_OPTIONS_EDIT = [
    ...LEAD_STATUS_OPTIONS,
    {
        value: "dropped",
        label: "statusDropped",
        color: "bg-gray-100 text-gray-900",
    },
]

// Call Log Outcome Options
export const CALL_OUTCOME_OPTIONS = [
    {
        value: "interested",
        label: "outcomeInterested",
        color: "bg-green-100 text-green-700",
    },
    {
        value: "not_interested",
        label: "outcomeNotInterested",
        color: "bg-red-100 text-red-700",
    },
    {
        value: "follow_up_needed",
        label: "outcomeFollowUpNeeded",
        color: "bg-yellow-100 text-yellow-700",
    },
    {
        value: "promoted_to_meeting",
        label: "outcomePromotedToMeeting",
        color: "bg-blue-100 text-blue-700",
    },
    {
        value: "conversion_in_progress",
        label: "outcomeConversionInProgress",
        color: "bg-purple-100 text-purple-700",
    },
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
    priority: 1,
    dropReason: "",
}

// Default company form values
export const DEFAULT_COMPANY_VALUES = {
    name: "",
    email: "",
    phoneExtension: "",
    phoneNumber: "",
    website: "",
    socialProfile: "",
    serviceType: "",
}

/**
 * Centralized form options for consistent use across the application.
 * Aligned with backend API schema.
 * Each option has a unique, distinct color - no duplicates.
 */

// Service Type Options for Company
export const SERVICE_TYPE_OPTIONS = [
    {
        value: "hiring_service",
        label: "hiringService",
        color: "bg-sky-100 text-sky-700",
    },
    {
        value: "peo_and_eor",
        label: "peoAndEor",
        color: "bg-violet-100 text-violet-700",
    },
    {
        value: "digital_marketing",
        label: "digitalMarketing",
        color: "bg-teal-100 text-teal-700",
    },
    {
        value: "digital_solutions",
        label: "digitalSolutions",
        color: "bg-amber-100 text-amber-700",
    },
]

// Lead Status Options (enum: new, qualified, contacted_by_email, dropped)
// Each status has a unique color
export const LEAD_STATUS_OPTIONS = [
    { value: "new", label: "statusNew", color: "bg-sky-100 text-sky-800" },
    {
        value: "qualified",
        label: "statusQualified",
        color: "bg-emerald-100 text-emerald-800",
    },
    {
        value: "contacted_by_email",
        label: "statusContactedByEmail",
        color: "bg-amber-100 text-amber-800",
    },
]

// Lead Status Options for Edit mode (includes dropped)
export const LEAD_STATUS_OPTIONS_EDIT = [
    ...LEAD_STATUS_OPTIONS,
    {
        value: "dropped",
        label: "statusDropped",
        color: "bg-slate-200 text-slate-700",
    },
]

// Call Log Outcome Options - Each outcome has a unique color
export const CALL_OUTCOME_OPTIONS = [
    {
        value: "interested",
        label: "outcomeInterested",
        color: "bg-teal-100 text-teal-700",
    },
    {
        value: "not_interested",
        label: "outcomeNotInterested",
        color: "bg-rose-100 text-rose-700",
    },
    {
        value: "follow_up_needed",
        label: "outcomeFollowUpNeeded",
        color: "bg-orange-100 text-orange-700",
    },
    {
        value: "promoted_to_meeting",
        label: "outcomePromotedToMeeting",
        color: "bg-indigo-100 text-indigo-700",
    },
    {
        value: "conversion_in_progress",
        label: "outcomeConversionInProgress",
        color: "bg-violet-100 text-violet-700",
    },
]

// Default contact form values
export const DEFAULT_CONTACT_VALUES = {
    name: "",
    email: "",
    phoneCountryCode: "+966",
    phoneExtension: "+966",
    phoneNumber: "",
    department: "",
    remarks: "",
    status: "new",
    source: "",
    followUp: undefined,
    priority: 1,
    dropReason: "",
}

// Default address form values
export const DEFAULT_ADDRESS_VALUES = {
    door: "",
    street: "",
    area: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    shortAddress: "",
}

// Default beneficiary form values
export const DEFAULT_BENEFICIARY_VALUES = {
    name: "",
    phoneCountryCode: "+966",
    phoneNumber: "",
    phoneExtension: "",
}

// Default company form values
export const DEFAULT_COMPANY_VALUES = {
    name: "",
    email: "",
    phoneCountryCode: "+966",
    phoneExtension: "+966",
    phoneNumber: "",
    website: "",
    socialProfile: "",
    serviceType: "",
    address: { ...DEFAULT_ADDRESS_VALUES },
}

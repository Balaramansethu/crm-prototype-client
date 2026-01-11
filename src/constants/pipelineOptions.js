/**
 * Pipeline stage options - maps to backend enum values
 */
export const PIPELINE_STAGES = [
    { id: "lead", label: "promotedLead", color: "bg-smoke border-primary/20" },
    { id: "meeting", label: "meeting", color: "bg-blue-50 border-blue-300" },
    {
        id: "proposal",
        label: "proposal",
        color: "bg-purple-50 border-purple-300",
    },
    {
        id: "negotiation",
        label: "negotiation",
        color: "bg-amber-50 border-amber-300",
    },
    {
        id: "closed_won",
        label: "closed_won",
        color: "bg-green-50 border-green-300",
    },
    {
        id: "closed_lost",
        label: "closed_lost",
        color: "bg-red-50 border-red-300",
    },
]

export const PIPELINE_STAGE_VALUES = PIPELINE_STAGES.map((s) => s.id)

export const getStageById = (id) => PIPELINE_STAGES.find((s) => s.id === id)

export const getStageColor = (id) => getStageById(id)?.color || "bg-gray-50"

export const getStageTranslationKey = (id) => getStageById(id)?.label || id

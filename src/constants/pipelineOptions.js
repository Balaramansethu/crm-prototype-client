/**
 * Pipeline stage options - maps to backend enum values
 * Each stage has a unique, distinct color
 */
export const PIPELINE_STAGES = [
    { id: "lead", label: "promotedLead", color: "bg-smoke border-primary/20" },
    { id: "meeting", label: "meeting", color: "bg-sky-50 border-sky-300" },
    {
        id: "proposal",
        label: "proposal",
        color: "bg-violet-50 border-violet-300",
    },
    {
        id: "negotiation",
        label: "negotiation",
        color: "bg-amber-50 border-amber-300",
    },
    {
        id: "closed_won",
        label: "closed_won",
        color: "bg-emerald-50 border-emerald-300",
    },
    {
        id: "closed_lost",
        label: "closed_lost",
        color: "bg-rose-50 border-rose-300",
    },
]

export const PIPELINE_STAGE_VALUES = PIPELINE_STAGES.map((s) => s.id)

export const getStageById = (id) => PIPELINE_STAGES.find((s) => s.id === id)

export const getStageColor = (id) => getStageById(id)?.color || "bg-gray-50"

export const getStageTranslationKey = (id) => getStageById(id)?.label || id

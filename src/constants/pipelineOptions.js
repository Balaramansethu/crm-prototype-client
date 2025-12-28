/**
 * Pipeline stage options - maps to backend enum values
 */
export const PIPELINE_STAGES = [
    { id: "lead", label: "Lead", color: "bg-slate-100 border-slate-300" },
    { id: "meeting", label: "Meeting", color: "bg-blue-50 border-blue-300" },
    { id: "proposal", label: "Proposal", color: "bg-purple-50 border-purple-300" },
    { id: "negotiation", label: "Negotiation", color: "bg-amber-50 border-amber-300" },
    { id: "closed_won", label: "Closed Won", color: "bg-green-50 border-green-300" },
    { id: "closed_lost", label: "Closed Lost", color: "bg-red-50 border-red-300" },
]

export const PIPELINE_STAGE_VALUES = PIPELINE_STAGES.map((s) => s.id)

export const getStageById = (id) => PIPELINE_STAGES.find((s) => s.id === id)

export const getStageColor = (id) => getStageById(id)?.color || "bg-gray-50"

import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn, enumToTranslationKey } from "@/lib/utils"

/**
 * Status color variants - Each status has a unique, distinct color
 * No two statuses share the same color scheme
 */
const STATUS_VARIANTS = {
    // Lead Statuses
    new: "bg-sky-100 text-sky-800 hover:bg-sky-100",
    qualified: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
    contacted_by_email: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    dropped: "bg-slate-200 text-slate-700 hover:bg-slate-200",

    // Call Outcomes
    interested: "bg-teal-100 text-teal-800 hover:bg-teal-100",
    not_interested: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    follow_up_needed: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    promoted_to_meeting: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
    conversion_in_progress: "bg-violet-100 text-violet-800 hover:bg-violet-100",

    // Legacy/Pipeline statuses
    contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    done: "bg-zinc-100 text-zinc-800 hover:bg-zinc-100",
    won: "bg-lime-100 text-lime-800 hover:bg-lime-100",
    lost: "bg-red-100 text-red-800 hover:bg-red-100",
}

export default function StatusBadge({ status, className }) {
    const { t } = useTranslation()

    const variant =
        STATUS_VARIANTS[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"

    return (
        <Badge className={cn("font-semibold", variant, className)}>
            {t(enumToTranslationKey(status, "status"))}
        </Badge>
    )
}

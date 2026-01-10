import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn, enumToTranslationKey } from "@/lib/utils"

const STATUS_VARIANTS = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    qualified: "bg-green-100 text-green-800 hover:bg-green-100",
    contacted_by_email: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    dropped: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    conversion_in_progress: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    follow_up_needed: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    promoted_to_meeting: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    not_interested: "bg-red-100 text-red-800 hover:bg-red-100",
    // Fallback/Legacy
    contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    done: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    won: "bg-green-100 text-green-800 hover:bg-green-100",
    lost: "bg-red-100 text-red-800 hover:bg-red-100",
}

export default function StatusBadge({ status, className }) {
    const { t } = useTranslation()

    const variant = STATUS_VARIANTS[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"

    return (
        <Badge className={cn("font-semibold", variant, className)}>
            {t(enumToTranslationKey(status, "status"))}
        </Badge>
    )
}

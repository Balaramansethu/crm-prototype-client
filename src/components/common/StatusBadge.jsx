import { Badge } from "@/components/ui/badge"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

const STATUS_VARIANTS = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    qualified: "bg-green-100 text-green-800 hover:bg-green-100",
    done: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

export default function StatusBadge({ status, className }) {
    const { t } = useTranslation()

    const variant = STATUS_VARIANTS[status] || STATUS_VARIANTS.new

    return (
        <Badge className={cn("font-semibold", variant, className)}>
            {t(status) || status}
        </Badge>
    )
}

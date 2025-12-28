import { useDrag } from "react-dnd"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export const ITEM_TYPE = "PIPELINE_CARD"

export default function PipelineCard({ pipeline, onEdit, onDelete }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: ITEM_TYPE,
            item: { id: pipeline._id, currentStage: pipeline.opportunityStage },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [pipeline._id, pipeline.opportunityStage],
    )

    const leadName =
        pipeline.lead?.contact?.name ||
        pipeline.lead?.company?.name ||
        t("unknownLead")
    const companyName = pipeline.lead?.company?.name

    const formatCurrency = (value) => {
        if (!value || value === 0) return "-"
        if (value >= 1000) {
            return `${Math.round(value / 1000)}K SAR`
        }
        return `${value} SAR`
    }

    const expectedRevenue =
        pipeline.expectedRevnue || pipeline.expectedRevenue || 0

    return (
        <div
            ref={drag}
            className={cn(
                "bg-white rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-sm",
                "hover:shadow-md outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0",
                isDragging && "opacity-60 shadow-xl scale-[1.02] bg-blue-50/50",
            )}
        >
            {/* Header: Title and Menu */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-slate-800 leading-snug">
                    {leadName}
                </h4>
                <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 -mt-1 -mr-1 text-slate-400 hover:text-slate-600"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align={isRTL ? "start" : "end"}
                        className="w-36"
                    >
                        <DropdownMenuItem
                            onClick={() =>
                                navigate(`/pipeline/${pipeline._id}`)
                            }
                            className="text-xs"
                        >
                            <Eye className="mr-2 h-3 w-3" />
                            {t("detailedView")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onEdit(pipeline)}
                            className="text-xs"
                        >
                            <Edit className="mr-2 h-3 w-3" />
                            {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(pipeline._id)}
                            className="text-red-600 focus:text-red-600 text-xs"
                        >
                            <Trash2 className="mr-2 h-3 w-3" />
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Company Name */}
            {companyName && companyName !== leadName && (
                <p className="text-xs text-blue-600 mb-3">{companyName}</p>
            )}

            {/* Value Rows - Properly aligned */}
            <div className="space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">{t("value")}</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                        {formatCurrency(pipeline.estimatedValue)}
                    </span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">{t("probability")}</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                        {pipeline.probability || 0}%
                    </span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">{t("expected")}</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                        {formatCurrency(expectedRevenue)}
                    </span>
                </div>
            </div>

            {/* Divider and Next Step */}
            {pipeline.nextStep && (
                <>
                    <div className="border-t border-slate-100 my-3" />
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 truncate flex-1">
                            {pipeline.nextStep}
                        </p>
                        {/* Owner initials avatar */}
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold text-slate-600">
                                {(pipeline.lead?.contact?.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

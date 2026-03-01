import { useDrag } from "react-dnd"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Archive, Eye, Calendar } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { SERVICE_TYPE_OPTIONS } from "@/constants/formOptions"

export const ITEM_TYPE = "PIPELINE_CARD"

export default function PipelineCard({
    pipeline,
    onEdit,
    onDelete,
    canDelete = false,
}) {
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

    // Use company name from the pipeline model
    const companyName = pipeline.company?.name || t("unknownCompany")

    // Get service type info
    const serviceType = pipeline.company?.serviceType
    const serviceTypeOption = SERVICE_TYPE_OPTIONS.find(
        (opt) => opt.value === serviceType,
    )

    // Check if meeting stage
    const isMeetingStage = pipeline.opportunityStage === "meeting"

    const formatCurrency = (value) => {
        if (!value || value === 0) return null
        return `SAR ${value.toLocaleString()}`
    }

    const expectedRevenue =
        pipeline.expectedRevnue || pipeline.expectedRevenue || 0

    // Format follow-up date
    const formatFollowUp = (date) => {
        if (!date) return null
        try {
            return format(new Date(date), "d MMM yyyy")
        } catch {
            return null
        }
    }

    const followUpDate = formatFollowUp(pipeline.followUp)

    return (
        <div
            ref={drag}
            className={cn(
                "bg-white rounded-lg border border-slate-200 cursor-grab active:cursor-grabbing transition-all duration-200",
                "hover:shadow-lg outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0",
                isDragging && "opacity-60 shadow-xl scale-[1.02] bg-blue-50/50",
            )}
        >
            {/* Card Content */}
            <div className="p-3">
                {/* Header with title and menu */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4
                        className="font-semibold text-sm text-slate-800 leading-snug cursor-pointer hover:text-primary truncate flex-1"
                        onClick={() => navigate(`/pipeline/${pipeline._id}`)}
                    >
                        {companyName}
                    </h4>
                    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 shrink-0 text-slate-400 hover:text-slate-600"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-3.5 w-3.5" />
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
                            {canDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(pipeline._id)}
                                    className="text-primary focus:text-primary text-xs"
                                >
                                    <Archive className="mr-2 h-3 w-3" />
                                    {t("archive")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Amount */}
                {expectedRevenue > 0 && (
                    <p className="text-sm font-medium text-slate-700 mb-1">
                        {formatCurrency(expectedRevenue)}
                    </p>
                )}

                {/* Next Step */}
                {pipeline.nextStep && (
                    <p className="text-sm text-slate-500 mb-2 truncate">
                        {pipeline.nextStep}
                    </p>
                )}

                {/* Service Type Badges */}
                {serviceTypeOption && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        <Badge
                            className={cn(
                                "text-[10px] font-medium px-1.5 py-0",
                                serviceTypeOption.color,
                            )}
                        >
                            {t(serviceTypeOption.label)}
                        </Badge>
                    </div>
                )}

                {/* Follow-up Date Badge */}
                {followUpDate && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {isMeetingStage
                                ? t("nextMeetingDate")
                                : t("followUp")}
                            : {followUpDate}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

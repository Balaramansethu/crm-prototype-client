import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SectionCard,
    FieldRow,
    StatusBadge,
    PipelineDetailSkeleton,
} from "@/components/common"
import { getPipelineById } from "@/service/pipelineService"
import { toast } from "sonner"
import { Edit, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PipelineDetailPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const isRTL = i18n.dir() === "rtl"

    const [pipeline, setPipeline] = useState(null)
    const [loading, setLoading] = useState(true)

    const lead = pipeline?.lead || {}

    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const response = await getPipelineById(id)
                setPipeline(response.data)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadOpportunity"))
                navigate("/pipeline")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchPipeline()
    }, [id, navigate, t])

    const formatPhone = (phone) => {
        if (!phone?.number) return null
        return `${phone.extension || ""} ${phone.number}`.trim()
    }

    const formatDate = (dateString) => {
        if (!dateString) return null
        try {
            return format(new Date(dateString), "dd MMM yyyy")
        } catch {
            return null
        }
    }

    const formatCurrency = (value) => {
        if (!value || value === 0) return "-"
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "SAR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const getStageLabel = (stage) => {
        return t(stage) || stage
    }

    const getStageBadgeStyles = (stage) => {
        const styles = {
            lead: "bg-slate-100 text-slate-700",
            contacted: "bg-blue-100 text-blue-700",
            proposal: "bg-purple-100 text-purple-700",
            negotiation: "bg-amber-100 text-amber-700",
            closed_won: "bg-green-100 text-green-700",
            closed_lost: "bg-red-100 text-red-700",
        }
        return styles[stage] || "bg-slate-100 text-slate-700"
    }

    if (loading) {
        return <PipelineDetailSkeleton />
    }

    if (!pipeline) {
        return null
    }

    const expectedRevenue =
        pipeline.expectedRevnue || pipeline.expectedRevenue || 0

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold">
                        {lead.contact?.name ||
                            lead.company?.name ||
                            t("opportunityDetails")}
                    </h1>
                    <span
                        className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            getStageBadgeStyles(pipeline.opportunityStage),
                        )}
                    >
                        {getStageLabel(pipeline.opportunityStage)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/pipeline")}
                    >
                        <ArrowLeft
                            className={isRTL ? "ml-2 rotate-180" : "mr-2"}
                            size={16}
                        />
                        {t("back")}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate(`/pipeline/edit/${id}`)}
                    >
                        <Edit className={isRTL ? "ml-2" : "mr-2"} size={16} />
                        {t("edit")}
                    </Button>
                </div>
            </div>

            {/* Three Column Grid for All Cards */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Opportunity Details Card */}
                <SectionCard title={t("opportunityDetails")}>
                    <FieldRow label={t("opportunityStage")}>
                        <span
                            className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                getStageBadgeStyles(pipeline.opportunityStage),
                            )}
                        >
                            {getStageLabel(pipeline.opportunityStage)}
                        </span>
                    </FieldRow>
                    <Separator />
                    <FieldRow
                        label={t("estimatedValue")}
                        value={formatCurrency(pipeline.estimatedValue)}
                    />
                    <Separator />
                    <FieldRow
                        label={t("probability")}
                        value={`${pipeline.probability || 0}%`}
                    />
                    <Separator />
                    <FieldRow
                        label={t("expectedRevenue")}
                        value={formatCurrency(expectedRevenue)}
                    />
                    {pipeline.nextStep && (
                        <>
                            <Separator />
                            <FieldRow
                                label={t("nextStep")}
                                value={pipeline.nextStep}
                            />
                        </>
                    )}
                </SectionCard>

                {/* Contact + Lead Details Card */}
                <SectionCard title={t("contactAndLead")}>
                    {/* Contact Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("contactInformation")}
                    </div>
                    <FieldRow label={t("name")} value={lead.contact?.name} />
                    <Separator />
                    <FieldRow label={t("email")} value={lead.contact?.email} />
                    <Separator />
                    <FieldRow
                        label={t("phone")}
                        value={formatPhone(lead.contact?.phone)}
                    />
                    {lead.contact?.designation && (
                        <>
                            <Separator />
                            <FieldRow
                                label={t("designation")}
                                value={lead.contact?.designation}
                            />
                        </>
                    )}

                    {/* Divider between sections */}
                    <div className="my-4 border-t border-dashed" />

                    {/* Lead Details Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("leadDetails")}
                    </div>
                    <FieldRow label={t("status")}>
                        <StatusBadge status={lead.status} />
                    </FieldRow>
                    <Separator />
                    <FieldRow label={t("source")} value={lead.source} />
                    <Separator />
                    <FieldRow
                        label={t("followUp")}
                        value={formatDate(lead.followUp)}
                    />
                </SectionCard>

                {/* Company + Additional Info Card */}
                <SectionCard title={t("companyAndInfo")}>
                    {/* Company Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("companyInformation")}
                    </div>
                    <FieldRow label={t("company")} value={lead.company?.name} />
                    <Separator />
                    <FieldRow label={t("email")} value={lead.company?.email} />
                    <Separator />
                    <FieldRow
                        label={t("phone")}
                        value={formatPhone(lead.company?.phone)}
                    />

                    {/* Divider between sections */}
                    <div className="my-4 border-t border-dashed" />

                    {/* Additional Info Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("additionalInfo")}
                    </div>
                    <FieldRow
                        label={t("website")}
                        value={lead.company?.website}
                    />
                    <Separator />
                    <FieldRow
                        label={t("socialProfile")}
                        value={lead.company?.socialProfile}
                    />
                </SectionCard>
            </div>
        </div>
    )
}

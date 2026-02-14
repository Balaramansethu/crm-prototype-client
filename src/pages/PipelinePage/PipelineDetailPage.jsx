import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    SectionCard,
    FieldRow,
    PipelineDetailSkeleton,
    PageHeader,
} from "@/components/common"
import { getPipelineById } from "@/service/pipelineService"
import { SERVICE_TYPE_OPTIONS } from "@/constants/formOptions"
import { getStageTranslationKey } from "@/constants/pipelineOptions"
import { toast } from "sonner"
import { Edit, Building2, FileIcon, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PipelineDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()

    const [pipeline, setPipeline] = useState(null)
    const [loading, setLoading] = useState(true)

    const company = pipeline?.company || {}

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
        if (!phone?.number) return "-"
        const parts = []
        if (phone.countryCode) parts.push(phone.countryCode)
        parts.push(phone.number)
        if (phone.extension) parts.push(phone.extension)
        return parts.join(" - ")
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
        const translationKey = getStageTranslationKey(stage)
        return t(translationKey) || stage
    }

    const getStageBadgeStyles = (stage) => {
        const styles = {
            lead: "bg-slate-100 text-slate-700",
            meeting: "bg-blue-100 text-blue-700",
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
        <div className="flex flex-col flex-1 w-full">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("pipeline"), path: "/pipeline" },
                    { label: company.name || t("opportunityDetails") },
                ]}
                title={
                    <div className="flex items-center gap-3">
                        <span className="truncate">
                            {company.name || t("opportunityDetails")}
                        </span>
                        <span
                            className={cn(
                                "px-2.5 py-1 rounded-full text-sm font-medium shrink-0",
                                getStageBadgeStyles(pipeline.opportunityStage),
                            )}
                        >
                            {getStageLabel(pipeline.opportunityStage)}
                        </span>
                    </div>
                }
                actions={
                    <Button
                        size="sm"
                        onClick={() => navigate(`/pipeline/edit/${id}`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                    </Button>
                }
            />

            {/* Main Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 px-4 lg:px-6 pb-6">
                {/* Proposal Details Card - Only visible in proposal stage */}
                {pipeline.opportunityStage === "proposal" && (
                    <SectionCard title={t("proposalDetails")} className="md:col-span-2 bg-purple-50/50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground font-medium">{t("proposalNumber")} :</span>
                                <span className="font-medium text-foreground">{pipeline.proposalNumber}</span>
                            </div>

                            {pipeline.proposalDocument && (
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">{t("proposalFile")}:</span>
                                    <div className="flex items-center gap-3 p-3 rounded-md border bg-background/50 backdrop-blur-sm w-full max-w-md">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                            <FileIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {pipeline.proposalDocument.originalname || "proposal_document.pdf"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                 {pipeline.proposalDocument.size ? `${(pipeline.proposalDocument.size / 1024).toFixed(1)} KB` : t("documents")}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(pipeline.proposalDocument.s3Url, "_blank", "noopener,noreferrer")}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

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
                    {pipeline.followUp && (
                        <>
                            <Separator />
                            <FieldRow
                                label={t("followUp")}
                                value={formatDate(pipeline.followUp)}
                            />
                        </>
                    )}
                    {pipeline.remarks && (
                        <>
                            <Separator />
                            <FieldRow
                                label={t("remarks")}
                                value={pipeline.remarks}
                            />
                        </>
                    )}
                </SectionCard>

                {/* Company Details Card */}
                <SectionCard title={t("companyDetails")}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">
                                {company.name || "-"}
                            </h4>
                            {company.website && (
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline truncate block"
                                >
                                    {company.website}
                                </a>
                            )}
                        </div>
                    </div>
                    {company.serviceType && (
                        <>
                            <FieldRow label={t("serviceType")}>
                                {(() => {
                                    const serviceTypeOption =
                                        SERVICE_TYPE_OPTIONS.find(
                                            (opt) =>
                                                opt.value ===
                                                company.serviceType,
                                        )
                                    return serviceTypeOption ? (
                                        <Badge
                                            className={cn(
                                                "text-xs font-medium",
                                                serviceTypeOption.color,
                                            )}
                                        >
                                            {t(serviceTypeOption.label)}
                                        </Badge>
                                    ) : (
                                        company.serviceType
                                    )
                                })()}
                            </FieldRow>
                            <Separator />
                        </>
                    )}
                    <FieldRow label={t("email")} value={company.email} />
                    <Separator />
                    <FieldRow
                        label={t("phone")}
                        value={formatPhone(company.phone)}
                    />
                    {company.socialProfile && (
                        <>
                            <Separator />
                            <FieldRow
                                label={t("socialProfile")}
                                value={company.socialProfile}
                            />
                        </>
                    )}
                </SectionCard>
            </div>
        </div>
    )
}

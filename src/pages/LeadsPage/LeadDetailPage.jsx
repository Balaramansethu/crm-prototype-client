import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
    PageHeader,
    SectionCard,
    FieldRow,
    StatusBadge,
    DetailPageSkeleton,
} from "@/components/common"
import { getLeadById } from "@/service/leadsService"
import { toast } from "sonner"
import { Edit, ArrowLeft, Calendar, Clock } from "lucide-react"

export default function LeadDetailPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const isRTL = i18n.dir() === "rtl"

    const [lead, setLead] = useState(null)
    const [loading, setLoading] = useState(true)

    const breadcrumbs = [
        { label: t("leads"), path: "/leads" },
        { label: lead?.contact?.name || t("leadDetails") },
    ]

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const response = await getLeadById(id)
                setLead(response.data)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadLead"))
                navigate("/leads")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchLead()
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

    const formatDateTime = (dateString) => {
        if (!dateString) return null
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm")
        } catch {
            return null
        }
    }

    if (loading) {
        return <DetailPageSkeleton />
    }

    if (!lead) {
        return null
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold">
                        {lead.contact?.name || t("leadDetails")}
                    </h1>
                    <StatusBadge status={lead.status} />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/leads")}
                    >
                        <ArrowLeft className={isRTL ? "ml-2 rotate-180" : "mr-2"} size={16} />
                        {t("back")}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate(`/leads/edit/${id}`)}
                    >
                        <Edit className={isRTL ? "ml-2" : "mr-2"} size={16} />
                        {t("edit")}
                    </Button>
                </div>
            </div>

            {/* Meta Card - Full Width */}
            <Card className="bg-muted/30">
                <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>{t("createdAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(lead.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            <span>{t("updatedAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(lead.updatedAt)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two Main Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Card - Contact + Lead Details */}
                <SectionCard title={t("contactAndLead")}>
                    {/* Contact Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("contactInformation")}
                    </div>
                    <FieldRow label={t("name")} value={lead.contact?.name} />
                    <Separator />
                    <FieldRow label={t("email")} value={lead.contact?.email} />
                    <Separator />
                    <FieldRow label={t("phone")} value={formatPhone(lead.contact?.phone)} />

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
                    <FieldRow label={t("followUp")} value={formatDate(lead.followUp)} />
                </SectionCard>

                {/* Right Card - Company + Additional Info */}
                <SectionCard title={t("companyAndInfo")}>
                    {/* Company Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("companyInformation")}
                    </div>
                    <FieldRow label={t("company")} value={lead.company?.name} />
                    <Separator />
                    <FieldRow label={t("email")} value={lead.company?.email} />
                    <Separator />
                    <FieldRow label={t("phone")} value={formatPhone(lead.company?.phone)} />

                    {/* Divider between sections */}
                    <div className="my-4 border-t border-dashed" />

                    {/* Additional Info Section */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        {t("additionalInfo")}
                    </div>
                    <FieldRow label={t("website")} value={lead.company?.website} />
                    <Separator />
                    <FieldRow label={t("socialProfile")} value={lead.company?.socialProfile} />
                </SectionCard>
            </div>
        </div>
    )
}

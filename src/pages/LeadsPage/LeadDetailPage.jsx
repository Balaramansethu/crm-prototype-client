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
import { Edit, ArrowLeft, Calendar, Clock, User } from "lucide-react"

export default function LeadDetailPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const isRTL = i18n.dir() === "rtl"

    const [leadData, setLeadData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Extract company and leads from the response
    const company = leadData?.company || {}
    const leads = leadData?.leads || []

    const breadcrumbs = [
        { label: t("leads"), path: "/leads" },
        { label: company?.name || t("leadDetails") },
    ]

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const response = await getLeadById(id)
                setLeadData(response.data)
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

    if (!leadData) {
        return null
    }

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h1 className="text-xl sm:text-2xl font-semibold leading-tight">
                        {company?.name || t("leadDetails")}
                    </h1>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/leads")}
                        className="flex-1 sm:flex-initial"
                    >
                        <ArrowLeft
                            className={isRTL ? "ml-2 rotate-180" : "mr-2"}
                            size={16}
                        />
                        {t("back")}
                    </Button>
                </div>
            </div>

            {/* Meta Card - Full Width */}
            <Card className="bg-muted/30">
                <CardContent className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>{t("createdAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(company.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            <span>{t("updatedAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(company.updatedAt)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Company Info Card */}
            <SectionCard title={t("companyInformation")}>
                <FieldRow label={t("company")} value={company?.name} />
                <Separator />
                <FieldRow label={t("email")} value={company?.email} />
                <Separator />
                <FieldRow
                    label={t("phone")}
                    value={formatPhone(company?.phone)}
                />
                <Separator />
                <FieldRow label={t("website")} value={company?.website} />
                <Separator />
                <FieldRow
                    label={t("socialProfile")}
                    value={company?.socialProfile}
                />
            </SectionCard>

            {/* Contact Persons Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                    {t("contactPersons")} ({leads.length})
                </h2>

                {leads.length === 0 ? (
                    <Card className="bg-muted/20">
                        <CardContent className="py-6 text-center text-muted-foreground">
                            {t("noDataAvailable")}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {leads.map((lead, index) => (
                            <Card key={lead._id || index} className="relative">
                                <CardContent className="pt-4">
                                    {/* Contact Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    {lead.name}
                                                </span>
                                                {leads.length > 1 && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        {t("priority")}: {lead.priority || index + 1}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={lead.status} />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(
                                                        `/leads/edit/${lead._id}`,
                                                    )
                                                }
                                            >
                                                <Edit size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-2 text-sm">
                                        <FieldRow
                                            label={t("email")}
                                            value={lead.email}
                                        />
                                        <Separator />
                                        <FieldRow
                                            label={t("phone")}
                                            value={formatPhone(lead.phone)}
                                        />
                                        <Separator />
                                        <FieldRow
                                            label={t("source")}
                                            value={lead.source}
                                        />
                                        <Separator />
                                        <FieldRow
                                            label={t("followUp")}
                                            value={formatDate(lead.followUp)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}


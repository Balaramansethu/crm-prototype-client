import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    PageHeader,
    FieldRow,
    StatusBadge,
    DetailPageSkeleton,
} from "@/components/common"
import { getCallLogById } from "@/service/callLogsService"
import { toast } from "sonner"
import {
    Edit,
    Calendar,
    Clock,
    User,
    Building2,
    Phone,
    Mail,
    MessageSquare,
    Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function CallLogDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()

    const [callLogData, setCallLogData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Extract data from response
    const lead = callLogData?.lead || {}
    const company = lead?.company || {}

    useEffect(() => {
        const fetchCallLog = async () => {
            try {
                const response = await getCallLogById(id)
                setCallLogData(response.data)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadCallLog"))
                navigate("/call-logs")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchCallLog()
    }, [id, navigate, t])

    const formatPhone = (phone) => {
        if (!phone?.number) return "-"
        return `${phone.extension || ""} ${phone.number}`.trim()
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd MMM yyyy")
        } catch {
            return "-"
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm")
        } catch {
            return "-"
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "hh:mm a")
        } catch {
            return "-"
        }
    }

    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "-"
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const hh = String(hrs).padStart(2, "0")
        const mm = String(mins).padStart(2, "0")
        const ss = String(secs).padStart(2, "0")
        return `${hh}:${mm}:${ss}`
    }

    // Badge color based on outcome
    const getOutcomeBadge = (outcome) => {
        if (!outcome) return { color: "bg-gray-100 text-gray-700", text: "-" }
        const lower = outcome.toLowerCase()
        if (lower === "interested")
            return {
                color: "bg-green-100 text-green-700",
                text: t("interested"),
            }
        if (lower === "not_interested")
            return {
                color: "bg-red-100 text-red-700",
                text: t("notInterested"),
            }
        if (lower === "contacted")
            return { color: "bg-blue-100 text-blue-700", text: t("contacted") }
        if (lower === "done")
            return { color: "bg-gray-100 text-gray-700", text: t("done") }
        return { color: "bg-gray-100 text-gray-700", text: outcome }
    }

    if (loading) {
        return <DetailPageSkeleton />
    }

    if (!callLogData) {
        return null
    }

    const outcomeBadge = getOutcomeBadge(callLogData.outcome)

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("callLogs"), path: "/call-logs" },
                    {
                        label:
                            lead?.name || company?.name || t("callLogDetails"),
                    },
                ]}
                title={t("callLogDetails")}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/call-logs/edit/${id}`)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit")}
                    </Button>
                }
            />

            {/* Meta Card - Full Width */}
            <Card className="bg-muted/30">
                <CardContent className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>{t("createdAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(callLogData.createdAt)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            <span>{t("updatedAt")}:</span>
                            <span className="font-medium text-foreground">
                                {formatDateTime(callLogData.updatedAt)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Call Log Details & Contact - Side by Side */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                {/* Call Log Details Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">
                                {t("callDetails")}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">
                                {t("outcome")}
                            </span>
                            <span
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm font-semibold",
                                    outcomeBadge.color,
                                )}
                            >
                                {outcomeBadge.text}
                            </span>
                        </div>
                        <Separator />
                        <FieldRow
                            label={t("callStartTime")}
                            value={formatTime(callLogData.callStartTime)}
                        />
                        <Separator />
                        <FieldRow
                            label={t("callDuration")}
                            value={formatDuration(callLogData.callDuration)}
                        />
                        <Separator />
                        <FieldRow
                            label={t("followUp")}
                            value={formatDate(callLogData.followUp)}
                        />
                        <Separator />
                        <div className="py-2">
                            <span className="text-sm text-muted-foreground block mb-2">
                                {t("remarks")}
                            </span>
                            <p className="text-sm bg-muted/50 rounded-lg p-3">
                                {callLogData.remarks || "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                                    <User className="h-5 w-5 text-green-500" />
                                </div>
                                <CardTitle className="text-lg">
                                    {t("contactPerson")}
                                </CardTitle>
                            </div>
                            <StatusBadge status={lead.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FieldRow label={t("name")} value={lead?.name} />
                        <Separator />
                        <FieldRow
                            label={t("phone")}
                            value={formatPhone(lead?.phone)}
                        />
                        <Separator />
                        <FieldRow label={t("email")} value={lead?.email} />
                        {lead.priority !== 0 && (
                            <>
                                <Separator />
                                <FieldRow
                                    label={t("priority")}
                                    value={lead.priority}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Company Info Card - Full Width */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">
                            {t("companyInformation")}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                                {t("company")}
                            </span>
                            <p className="font-medium">
                                {company?.name || "-"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                                {t("email")}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{company?.email || "-"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                                {t("phone")}
                            </span>
                            <div
                                className="flex items-center gap-1.5 font-mono"
                                dir="ltr"
                            >
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{formatPhone(company?.phone)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                                {t("website")}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                {company?.website ? (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">
                                {t("socialProfile")}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                {company?.socialProfile ? (
                                    <a
                                        href={company.socialProfile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {company.socialProfile}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

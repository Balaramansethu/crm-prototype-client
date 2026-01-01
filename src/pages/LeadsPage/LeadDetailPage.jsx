import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    PageHeader,
    FieldRow,
    StatusBadge,
    DetailPageSkeleton,
} from "@/components/common"
import { getLeadById } from "@/service/leadsService"
import { toast } from "sonner"
import { Edit, Calendar, Clock, User, Users, Building2, Phone, Mail } from "lucide-react"

export default function LeadDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()

    const [leadData, setLeadData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Extract company and main lead from the response
    const company = leadData?.company || {}
    // Main contact is at root level when fetched by lead ID
    const mainContact = leadData?.name ? {
        _id: leadData._id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        source: leadData.source,
        followUp: leadData.followUp,
        priority: leadData.priority,
    } : null
    // Other contacts are in company.leads
    const otherContacts = company?.leads || []

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

    if (loading) {
        return <DetailPageSkeleton />
    }

    if (!leadData) {
        return null
    }

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("leads"), path: "/leads" },
                    { label: mainContact?.name || company?.name || t("leadDetails") },
                ]}
                title={company?.name || t("leadDetails")}
            />

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

            {/* Main Contact & Company - Side by Side */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                {/* Main Contact Card */}
                {mainContact && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        {t("contactPerson")}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={mainContact.status} />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/leads/edit/${mainContact._id}`)}
                                    >
                                        <Edit size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FieldRow label={t("name")} value={mainContact.name} />
                            <Separator />
                            <FieldRow label={t("email")} value={mainContact.email} />
                            <Separator />
                            <FieldRow label={t("phone")} value={formatPhone(mainContact.phone)} />
                            <Separator />
                            <FieldRow label={t("source")} value={mainContact.source} />
                            <Separator />
                            <FieldRow label={t("followUp")} value={formatDate(mainContact.followUp)} />
                            <Separator />
                            <FieldRow label={t("priority")} value={mainContact.priority || 1} />
                        </CardContent>
                    </Card>
                )}

                {/* Company Info Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                                <Building2 className="h-5 w-5 text-blue-500" />
                            </div>
                            <CardTitle className="text-lg">
                                {t("companyInformation")}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <FieldRow label={t("company")} value={company?.name} />
                        <Separator />
                        <FieldRow label={t("email")} value={company?.email} />
                        <Separator />
                        <FieldRow label={t("phone")} value={formatPhone(company?.phone)} />
                        <Separator />
                        <FieldRow label={t("website")} value={company?.website} />
                        <Separator />
                        <FieldRow label={t("socialProfile")} value={company?.socialProfile} />
                    </CardContent>
                </Card>
            </div>

            {/* Other Contacts - Full Width Card */}
            {otherContacts.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                                    <Users className="h-5 w-5 text-green-500" />
                                </div>
                                <CardTitle className="text-lg">
                                    {t("contactPersons")} ({otherContacts.length})
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t("name")}</TableHead>
                                        <TableHead className="font-semibold">{t("email")}</TableHead>
                                        <TableHead className="font-semibold">{t("phone")}</TableHead>
                                        <TableHead className="font-semibold text-center">{t("priority")}</TableHead>
                                        <TableHead className="font-semibold text-center">{t("status")}</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {otherContacts.map((contact, index) => (
                                        <TableRow key={contact._id || index} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-medium">{contact.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {contact.email || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono" dir="ltr">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {formatPhone(contact.phone)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                    {contact.priority || index + 1}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusBadge status={contact.status} />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/leads/edit/${contact._id}`)}
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

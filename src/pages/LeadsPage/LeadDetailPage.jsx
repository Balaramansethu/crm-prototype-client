import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams, useLocation } from "react-router-dom"
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
import {
    Edit,
    Eye,
    Calendar,
    Clock,
    User,
    Users,
    Building2,
    Phone,
    Mail,
} from "lucide-react"
import { enumToTranslationKey, cn } from "@/lib/utils"
import { formatPhoneDisplay } from "@/utils/leadTransformers"
import { useUserStore } from "@/store/userStore"

export default function LeadDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const user = useUserStore((s) => s.user)
    const isSuperAdminUser =
        user?.role === "SUPER_ADMIN" || user?.role === "super_admin"

    const [leadData, setLeadData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Get the referrer page from location state or use search params as fallback
    const referrerPage =
        location.state?.fromPage ||
        new URLSearchParams(location.search).get("fromPage") ||
        1
    const backPath = referrerPage > 1 ? `/leads?page=${referrerPage}` : "/leads"

    // Extract company and leads from the response
    // New format: { company: {...}, leads: [{ _id, contact: { name, ... }, status, priority, ... }] }
    const company = leadData?.company || {}
    const allLeads = leadData?.leads || []

    // Sort leads by priority (ascending — 1 is highest priority)
    const sortedLeads = [...allLeads]
        .filter((lead) => lead.contact?.name && lead.contact.name.trim())
        .sort((a, b) => (a.priority || 99) - (b.priority || 99))

    // The lead clicked from the grid (matched by URL :id) is the main contact
    // Fallback to the first (highest priority) lead
    const mainLead =
        sortedLeads.find((lead) => lead._id === id) || sortedLeads[0] || null
    const mainContact = mainLead
        ? {
              _id: mainLead._id,
              name: mainLead.contact?.name,
              email: mainLead.contact?.email,
              phone: mainLead.contact?.phone,
              department: mainLead.contact?.department,
              remarks: mainLead.contact?.remarks,
              status: mainLead.status,
              droppedReason: mainLead.droppedReason,
              source: mainLead.source,
              followUp: mainLead.followUp,
              priority: mainLead.priority,
          }
        : null

    // Other contacts = all leads except the main one
    const otherContacts = sortedLeads.filter(
        (lead) => lead._id !== mainLead?._id,
    )

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

    const formatAddress = (address) => {
        if (!address) return "-"
        const parts = []
        if (address.door) parts.push(address.door)
        if (address.street) parts.push(address.street)
        if (address.area) parts.push(address.area)
        if (address.city) parts.push(address.city)
        if (address.pincode) parts.push(address.pincode)
        return parts.length > 0 ? parts.join(", ") : "-"
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
        <div className="flex flex-1 flex-col w-full">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("leads"), path: backPath },
                    {
                        label:
                            company?.name ||
                            t("leadDetails"),
                    },
                ]}
                title={company?.name || t("leadDetails")}
            />

            {/* Content Area with proper spacing */}
            <div className="flex flex-col gap-4 px-4 lg:px-6 pb-6">
                {/* Meta Card - Full Width */}
                <Card className="bg-muted/30">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>{t("createdAt")}:</span>
                                    <span className="font-medium text-foreground">
                                        {formatDateTime(mainLead?.createdAt)}
                                    </span>
                                </div>
                                {isSuperAdminUser && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User size={14} />
                                        <span>{t("createdBy")}:</span>
                                        <span className="font-medium text-foreground">
                                            {mainLead?.createdBy
                                                ? `${mainLead.createdBy.firstName} ${mainLead.createdBy.lastName}`
                                                : "-"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={14} />
                                <span>{t("updatedAt")}:</span>
                                <span className="font-medium text-foreground">
                                    {formatDateTime(mainLead?.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Company & Main Contact - Side by Side */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {/* Company Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">
                                        {t("companyInformation")}
                                    </CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        navigate(
                                            `/leads/edit/${mainContact?._id || id}?focus=company`,
                                        )
                                    }
                                    title={t("edit")}
                                >
                                    <Edit size={14} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FieldRow
                                label={t("company")}
                                value={company?.name}
                            />
                            <Separator />
                            <FieldRow
                                label={t("email")}
                                value={company?.email}
                            />
                            <Separator />
                            <FieldRow
                                label={t("phone")}
                                value={formatPhoneDisplay(company?.phone)}
                            />
                            <Separator />
                            <FieldRow
                                label={t("serviceType")}
                                value={
                                    company?.serviceType
                                        ? t(
                                              enumToTranslationKey(
                                                  company.serviceType,
                                              ),
                                          )
                                        : "-"
                                }
                            />
                            <Separator />
                            <FieldRow
                                label={t("website")}
                                value={company?.website}
                            />
                            <Separator />
                            <FieldRow
                                label={t("socialProfile")}
                                value={company?.socialProfile}
                            />

                            {/* Address Section */}
                            {company?.address && <Separator />}
                            {company?.address && (
                                <>
                                    <div className="font-medium text-sm pt-2">
                                        {t("address")}
                                    </div>
                                    <FieldRow
                                        label={t("fullAddress")}
                                        value={formatAddress(company.address)}
                                    />
                                    <FieldRow
                                        label={t("shortAddress")}
                                        value={company.address.shortAddress}
                                    />
                                    {company.address.location && (
                                        <FieldRow
                                            label={t("location")}
                                            value={`${company.address.location.latitude}, ${company.address.location.longitude}`}
                                        />
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

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
                                        <StatusBadge
                                            status={mainContact.status}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/leads/edit/${mainContact._id}`,
                                                )
                                            }
                                        >
                                            <Edit size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <FieldRow
                                    label={t("name")}
                                    value={mainContact.name}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("email")}
                                    value={mainContact.email}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("phone")}
                                    value={formatPhoneDisplay(
                                        mainContact.phone,
                                    )}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("department")}
                                    value={mainContact.department}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("remarks")}
                                    value={mainContact.remarks}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("source")}
                                    value={mainContact.source}
                                />
                                {mainContact.droppedReason && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-2 py-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {t("dropReason")}
                                            </span>
                                            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                                {mainContact.droppedReason}
                                            </p>
                                        </div>
                                    </>
                                )}
                                <Separator />
                                <FieldRow
                                    label={t("followUp")}
                                    value={formatDate(mainContact.followUp)}
                                />
                                {mainContact.priority !== 0 && (
                                    <>
                                        <Separator />
                                        <FieldRow
                                            label={t("priority")}
                                            value={mainContact.priority || 1}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Beneficiary Details - Full Width Card */}
                {mainLead?.benificiary && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                                    <User className="h-5 w-5 text-purple-500" />
                                </div>
                                <CardTitle className="text-lg">
                                    {t("beneficiary")}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <FieldRow
                                label={t("name")}
                                value={mainLead.benificiary.name}
                            />
                            <Separator />
                            <FieldRow
                                label={t("phone")}
                                value={formatPhoneDisplay(
                                    mainLead.benificiary.phone,
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

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
                                        {t("contactPersons")} (
                                        {otherContacts.length})
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                {t("name")}
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                {t("email")}
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                {t("phone")}
                                            </TableHead>
                                            {otherContacts.some(
                                                (c) => c.priority !== 0,
                                            ) && (
                                                <TableHead className="font-semibold text-center">
                                                    {t("priority")}
                                                </TableHead>
                                            )}
                                            <TableHead className="font-semibold text-center">
                                                {t("status")}
                                            </TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {otherContacts.map((contact, index) => (
                                            <TableRow
                                                key={contact._id || index}
                                                className="hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {contact.contact?.name || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {contact.contact?.email || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums"
                                                        dir="ltr"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {formatPhoneDisplay(
                                                            contact.contact?.phone,
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {contact.priority !== 0 && (
                                                    <TableCell className="text-center">
                                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                            {contact.priority ||
                                                                index + 1}
                                                        </span>
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">
                                                    <StatusBadge
                                                        status={contact.status}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/leads/${contact._id}`,
                                                                )
                                                            }
                                                            title={t(
                                                                "viewDetails",
                                                            )}
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/leads/edit/${contact._id}`,
                                                                )
                                                            }
                                                            title={t("edit")}
                                                        >
                                                            <Edit size={14} />
                                                        </Button>
                                                    </div>
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
        </div>
    )
}

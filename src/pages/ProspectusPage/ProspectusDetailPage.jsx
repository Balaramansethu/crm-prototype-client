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
import { getProspectusById } from "@/service/prospectusService"
import { formatPhoneDisplay } from "@/utils/leadTransformers"
import { enumToTranslationKey, cn } from "@/lib/utils"
import { useUserStore } from "@/store/userStore"
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

export default function ProspectusDetailPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()
    const user = useUserStore((s) => s.user)
    const isSuperAdmin =
        user?.role === "SUPER_ADMIN" || user?.role === "super_admin"

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const referrerPage =
        location.state?.fromPage ||
        new URLSearchParams(location.search).get("fromPage") ||
        1
    const backPath =
        referrerPage > 1 ? `/prospectuses?page=${referrerPage}` : "/prospectus"

    const company = data?.company || {}

    // Extract root prospectus
    const rootProspectus = data?.contact
        ? {
              contact: data.contact,
              status: data.status,
              source: data.source,
              followUp: data.followUp,
              priority: data.priority,
              benificiary: data.benificiary,
              _id: data._id,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              createdBy: data.createdBy,
          }
        : data?.name
          ? {
                contact: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    department: data.department,
                    remarks: data.remarks,
                },
                status: data.status,
                source: data.source,
                followUp: data.followUp,
                priority: data.priority,
                benificiary: data.benificiary,
                _id: data._id,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                createdBy: data.createdBy,
            }
          : null

    // Extract other prospectuses from company object if it exists
    const otherCompanyProspectuses = company?.prospectuses || []

    // Combine them, ensuring no duplication by _id
    let rawAllProspectuses = []
    if (rootProspectus) {
        rawAllProspectuses.push(rootProspectus)
    } else if (data?.prospectuses) {
        // Fallback if data actually has prospectuses at root
        rawAllProspectuses = [...data.prospectuses]
    }

    otherCompanyProspectuses.forEach((p) => {
        if (!rawAllProspectuses.some((existing) => existing._id === p._id)) {
            rawAllProspectuses.push(p)
        }
    })

    const allProspectuses = rawAllProspectuses

    // Map any root-level flat properties format to standard contact object format
    const normalizedProspectuses = allProspectuses.map((p) => {
        if (p.contact) return p
        return {
            ...p,
            contact: {
                name: p.name,
                email: p.email,
                phone: p.phone,
                department: p.department,
                remarks: p.remarks,
            },
        }
    })

    // First, sort all prospectuses by priority
    const sortedProps = [...normalizedProspectuses].sort(
        (a, b) => (a.priority || 99) - (b.priority || 99),
    )

    // The prospectus clicked from the grid (matched by URL :id) or fallback to first
    const mainProp =
        sortedProps.find((p) => p._id === id) || sortedProps[0] || null

    const mainContact = mainProp
        ? {
              _id: mainProp._id,
              name: mainProp.contact?.name,
              email: mainProp.contact?.email,
              phone: mainProp.contact?.phone,
              department: mainProp.contact?.department,
              remarks: mainProp.contact?.remarks,
              status: mainProp.status,
              source: mainProp.source,
              followUp: mainProp.followUp,
              priority: mainProp.priority,
          }
        : null

    // Remaining contacts
    const otherContacts = sortedProps.filter((p) => p._id !== mainProp?._id)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProspectusById(id)
                setData(response.data)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadProspectus"))
                navigate("/prospectus")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
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

    if (!data) {
        return null
    }

    return (
        <div className="flex flex-1 flex-col w-full">
            {/* Breadcrumb Header */}
            <PageHeader
                breadcrumbs={[
                    { label: t("prospectus"), path: backPath },
                    {
                        label: company?.name || t("prospectusDetails"),
                    },
                ]}
                title={company?.name || t("prospectusDetails")}
            />

            {/* Content Area */}
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
                                        {formatDateTime(
                                            mainProp?.createdAt ||
                                                data.createdAt,
                                        )}
                                    </span>
                                </div>
                                {isSuperAdmin && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User size={14} />
                                        <span>{t("createdBy")}:</span>
                                        <span className="font-medium text-foreground">
                                            {mainProp?.createdBy ||
                                            data.createdBy
                                                ? `${(mainProp?.createdBy || data.createdBy).firstName} ${(mainProp?.createdBy || data.createdBy).lastName}`
                                                : "-"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={14} />
                                <span>{t("updatedAt")}:</span>
                                <span className="font-medium text-foreground">
                                    {formatDateTime(
                                        mainProp?.updatedAt || data.updatedAt,
                                    )}
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
                                            `/prospectus/edit/${mainContact?._id || id}?focus=company`,
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
                                        {mainContact?.status?.toLowerCase() !==
                                            "qualified" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(
                                                        `/prospectus/edit/${mainContact._id}`,
                                                    )
                                                }
                                            >
                                                <Edit size={14} />
                                            </Button>
                                        )}
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
                {mainProp?.benificiary && (
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
                                value={mainProp.benificiary.name}
                            />
                            <Separator />
                            <FieldRow
                                label={t("phone")}
                                value={formatPhoneDisplay(
                                    mainProp.benificiary.phone,
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
                                                            {contact.contact
                                                                ?.name || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {contact.contact
                                                            ?.email || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums"
                                                        dir="ltr"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {formatPhoneDisplay(
                                                            contact.contact
                                                                ?.phone,
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
                                                        size="sm"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/prospectus/${contact._id}`,
                                                                )
                                                            }
                                                            title={t(
                                                                "viewDetails",
                                                            )}
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                        {contact.status?.toLowerCase() !==
                                                            "qualified" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/prospectus/edit/${contact._id}`,
                                                                    )
                                                                }
                                                                title={t(
                                                                    "edit",
                                                                )}
                                                            >
                                                                <Edit
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        )}
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

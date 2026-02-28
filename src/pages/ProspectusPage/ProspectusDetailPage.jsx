import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams, useLocation } from "react-router-dom"
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
import { getProspectusById } from "@/service/prospectusService"
import { formatPhoneDisplay } from "@/utils/leadTransformers"
import { enumToTranslationKey } from "@/lib/utils"
import { useUserStore } from "@/store/userStore"
import { toast } from "sonner"
import {
    Edit,
    Calendar,
    Clock,
    User,
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
        referrerPage > 1 ? `/prospectus?page=${referrerPage}` : "/prospectus"

    const company = data?.company || {}
    // Contact info is nested under data.contact
    // Status/source/followUp/priority are at the prospectus root level
    const contactData = data?.contact || null
    const contact = contactData
        ? {
              name: contactData.name,
              email: contactData.email,
              phone: contactData.phone,
              department: contactData.department,
              remarks: contactData.remarks,
              // These are at prospectus root, not inside contact
              status: data.status,
              source: data.source,
              followUp: data.followUp,
              priority: data.priority,
          }
        : null

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
                        label:
                            contact?.name ||
                            company?.name ||
                            t("prospectus"),
                    },
                ]}
                title={company?.name || t("prospectus")}
            />

            {/* Content Area */}
            <div className="flex flex-col gap-4 px-4 lg:px-6 pb-6">
                {/* Meta Card */}
                <Card className="bg-muted/30">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>{t("createdAt")}:</span>
                                    <span className="font-medium text-foreground">
                                        {formatDateTime(data.createdAt)}
                                    </span>
                                </div>
                                {isSuperAdmin && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User size={14} />
                                        <span>{t("createdBy")}:</span>
                                        <span className="font-medium text-foreground">
                                            {data.createdBy
                                                ? `${data.createdBy.firstName} ${data.createdBy.lastName}`
                                                : "-"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock size={14} />
                                    <span>{t("updatedAt")}:</span>
                                    <span className="font-medium text-foreground">
                                        {formatDateTime(data.updatedAt)}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        navigate(`/prospectus/edit/${id}`)
                                    }
                                >
                                    <Edit size={14} className="mr-1.5" />
                                    {t("edit")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact & Company - Side by Side */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {/* Contact Card */}
                    {contact && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-lg">
                                            {t("contactDetails")}
                                        </CardTitle>
                                    </div>
                                    <StatusBadge
                                        status={contact.status}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <FieldRow
                                    label={t("name")}
                                    value={contact.name}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("email")}
                                    value={contact.email}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("phone")}
                                    value={formatPhoneDisplay(contact.phone)}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("department")}
                                    value={contact.department}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("source")}
                                    value={contact.source}
                                />
                                <Separator />
                                <FieldRow
                                    label={t("followUp")}
                                    value={formatDate(contact.followUp)}
                                />
                                {contact.priority !== 0 && (
                                    <>
                                        <Separator />
                                        <FieldRow
                                            label={t("priority")}
                                            value={contact.priority}
                                        />
                                    </>
                                )}
                                {contact.remarks && (
                                    <>
                                        <Separator />
                                        <div className="flex flex-col gap-2 py-1">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {t("remarks")}
                                            </span>
                                            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                                {contact.remarks}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Company Card */}
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
                </div>

                {/* Beneficiary Card */}
                {data?.benificiary && (
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
                                value={data.benificiary.name}
                            />
                            <Separator />
                            <FieldRow
                                label={t("phone")}
                                value={formatPhoneDisplay(
                                    data.benificiary.phone,
                                )}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

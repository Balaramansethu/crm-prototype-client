import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
import { PageHeader } from "@/components/common"
import { LeadForm } from "@/components/forms"
import { createLead } from "@/service/leadsService"
import { useUserStore } from "@/store/userStore"
import { transformLeadPayload } from "@/utils/leadTransformers"
import { toast } from "sonner"
import { useState } from "react"

export default function CreateLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)

    const breadcrumbs = [
        { label: t("leads"), path: "/leads" },
        { label: t("createLead") },
    ]

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const ownerId = user?._id || user?.id
            const payload = transformLeadPayload(data, ownerId)

            const response = await createLead(payload)
            toast.success(t("leadCreatedSuccess"))

            const searchParams = new URLSearchParams(location.search)
            const returnTo = searchParams.get("returnTo")

            if (returnTo) {
                const leadId =
                    response._id || response.data?._id || response.lead?._id
                const separator = returnTo.includes("?") ? "&" : "?"
                navigate(`${returnTo}${separator}newLeadId=${leadId}`)
            } else {
                navigate("/leads")
            }
        } catch (error) {
            console.error(error)
            const message =
                error?.response?.data?.message || t("somethingWrong")
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <PageHeader breadcrumbs={breadcrumbs} title={t("createLead")} />

            <div className="-mt-8">
                <LeadForm
                    onSubmit={onSubmit}
                    loading={loading}
                    submitLabel={t("saveLead")}
                />
            </div>
        </div>
    )
}

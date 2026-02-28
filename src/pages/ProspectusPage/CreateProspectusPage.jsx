import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common"
import { ProspectusForm } from "@/components/forms/prospectus"
import { createProspectus } from "@/service/prospectusService"
import { transformProspectusPayload } from "@/utils/prospectusTransformers"
import { toast } from "sonner"
import { useState } from "react"

export default function CreateProspectusPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const breadcrumbs = [
        { label: t("prospectus"), path: "/prospectus" },
        { label: t("createProspectus") },
    ]

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = transformProspectusPayload(data)
            await createProspectus(payload)
            toast.success(t("prospectusCreatedSuccess"))
            navigate("/prospectus")
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
            <PageHeader
                breadcrumbs={breadcrumbs}
                title={t("createProspectus")}
            />

            <div className="-mt-8 px-2 sm:px-4 lg:px-12">
                <ProspectusForm
                    onSubmit={onSubmit}
                    loading={loading}
                    submitLabel={t("saveProspectus")}
                />
            </div>
        </div>
    )
}

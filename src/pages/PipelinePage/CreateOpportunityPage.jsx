import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

import { PageHeader, CompanyActivityCard } from "@/components/common"
import { OpportunityForm } from "@/components/forms/pipeline"
import { createPipeline } from "@/service/pipelineService"
import { useUserStore } from "@/store/userStore"

export default function CreateOpportunityPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState("")

    const breadcrumbs = [
        { label: t("pipeline"), path: "/pipeline" },
        { label: t("addOpportunity") },
    ]

    const onSubmit = async (formData) => {
        setLoading(true)
        try {
            const ownerId = user?._id || user?.id

            // Append owner to the formData object coming from OpportunityForm
            if (ownerId) {
                formData.append("owner", ownerId)
            }
            // Note: expectedRevenue backend typo handling should likely be done in service or by ensuring consistent naming.
            // If backend strictly expects 'expectedRevnue' (typo), we should handle it.
            // But standard fields are already appended.
            // Let's assume 'expectedRevenue' (correct spelling) or check if we need to alias it.
            // Previous code had: expectedRevnue: Number(data.expectedRevenue)
            // So let's append the typo version just in case, or rename it in FormData loop if needed.
            // Actually, let's append the typo version manually if 'expectedRevenue' exists in formData
            if (formData.has("expectedRevenue")) {
                const val = formData.get("expectedRevenue")
                formData.append("expectedRevnue", val) // Handle backend typo compatibility
            }

            await createPipeline(formData)

            // Invalidate pipelines cache so the list refreshes
            await queryClient.invalidateQueries({ queryKey: ["pipelines"] })

            toast.success(t("opportunityCreatedSuccess"))
            navigate("/pipeline")
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
            <PageHeader breadcrumbs={breadcrumbs} title={t("addOpportunity")} />

            <div className="-mt-8 px-2 sm:px-4 lg:px-12">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 max-w-5xl">
                    <div className="flex-1 max-w-xl">
                        <OpportunityForm
                            onSubmit={onSubmit}
                            loading={loading}
                            onCompanyChange={setSelectedCompanyId}
                        />
                    </div>
                    <CompanyActivityCard companyId={selectedCompanyId} />
                </div>
            </div>
        </div>
    )
}

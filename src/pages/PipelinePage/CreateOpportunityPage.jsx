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

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const ownerId = user?._id || user?.id

            const payload = {
                company: data.company,
                opportunityStage: data.opportunityStage,
                estimatedValue: Number(data.estimatedValue) || 0,
                probability: Number(data.probability) || 0,
                expectedRevnue: Number(data.expectedRevenue) || 0, // Note: backend typo
                nextStep: data.nextStep || "",
                remarks: data.remarks || "",
                owner: ownerId,
            }

            if (data.followUp) {
                payload.followUp = format(data.followUp, "yyyy-MM-dd")
            }

            await createPipeline(payload)

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

            <div className="-mt-8 px-4 lg:px-12">
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

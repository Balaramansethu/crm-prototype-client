import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"

import { PageHeader } from "@/components/common"
import { OpportunityForm } from "@/components/forms/pipeline"
import { createPipeline } from "@/service/pipelineService"

export default function CreateOpportunityPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [loading, setLoading] = useState(false)

    const breadcrumbs = [
        { label: t("pipeline"), path: "/pipeline" },
        { label: t("addOpportunity") },
    ]

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                lead: data.lead,
                opportunityStage: data.opportunityStage,
                estimatedValue: Number(data.estimatedValue) || 0,
                probability: Number(data.probability) || 0,
                expectedRevnue: Number(data.expectedRevenue) || 0,
                nextStep: data.nextStep || "",
                remarks: data.remarks || "",
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

            <div className="-mt-8 px-4 lg:px-6">
                <OpportunityForm onSubmit={onSubmit} loading={loading} />
            </div>
        </div>
    )
}

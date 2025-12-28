import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { PageHeader } from "@/components/common"
import { OpportunityForm } from "@/components/forms/pipeline"
import { getPipelineById, updatePipeline } from "@/service/pipelineService"

export default function EditOpportunityPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [initialData, setInitialData] = useState(null)

    const breadcrumbs = [
        { label: t("pipeline"), path: "/pipeline" },
        { label: t("editOpportunity") },
    ]

    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const response = await getPipelineById(id)
                setInitialData(response.data || response)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadOpportunity"))
                navigate("/pipeline")
            } finally {
                setFetching(false)
            }
        }
        if (id) fetchPipeline()
    }, [id, navigate, t])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
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

            await updatePipeline(id, payload)
            
            // Invalidate pipelines cache so the list refreshes
            await queryClient.invalidateQueries({ queryKey: ["pipelines"] })
            
            toast.success(t("opportunityUpdatedSuccess"))
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

    if (fetching) {
        return (
            <div className="flex flex-1 items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <PageHeader breadcrumbs={breadcrumbs} title={t("editOpportunity")} />

            <div className="-mt-8 px-4 lg:px-6">
                <OpportunityForm
                    initialData={initialData}
                    onSubmit={onSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}

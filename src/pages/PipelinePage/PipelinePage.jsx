import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { PipelineBoard } from "@/components/pipeline"
import { CommonDialog } from "@/components/common"
import {
    usePipelines,
    useUpdatePipelineStage,
    useDeletePipeline,
} from "@/hooks/usePipeline"

export default function PipelinePage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const { data, isLoading, isError } = usePipelines()
    const updateStageMutation = useUpdatePipelineStage()
    const deleteMutation = useDeletePipeline()

    // Treat API error as empty data (backend may not exist yet)
    const pipelines = isError ? [] : (data?.pipelines || data?.data || [])

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [pipelineToDelete, setPipelineToDelete] = useState(null)

    const handleStageDrop = async (pipelineId, newStage) => {
        try {
            await updateStageMutation.mutateAsync({
                id: pipelineId,
                opportunityStage: newStage,
            })
            // No success toast - optimistic update provides immediate feedback
        } catch (error) {
            console.error(error)
            toast.error(t("failedToUpdateStage"))
        }
    }

    const handleEdit = (pipeline) => {
        navigate(`/pipeline/edit/${pipeline._id}`)
    }

    const handleDeleteClick = (pipelineId) => {
        setPipelineToDelete(pipelineId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!pipelineToDelete) return

        try {
            await deleteMutation.mutateAsync(pipelineToDelete)
            toast.success(t("opportunityDeletedSuccess"))
            setDeleteDialogOpen(false)
            setPipelineToDelete(null)
        } catch (error) {
            console.error(error)
            toast.error(t("failedToDeleteOpportunity"))
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full">
            {/* Header with fixed Add button */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t("pipeline")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("pipelineDescription")}
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/pipeline/new")}
                    className="shadow-sm shrink-0"
                >
                    <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("addOpportunity")}
                </Button>
            </div>

            {/* Kanban Board - fills remaining height */}
            <div className="flex-1 p-4 overflow-hidden">
                <PipelineBoard
                    pipelines={pipelines}
                    onStageDrop={handleStageDrop}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <CommonDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t("confirmDeleteOpportunity")}
                description={t("deleteOpportunityWarning")}
                variant="destructive"
                confirmText={deleteMutation.isPending ? t("deleting") : t("delete")}
                cancelText={t("cancel")}
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    )
}

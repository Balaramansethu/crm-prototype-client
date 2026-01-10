import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MoreHorizontal, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CommonDialog from "@/components/common/CommonDialog"

import {
    useRestoreLead,
    useRestoreCallLog,
    useRestorePipeline,
} from "@/hooks/useRestoreArchive"

/**
 * Reusable kebab menu component for archived data rows
 * Provides restore action with confirmation dialog
 *
 * @param {Object} props
 * @param {string} props.itemId - The ID of the archived item
 * @param {'pipeline' | 'call-log' | 'lead'} props.itemType - The type of archived item
 */
export function RowActionsMenu({ itemId, itemType }) {
    const { t } = useTranslation()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Use the appropriate hook based on item type
    const restoreLeadMutation = useRestoreLead()
    const restoreCallLogMutation = useRestoreCallLog()
    const restorePipelineMutation = useRestorePipeline()

    const getMutation = () => {
        switch (itemType) {
            case "lead":
                return restoreLeadMutation
            case "call-log":
                return restoreCallLogMutation
            case "pipeline":
                return restorePipelineMutation
            default:
                return restoreLeadMutation
        }
    }

    const mutation = getMutation()
    const isPending = mutation.isPending

    const handleRestoreClick = () => {
        setIsDropdownOpen(false)
        setIsDialogOpen(true)
    }

    const handleConfirmRestore = () => {
        mutation.mutate(itemId, {
            onSuccess: () => {
                toast.success(t("restoreSuccess"))
                setIsDialogOpen(false)
            },
            onError: (error) => {
                const message =
                    error?.response?.data?.message || t("restoreFailed")
                toast.error(message)
            },
        })
    }

    const getTypeLabel = () => {
        switch (itemType) {
            case "pipeline":
                return t("pipeline")
            case "call-log":
                return t("callLog")
            case "lead":
                return t("lead")
            default:
                return t("item")
        }
    }

    return (
        <>
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t("actions")}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t("openMenu")}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onClick={handleRestoreClick}
                        className="cursor-pointer"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("restore")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CommonDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={t("restoreConfirmTitle")}
                description={t("restoreConfirmDescription", {
                    type: getTypeLabel(),
                })}
                variant="info"
                confirmText={isPending ? t("restoring") : t("confirm")}
                cancelText={t("cancel")}
                onConfirm={handleConfirmRestore}
                isLoading={isPending}
            />
        </>
    )
}

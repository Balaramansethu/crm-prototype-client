
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useCallLogs } from "@/hooks/useCallLogs"
import { format } from "date-fns"
import { Loader2, Phone, Calendar, Plus, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteCallLog } from "@/service/callLogsService"
import { toast } from "sonner"
import CommonDialog from "@/components/common/CommonDialog"
import { Trash2 } from "lucide-react"

export default function CallLogsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const { data: callLogs, isLoading: isLoadingLogs, refetch } = useCallLogs()
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [logToDelete, setLogToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (id) => {
        setLogToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!logToDelete) return

        setIsDeleting(true)
        try {
            await deleteCallLog(logToDelete)
            toast.success(t("callLogDeletedSuccess") || "Call log deleted successfully")
            refetch()
            setDeleteDialogOpen(false)
            setLogToDelete(null)
        } catch (error) {
            console.error(error)
            toast.error(t("failedToDeleteCallLog") || "Failed to delete call log")
        } finally {
            setIsDeleting(false)
        }
    }
    
    // Handle data structure
    // We try multiple paths to be robust against axios interceptor variations
    const logsList = callLogs?.data?.callLogs || callLogs?.callLogs || []

    const groupedLogs = logsList.reduce((groups, log) => {
        // Fallback to current date if missing, but preferably use createdAt
        const dateObj = log.createdAt ? new Date(log.createdAt) : new Date()
        const dateKey = format(dateObj, 'PPPP') // e.g. "Monday, November 10, 2025"
        
        if (!groups[dateKey]) {
            groups[dateKey] = []
        }
        groups[dateKey].push(log)
        return groups
    }, {})

    const getBadgeColor = (outcome) => {
        if (!outcome) return "bg-gray-100 text-gray-700"
        const lower = outcome.toLowerCase()
        // Note: Database uses 'intrested' (typo) instead of 'interested'
        if (lower === 'interested' || lower === 'interested') return "bg-green-100 text-green-700"
        if (lower === 'not_interested' || lower === 'not_interested') return "bg-red-100 text-red-700"
        if (lower === 'contacted') return "bg-blue-100 text-blue-700"
        if (lower === 'callback') return "bg-blue-100 text-blue-700"
        if (lower === 'done') return "bg-gray-100 text-gray-700"
        return "bg-gray-100 text-gray-700"
    }

    const getOutcomeText = (outcome) => {
        if (!outcome) return '-'
        const lower = outcome.toLowerCase()
        // Map database values to translation keys
        if (lower === 'intrested' || lower === 'interested') return t('interested')
        if (lower === 'not_intrested' || lower === 'not_interested') return t('not_interested')
        if (lower === 'contacted') return t('contacted')
        if (lower === 'done') return t('done')
        // Fallback: capitalize first letter and replace underscores
        return outcome.charAt(0).toUpperCase() + outcome.slice(1).replace(/_/g, ' ')
    }


    if (isLoadingLogs) {
        return (
            <div className="flex flex-1 items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t("callLogs") || "Call Logs"}
                    </h1>
                </div>
                <Button onClick={() => navigate("/call-logs/new")} className="shadow-sm">
                    <Plus className="h-4 w-4" />
                    {t("createCallLog") || "Create Log"}
                </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8">
                {Object.keys(groupedLogs).length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed text-muted-foreground bg-muted/30">
                        <p>No call logs found.</p>
                    </div>
                ) : (
                    Object.entries(groupedLogs).map(([date, logs]) => (
                        <div key={date} className="flex flex-col gap-3">
                            <h2 className="text-muted-foreground font-medium px-1">{date}</h2>
                            <div className="flex flex-col gap-3">
                                {logs.map((log) => (
                                    <div 
                                        key={log._id || Math.random()} 
                                        className="bg-card rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-colors hover:bg-muted/30"
                                    >
                                        {/* Card Header Row */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {/* Company Name */}
                                                <h3 className="font-bold text-base text-card-foreground">
                                                    {log.lead?.company || "Unknown Company"}
                                                </h3>
                                                {/* Contact Person */}
                                                <div className="text-muted-foreground text-sm">
                                                    {log.lead?.contact || "Unknown Contact"}
                                                </div>
                                            </div>
                                            
                                            {/* Badge & Time & Actions */}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(log.outcome)}`}>
                                                        {getOutcomeText(log.outcome)}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => navigate(`/call-logs/edit/${log._id || log.id}`)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                {t("edit")}
                                                            </DropdownMenuItem>
                                                            {user.role !== "employee" && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDeleteClick(log._id || log.id)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    {t("delete")}
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <span className="text-xs text-muted-foreground mr-10">
                                                    {log.createdAt ? format(new Date(log.createdAt), 'h:mm a') : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contact Info Row */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span dir="ltr">
                                                    {log.lead?.phone?.number || (log.lead?.phone ? log.lead.phone : "No Number")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    Follow-up: {log.followUp ? format(new Date(log.followUp), 'MMM d, yyyy') : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        <div className="text-sm text-card-foreground">
                                            {log.remarks}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <CommonDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t("deleteCallLog") || "Delete Call Log"}
                description={t("confirmDeleteCallLog") || "Are you sure you want to delete this call log? This action cannot be undone."}
                variant="destructive"
                confirmLabel={t("delete") || "Delete"}
                cancelLabel={t("cancel") || "Cancel"}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            />
        </div>
    )
}

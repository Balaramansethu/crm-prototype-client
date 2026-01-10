import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import {
    Loader2,
    Phone,
    Plus,
    MoreHorizontal,
    Pencil,
    Archive,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/userStore"
import { useCallLogs } from "@/hooks/useCallLogs"
import { useDeleteCallLog } from "@/hooks/useCallLog"
import { toast } from "sonner"
import CommonDialog from "@/components/common/CommonDialog"
import { CALL_OUTCOME_OPTIONS } from "@/constants/formOptions"
import { cn, enumToTranslationKey, getOutcomeColor } from "@/lib/utils"

export default function CallLogsPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const isRTL = i18n.dir() === "rtl"

    // Filter state
    const [outcome, setOutcome] = useState("all")
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [sort, setSort] = useState("")
    const [order, setOrder] = useState("desc")

    // Build query params
    const queryParams = useMemo(() => {
        const params = { page, limit }
        if (outcome && outcome !== "all") {
            params.outcome = outcome
        }
        if (sort) {
            params.sort = sort
            params.order = order
        }
        return params
    }, [page, limit, outcome, sort, order])

    const { data, isLoading, isFetching, isError } = useCallLogs(queryParams)
    const deleteCallLogMutation = useDeleteCallLog()

    const callLogs = data?.callLogs || []
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [logToDelete, setLogToDelete] = useState(null)

    const handleDeleteClick = (id) => {
        setLogToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!logToDelete) return

        try {
            await deleteCallLogMutation.mutateAsync(logToDelete)
            toast.success(t("callLogArchivedSuccess"))
            setDeleteDialogOpen(false)
            setLogToDelete(null)
        } catch (error) {
            console.error(error)
            toast.error(t("failedToArchiveCallLog"))
        }
    }

    const clearFilters = () => {
        setOutcome("all")
        setPage(1)
    }

    const handleSort = (field) => {
        if (sort === field) {
            setOrder(order === "asc" ? "desc" : "asc")
        } else {
            setSort(field)
            setOrder("asc")
        }
    }

    const renderSortIcon = (field) => {
        if (sort !== field)
            return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />
        return (
            <ArrowUpDown
                className={cn("ml-2 h-3 w-3", order === "desc" && "rotate-180")}
            />
        )
    }

    const hasActiveFilters = outcome && outcome !== "all"

    const getOutcomeText = (outcomeVal) => {
        if (!outcomeVal) return "-"
        return t(enumToTranslationKey(outcomeVal, "outcome"))
    }

    const formatPhone = (phone) => {
        if (!phone?.number) return "-"
        return `${phone.extension || ""} ${phone.number}`.trim()
    }

    const formatDate = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "dd MMM yyyy")
        } catch {
            return "-"
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return "-"
        try {
            return format(new Date(dateString), "hh:mm a")
        } catch {
            return "-"
        }
    }

    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "-"
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        const hh = String(hrs).padStart(2, "0")
        const mm = String(mins).padStart(2, "0")
        const ss = String(secs).padStart(2, "0")
        return `${hh}:${mm}:${ss}`
    }

    // Get company name from lead
    const getCompanyName = (lead) => {
        if (!lead) return t("unknownCompany")
        if (typeof lead.company === "object") return lead.company?.name || "-"
        return lead.company || "-"
    }

    // Get contact name from lead
    const getContactName = (lead) => {
        if (!lead) return t("unknownContact")
        if (lead.name) return lead.name
        if (typeof lead.contact === "object") return lead.contact?.name || "-"
        return lead.contact || "-"
    }

    // Get phone from lead
    const getLeadPhone = (lead) => {
        if (!lead) return "-"
        if (lead.phone?.number) return formatPhone(lead.phone)
        if (lead.contact?.phone?.number) return formatPhone(lead.contact.phone)
        if (lead.company?.phone?.number) return formatPhone(lead.company.phone)
        return "-"
    }

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {t("callLogs")}
                    </h1>
                </div>
                <Button
                    onClick={() => navigate("/call-logs/new")}
                    className="shadow-sm w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    {t("createCallLog")}
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
                {/* Filter Toolbar */}
                <div className="flex flex-col gap-3 sm:gap-4 border-b p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                        {/* Outcome Filter */}
                        <div className="w-full md:w-[250px]">
                            <Select
                                value={outcome}
                                onValueChange={(val) => {
                                    setOutcome(val)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="h-9 bg-muted/50 focus:bg-background border-input">
                                    <div className="flex items-center gap-2 w-full overflow-hidden">
                                        <Filter className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                        <span
                                            className={cn(
                                                "truncate text-left flex-1",
                                                outcome && outcome !== "all"
                                                    ? "text-black"
                                                    : "text-gray-500",
                                            )}
                                        >
                                            {outcome && outcome !== "all"
                                                ? t(
                                                      enumToTranslationKey(
                                                          outcome,
                                                          "outcome",
                                                      ),
                                                  )
                                                : t("filterByOutcome")}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("all")}
                                    </SelectItem>
                                    {CALL_OUTCOME_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs font-medium",
                                                    option.color,
                                                )}
                                            >
                                                {t(option.label)}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            size="sm"
                            className="h-9 px-3 text-black hover:text-black shrink-0"
                        >
                            <X className="mr-2 h-3.5 w-3.5" />
                            {t("clearFilters")}
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors w-[150px] pl-4"
                                    onClick={() => handleSort("company")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("company")}
                                        {renderSortIcon("company")}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort("contact")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("contact")}
                                        {renderSortIcon("contact")}
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    <div className="text-xs font-bold uppercase tracking-wider text-black">
                                        {t("phone")}
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="text-xs font-bold uppercase tracking-wider text-black">
                                        {t("outcome")}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="hidden sm:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort("followUp")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("followUp")}
                                        {renderSortIcon("followUp")}
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    <div className="text-xs font-bold uppercase tracking-wider text-black">
                                        {t("callStartTime")}
                                    </div>
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    <div className="text-xs font-bold uppercase tracking-wider text-black">
                                        {t("callDuration")}
                                    </div>
                                </TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-40 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2 text-black">
                                            <Loader2 className="h-6 w-6 animate-spin text-black" />
                                            <span className="text-sm">
                                                {t("loading")}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-40 text-center text-red-600 font-bold"
                                    >
                                        {t("failedToLoadCallLog")}
                                    </TableCell>
                                </TableRow>
                            ) : callLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-40 text-center text-black"
                                    >
                                        {t("noDataAvailable")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                callLogs.map((log) => (
                                    <TableRow
                                        key={log._id}
                                        className="hover:bg-muted/30 cursor-pointer"
                                        onClick={() =>
                                            navigate(`/call-logs/${log._id}`)
                                        }
                                    >
                                        <TableCell className="font-bold text-black pl-4">
                                            {getCompanyName(log.lead)}
                                        </TableCell>
                                        <TableCell className="text-black">
                                            {getContactName(log.lead)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div
                                                className="flex items-center gap-1.5 text-sm text-black tabular-nums"
                                                dir="ltr"
                                            >
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                {getLeadPhone(log.lead)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-semibold",
                                                    getOutcomeColor(
                                                        log.outcome ||
                                                            log.lead?.status,
                                                    ),
                                                )}
                                            >
                                                {getOutcomeText(
                                                    log.outcome ||
                                                        log.lead?.status,
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-black text-sm">
                                            {formatDate(log.followUp)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-black text-sm tabular-nums">
                                            {formatTime(log.callStartTime)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-black text-sm tabular-nums">
                                            {formatDuration(log.callDuration)}
                                        </TableCell>
                                        <TableCell
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate(
                                                                `/call-logs/edit/${log._id}`,
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    {user.role !==
                                                        "employee" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    log._id,
                                                                )
                                                            }
                                                            className="text-primary focus:text-primary"
                                                        >
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            {t("archive")}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        {t("showingLeads", {
                            start:
                                pagination.total > 0
                                    ? (pagination.page - 1) * limit + 1
                                    : 0,
                            end: Math.min(
                                pagination.page * limit,
                                pagination.total,
                            ),
                            total: pagination.total,
                        })}
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft
                                    className={cn(
                                        "h-4 w-4",
                                        isRTL && "rotate-180",
                                    )}
                                />
                                {t("previous")}
                            </Button>
                            <span className="text-sm text-muted-foreground px-2">
                                {t("pageIndicator", {
                                    page: pagination.page,
                                    totalPages: pagination.totalPages,
                                })}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(pagination.totalPages, p + 1),
                                    )
                                }
                                disabled={
                                    pagination.page >= pagination.totalPages
                                }
                            >
                                {t("next")}
                                <ChevronRight
                                    className={cn(
                                        "h-4 w-4",
                                        isRTL && "rotate-180",
                                    )}
                                />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Archive Confirmation Dialog */}
            <CommonDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t("confirmArchiveCallLog")}
                description={t("archiveCallLogMessage")}
                variant="destructive"
                confirmLabel={
                    deleteCallLogMutation.isPending
                        ? t("archiving")
                        : t("archive")
                }
                cancelLabel={t("cancel")}
                onConfirm={confirmDelete}
                isLoading={deleteCallLogMutation.isPending}
            />
        </div>
    )
}

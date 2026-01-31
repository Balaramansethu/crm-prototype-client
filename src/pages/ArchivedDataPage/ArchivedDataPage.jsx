import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
    useArchivedLeads,
    useArchivedCallLogs,
    useArchivedPipelines,
} from "@/hooks/useArchivedData"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { RowActionsMenu } from "@/components/common/RowActionsMenu"
import { getStageTranslationKey } from "@/constants/pipelineOptions"

// Chrome-style Tab Component with smooth curved edges
function ChromeTab({ label, isActive, onClick }) {
    return (
        <div className="relative h-12 flex items-end">
            <button
                onClick={onClick}
                className={cn(
                    "relative px-6 pb-3 pt-2 text-sm font-medium transition-all duration-200",
                    "overflow-visible",
                    isActive
                        ? "text-gray-900 z-10"
                        : "text-gray-600 hover:text-gray-900 z-0",
                )}
                style={{ marginBottom: "-1px" }}
            >
                {/* Tab Background SVG */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    style={{
                        left: "-10px",
                        width: "calc(100% + 20px)",
                        height: "100%",
                        zIndex: -1,
                    }}
                    viewBox="0 0 140 48"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 10,48 Q 10,40 18,40 L 122,40 Q 130,40 130,48"
                        fill={isActive ? "white" : "rgb(243 244 246 / 0.7)"}
                        stroke={isActive ? "rgb(209 213 219)" : "transparent"}
                        strokeWidth="1"
                    />
                </svg>

                {/* Label with pill badge for active tab */}
                <span className="relative z-10 flex items-center gap-2">
                    {label}
                    {isActive && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                    )}
                </span>
            </button>
        </div>
    )
}

// Role Badge Component
function RoleBadge({ role }) {
    const { t } = useTranslation()

    const roleStyles = {
        super_admin: "bg-purple-100 text-purple-800",
        admin: "bg-primary/10 text-primary",
        employee: "bg-green-100 text-green-800",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                roleStyles[role] || "bg-gray-100 text-gray-800",
            )}
        >
            {t(role) || role}
        </span>
    )
}

// Outcome Badge Component for Call Logs
function OutcomeBadge({ outcome }) {
    const { t } = useTranslation()

    const outcomeStyles = {
        interested: "bg-teal-100 text-teal-800",
        not_interested: "bg-rose-100 text-rose-800",
        follow_up_needed: "bg-orange-100 text-orange-800",
        promoted_to_meeting: "bg-indigo-100 text-indigo-800",
        conversion_in_progress: "bg-violet-100 text-violet-800",
        qualified: "bg-emerald-100 text-emerald-800",
        new: "bg-sky-100 text-sky-800",
        contacted_by_email: "bg-amber-100 text-amber-800",
        dropped: "bg-slate-200 text-slate-700",
    }

    if (!outcome) return <span>-</span>

    // Convert snake_case to translation key format
    const translationKey = outcome
        .split("_")
        .map((word, index) =>
            index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join("")

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                outcomeStyles[outcome] || "bg-gray-100 text-gray-800",
            )}
        >
            {t(`outcome${translationKey.charAt(0).toUpperCase() + translationKey.slice(1)}`) || t(outcome) || outcome}
        </span>
    )
}

// Pagination Component
function Pagination({ page, setPage, info, t, isRTL, type = "items" }) {
    const totalPages = info?.totalPages || 1
    const total = info?.total || 0
    const limit = info?.limit || 10
    const hasMoreRecords = info?.hasMoreRecords || false

    if (total === 0) return null

    return (
        <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-black">
                {t("showingItems", {
                    start: (page - 1) * limit + 1,
                    end: Math.min(page * limit, total),
                    total: total,
                    type: type,
                })}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    {isRTL ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                    {t("previous")}
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                    {t("pageIndicator", {
                        page: page,
                        totalPages: totalPages,
                    })}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMoreRecords && page >= totalPages}
                >
                    {t("next")}
                    {isRTL ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}

// Archived Leads Table
function ArchivedLeadsTable({ page, setPage }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const { data, isLoading, isError } = useArchivedLeads({ page, limit: 10 })

    // Parse the actual API response structure: data.leads is an array of {leads: [], company: {}}
    const { leads, info } = useMemo(() => {
        if (!data) return { leads: [], info: {} }

        const rawLeads = data.leads || []
        const flattened = []

        rawLeads.forEach((item) => {
            const company = item.company || {}
            const contactLeads = item.leads || []
            contactLeads.forEach((lead) => {
                flattened.push({
                    ...lead,
                    companyName: company.name || "-",
                })
            })
        })

        return {
            leads: flattened,
            info: data.info || { total: 0, totalPages: 1 },
        }
    }, [data])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">
                    {t("loadingArchivedData")}
                </span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-12 text-red-600">
                {t("failedToLoadLeads")}
            </div>
        )
    }

    if (leads.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {t("noArchivedData")}
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black pl-4">
                            {t("company")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("contact")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedBy")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedByRole")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedAt")}
                        </TableHead>
                        <TableHead className="w-16"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-black pl-4">
                                {lead.companyName}
                            </TableCell>
                            <TableCell className="text-black">
                                {lead.name || "-"}
                            </TableCell>
                            <TableCell className="text-black">
                                {lead.deleted?.by
                                    ? `${lead.deleted.by.firstName} ${lead.deleted.by.lastName}`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {lead.deleted?.by?.role ? (
                                    <RoleBadge role={lead.deleted.by.role} />
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="text-black">
                                {lead.deleted?.at
                                    ? format(
                                          new Date(lead.deleted.at),
                                          "dd-MM-yyyy HH:mm",
                                      )
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <RowActionsMenu
                                    itemId={lead._id}
                                    itemType="lead"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                page={page}
                setPage={setPage}
                info={info}
                t={t}
                isRTL={isRTL}
                type={t("leads")}
            />
        </>
    )
}

// Archived Call Logs Table
function ArchivedCallLogsTable({ page, setPage }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const { data, isLoading, isError } = useArchivedCallLogs({
        page,
        limit: 10,
    })

    const { callLogs, info } = useMemo(() => {
        if (!data) return { callLogs: [], info: {} }

        // Call logs might have different structure - adjust as needed
        const rawLogs = data.callLogs || data.logs || []

        return {
            callLogs: Array.isArray(rawLogs) ? rawLogs : [],
            info: data.info || { total: 0, totalPages: 1 },
        }
    }, [data])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">
                    {t("loadingArchivedData")}
                </span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-12 text-red-600">
                {t("failedToLoadCallLog")}
            </div>
        )
    }

    if (callLogs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {t("noArchivedData")}
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black pl-4">
                            {t("company")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("contactPerson")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("phone")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("outcome")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedBy")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedByRole")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedAt")}
                        </TableHead>
                        <TableHead className="w-16"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {callLogs.map((log) => (
                        <TableRow key={log._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-black pl-4">
                                {log.lead?.company?.name || "-"}
                            </TableCell>
                            <TableCell className="text-black">
                                {log.lead?.name || "-"}
                            </TableCell>
                            <TableCell
                                className="text-black tabular-nums"
                                dir="ltr"
                            >
                                {log.lead?.phone?.extension &&
                                log.lead?.phone?.number
                                    ? `${log.lead.phone.extension} ${log.lead.phone.number}`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <OutcomeBadge outcome={log.outcome} />
                            </TableCell>
                            <TableCell className="text-black">
                                {log.deleted?.by
                                    ? `${log.deleted.by.firstName} ${log.deleted.by.lastName}`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {log.deleted?.by?.role ? (
                                    <RoleBadge role={log.deleted.by.role} />
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="text-black">
                                {log.deleted?.at
                                    ? format(
                                          new Date(log.deleted.at),
                                          "dd-MM-yyyy HH:mm",
                                      )
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <RowActionsMenu
                                    itemId={log._id}
                                    itemType="call-log"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                page={page}
                setPage={setPage}
                info={info}
                t={t}
                isRTL={isRTL}
                type={t("callLogs")}
            />
        </>
    )
}

// Archived Pipelines Table
function ArchivedPipelinesTable({ page, setPage }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const { data, isLoading, isError } = useArchivedPipelines({
        page,
        limit: 10,
    })

    const { pipelines, info } = useMemo(() => {
        if (!data) return { pipelines: [], info: {} }

        // Pipelines might have different structure - adjust as needed
        const rawPipelines = data.pipelines || data.opportunities || []

        return {
            pipelines: Array.isArray(rawPipelines) ? rawPipelines : [],
            info: data.info || { total: 0, totalPages: 1 },
        }
    }, [data])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">
                    {t("loadingArchivedData")}
                </span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-center py-12 text-red-600">
                {t("failedToLoadPipeline")}
            </div>
        )
    }

    if (pipelines.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {t("noArchivedData")}
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black pl-4">
                            {t("lead")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("opportunityStage")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedBy")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedByRole")}
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-black">
                            {t("deletedAt")}
                        </TableHead>
                        <TableHead className="w-16"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pipelines.map((pipeline) => (
                        <TableRow
                            key={pipeline._id}
                            className="hover:bg-muted/30"
                        >
                            <TableCell className="font-medium text-black pl-4">
                                {pipeline.company?.name || "-"}
                            </TableCell>
                            <TableCell className="text-black">
                                {t(
                                    getStageTranslationKey(
                                        pipeline.opportunityStage,
                                    ),
                                ) ||
                                    pipeline.opportunityStage ||
                                    "-"}
                            </TableCell>
                            <TableCell className="text-black">
                                {pipeline.deleted?.by
                                    ? `${pipeline.deleted.by.firstName} ${pipeline.deleted.by.lastName}`
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                {pipeline.deleted?.by?.role ? (
                                    <RoleBadge
                                        role={pipeline.deleted.by.role}
                                    />
                                ) : (
                                    "-"
                                )}
                            </TableCell>
                            <TableCell className="text-black">
                                {pipeline.deleted?.at
                                    ? format(
                                          new Date(pipeline.deleted.at),
                                          "dd-MM-yyyy HH:mm",
                                      )
                                    : "-"}
                            </TableCell>
                            <TableCell>
                                <RowActionsMenu
                                    itemId={pipeline._id}
                                    itemType="pipeline"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                page={page}
                setPage={setPage}
                info={info}
                t={t}
                isRTL={isRTL}
                type={t("pipeline")}
            />
        </>
    )
}

// Main Page Component
export default function ArchivedDataPage() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState("leads")

    // Separate pagination state for each tab
    const [leadsPage, setLeadsPage] = useState(1)
    const [callLogsPage, setCallLogsPage] = useState(1)
    const [pipelinesPage, setPipelinesPage] = useState(1)

    const tabs = [
        { id: "leads", label: t("leads") },
        { id: "callLogs", label: t("callLogs") },
        { id: "pipeline", label: t("pipeline") },
    ]

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {t("archivedData")}
                    </h1>
                </div>
            </div>

            {/* Chrome-style Tabs Container */}
            <div className="flex flex-col shadow-md rounded-xl overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-end bg-gray-50 border-b border-gray-200 px-2 pt-2 gap-1">
                    {tabs.map((tab) => (
                        <ChromeTab
                            key={tab.id}
                            label={tab.label}
                            isActive={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                        />
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex flex-col bg-white">
                    <div className="overflow-x-auto transition-opacity duration-200">
                        {activeTab === "leads" && (
                            <ArchivedLeadsTable
                                page={leadsPage}
                                setPage={setLeadsPage}
                            />
                        )}
                        {activeTab === "callLogs" && (
                            <ArchivedCallLogsTable
                                page={callLogsPage}
                                setPage={setCallLogsPage}
                            />
                        )}
                        {activeTab === "pipeline" && (
                            <ArchivedPipelinesTable
                                page={pipelinesPage}
                                setPage={setPipelinesPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

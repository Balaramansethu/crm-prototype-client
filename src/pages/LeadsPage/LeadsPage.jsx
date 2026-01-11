import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLeads } from "@/hooks/useLeads"
import { useUserStore } from "@/store/userStore"
import { useDebounce } from "@/hooks/useDebounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Loader2,
    Plus,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    X,
    Search,
    Filter,
    Check,
    ChevronsUpDown,
    MoreHorizontal,
    Trash2,
    Archive,
    User,
    Globe,
    Edit,
    Briefcase,
} from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn, enumToTranslationKey } from "@/lib/utils"
import { StatusBadge } from "@/components/common"
import { SERVICE_TYPE_OPTIONS } from "@/constants/formOptions"
import { deleteLead } from "@/service/leadsService"
import { toast } from "sonner"
import CommonDialog from "@/components/common/CommonDialog"

export default function LeadsPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const user = useUserStore((s) => s.user)
    const isRTL = i18n.dir() === "rtl"

    // Initialize state from URL params
    const initialPage = parseInt(searchParams.get("page")) || 1

    // State for filters and pagination
    const [page, setPage] = useState(initialPage)
    const [limit, setLimit] = useState(10)
    const [sort, setSort] = useState("createdAt")
    const [order, setOrder] = useState("desc")
    const [contact, setContact] = useState("")
    const [company, setCompany] = useState("")
    const [status, setStatus] = useState("")
    const [serviceType, setServiceType] = useState("")
    const [followUp, setFollowUp] = useState()

    // Sync page state with URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (page > 1) {
            params.set("page", page.toString())
        } else {
            params.delete("page")
        }
        setSearchParams(params, { replace: true })
    }, [page, setSearchParams])

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [leadToDelete, setLeadToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Debounce search inputs
    const debouncedContact = useDebounce(contact, 500)
    const debouncedCompany = useDebounce(company, 500)

    // Fetch data
    const { data, isLoading, isError, refetch } = useLeads({
        page,
        limit,
        sort,
        order,
        contact: debouncedContact,
        company: debouncedCompany,
        status: status === "all" ? "" : status,
        serviceType: serviceType === "all" ? "" : serviceType,
        followUp: followUp ? format(followUp, "yyyy-MM-dd") : "",
    })

    const rawLeads = data?.leads || []
    const info = data?.info || { total: 0, totalPages: 1 }

    // Flatten the nested structure: each company with its leads becomes multiple rows
    // Each row: { company, lead, companyId, leadIndex }
    const leads = useMemo(() => {
        const flattened = []
        rawLeads.forEach((item) => {
            const company = item.company || {}
            const contactLeads = item.leads || []

            // Filter out leads with null/empty names (company-only placeholder entries)
            const validLeads = contactLeads.filter(
                (lead) => lead.name && lead.name.trim(),
            )

            if (validLeads.length > 0) {
                validLeads.forEach((lead, index) => {
                    flattened.push({
                        _id: lead._id,
                        companyId: company._id,
                        company,
                        contact: lead,
                        leadIndex: index,
                        source: lead.source,
                        status: lead.status,
                        followUp: lead.followUp,
                        isCompanyOnly: false,
                    })
                })
            } else {
                // Company with no valid contacts - show company only
                // If there's a placeholder lead (name: null), use its ID
                const firstLead = contactLeads[0]
                flattened.push({
                    _id: firstLead?._id || company._id, // Use lead ID if available, fallback to company ID
                    companyId: company._id,
                    company,
                    contact: firstLead || null,
                    leadIndex: 0,
                    source: firstLead?.source || company.socialProfile || "",
                    status: firstLead?.status || "new",
                    followUp: firstLead?.followUp || null,
                    isCompanyOnly: true,
                    email: firstLead?.email || company.email || "",
                })
            }
        })
        return flattened
    }, [rawLeads])

    const handleDeleteClick = (id) => {
        setLeadToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!leadToDelete) return

        setIsDeleting(true)
        try {
            await deleteLead(leadToDelete)
            toast.success(t("leadArchivedSuccess"))
            refetch()
            setDeleteDialogOpen(false)
            setLeadToDelete(null)
        } catch (error) {
            console.error(error)
            toast.error(t("failedToArchiveLead"))
        } finally {
            setIsDeleting(false)
        }
    }

    // Handlers
    const handleSort = (field) => {
        if (sort === field) {
            setOrder(order === "asc" ? "desc" : "asc")
        } else {
            setSort(field)
            setOrder("asc")
        }
    }

    const clearFilters = () => {
        setContact("")
        setCompany("")
        setStatus("")
        setServiceType("")
        setFollowUp(undefined)
        setPage(1)
    }

    const renderSortIcon = (field) => {
        if (sort !== field)
            return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />
        return (
            <ArrowUpDown
                className={`ml-2 h-3 w-3 text-primary ${order === "desc" ? "rotate-180" : ""}`}
            />
        )
    }

    const hasActiveFilters =
        contact ||
        company ||
        (status && status !== "all") ||
        (serviceType && serviceType !== "all") ||
        followUp

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {t("leads")}
                    </h1>
                </div>
                <Button
                    onClick={() => navigate("/leads/new")}
                    className="shadow-sm w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    {t("createLead")}
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
                {/* Filter Toolbar */}
                <div className="flex flex-col gap-3 sm:gap-4 border-b p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                        {/* Contact Search */}
                        <div className="relative flex-1 md:max-w-[240px]">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder={t("filterByContact")}
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="pl-9 h-9 bg-muted/50 focus:bg-background transition-colors text-black placeholder:text-gray-500"
                            />
                        </div>

                        {/* Company Search */}
                        <div className="relative flex-1 md:max-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder={t("filterByCompany")}
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="pl-9 h-9 bg-muted/50 focus:bg-background transition-colors text-black placeholder:text-gray-500"
                            />
                        </div>

                        {/* Service Type Filter */}
                        <div className="md:w-[230px]">
                            <Select
                                value={serviceType}
                                onValueChange={setServiceType}
                            >
                                <SelectTrigger className="h-9 bg-muted/50 focus:bg-background border-input">
                                    <div className="flex items-center gap-2 w-full overflow-hidden">
                                        <Briefcase className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                        <span
                                            className={cn(
                                                "truncate text-left flex-1",
                                                serviceType &&
                                                    serviceType !== "all"
                                                    ? "text-black"
                                                    : "text-gray-500",
                                            )}
                                        >
                                            {serviceType &&
                                            serviceType !== "all"
                                                ? SERVICE_TYPE_OPTIONS.find(
                                                      (opt) =>
                                                          opt.value ===
                                                          serviceType,
                                                  )?.label
                                                    ? t(
                                                          SERVICE_TYPE_OPTIONS.find(
                                                              (opt) =>
                                                                  opt.value ===
                                                                  serviceType,
                                                          ).label,
                                                      )
                                                    : serviceType
                                                : t("filterByServiceType")}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("all")}
                                    </SelectItem>
                                    {SERVICE_TYPE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {t(option.label)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="md:w-[170px]">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-9 bg-muted/50 focus:bg-background border-input">
                                    <div className="flex items-center gap-2 w-full overflow-hidden">
                                        <Filter className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                        <span
                                            className={cn(
                                                "truncate text-left flex-1",
                                                status && status !== "all"
                                                    ? "text-black"
                                                    : "text-gray-500",
                                            )}
                                        >
                                            {status && status !== "all"
                                                ? t(status) || status
                                                : t("status")}
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("all")}
                                    </SelectItem>
                                    <SelectItem value="new">
                                        {t("new")}
                                    </SelectItem>
                                    <SelectItem value="qualified">
                                        {t("qualified")}
                                    </SelectItem>
                                    <SelectItem value="contacted">
                                        {t("contacted")}
                                    </SelectItem>
                                    <SelectItem value="done">
                                        {t("done")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter */}
                        <div className="md:w-[180px]">
                            <DatePicker
                                selected={followUp}
                                onChange={(date) => {
                                    if (date) {
                                        // Create date at local noon to avoid timezone shifts
                                        const newDate = new Date(
                                            date.getFullYear(),
                                            date.getMonth(),
                                            date.getDate(),
                                            12,
                                            0,
                                            0,
                                        )
                                        setFollowUp(newDate)
                                    } else {
                                        setFollowUp(null)
                                    }
                                }}
                                placeholderText={t("followUp")}
                                dateFormat="dd-MM-yyyy"
                                className="w-full h-9 px-3 rounded-md border border-input bg-muted/50 text-sm focus:bg-background transition-colors text-black placeholder:text-gray-500"
                                wrapperClassName="w-full"
                                showPopperArrow={false}
                                isClearable
                            />
                        </div>
                    </div>

                    {/* Clear Filters - Only show if active */}
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
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors hidden md:table-cell"
                                    onClick={() =>
                                        handleSort("company.serviceType")
                                    }
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("serviceType")}
                                        {renderSortIcon("company.serviceType")}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors hidden lg:table-cell"
                                    onClick={() => handleSort("email")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("email")}
                                        {renderSortIcon("email")}
                                    </div>
                                </TableHead>
                                <TableHead className="hidden xl:table-cell text-xs font-bold uppercase tracking-wider text-black">
                                    {t("phone")}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("status")}
                                        {renderSortIcon("status")}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 transition-colors hidden md:table-cell"
                                    onClick={() => handleSort("followUp")}
                                >
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black">
                                        {t("followUp")}
                                        {renderSortIcon("followUp")}
                                    </div>
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
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
                                                {t("loadingLeads")}
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
                                        {t("failedToLoadLeads")}
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-40 text-center text-black"
                                    >
                                        {t("noLeadsFound")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => (
                                    <TableRow
                                        key={`${lead.companyId}-${lead.leadIndex}`}
                                        className="hover:bg-muted/30 text-black cursor-pointer"
                                        onClick={() =>
                                            navigate(`/leads/${lead._id}`, {
                                                state: { fromPage: page }
                                            })
                                        }
                                    >
                                        <TableCell className="font-bold text-black pl-4">
                                            {lead.company?.name || ""}
                                        </TableCell>
                                        <TableCell className="text-black">
                                            {lead.isCompanyOnly ? (
                                                <span className="text-gray-400 italic">
                                                    {t("noLeads")}
                                                </span>
                                            ) : (
                                                lead.contact?.name || "-"
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-black text-sm">
                                            {lead.company?.serviceType
                                                ? t(
                                                      enumToTranslationKey(
                                                          lead.company
                                                              .serviceType,
                                                      ),
                                                  )
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-black text-sm">
                                            {lead.contact?.email ||
                                                lead.company?.email ||
                                                "-"}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell text-sm text-black tabular-nums">
                                            <span dir="ltr">
                                                {lead.isCompanyOnly ? (
                                                    // Show company phone for company-only rows
                                                    <>
                                                        {lead.company?.phone
                                                            ?.extension
                                                            ? `${lead.company.phone.extension} `
                                                            : ""}
                                                        {lead.company?.phone
                                                            ?.number || "-"}
                                                    </>
                                                ) : (
                                                    // Show contact phone for lead rows
                                                    <>
                                                        {lead.contact?.phone
                                                            ?.extension
                                                            ? `${lead.contact.phone.extension} `
                                                            : ""}
                                                        {lead.contact?.phone
                                                            ?.number || "-"}
                                                    </>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={lead.status} />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-black">
                                            {lead.followUp
                                                ? format(
                                                      new Date(lead.followUp),
                                                      "dd-MM-yyyy",
                                                  )
                                                : "-"}
                                        </TableCell>
                                        <TableCell
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu
                                                dir={isRTL ? "rtl" : "ltr"}
                                            >
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            {t("openMenu")}
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align={
                                                        isRTL ? "start" : "end"
                                                    }
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate(
                                                                `/leads/edit/${lead._id}`,
                                                            )
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    {user.role !==
                                                        "employee" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    lead._id,
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

                {/* Footer / Pagination */}
                {!isLoading && leads.length > 0 && (
                    <div className="flex items-center justify-between border-t p-4">
                        <div className="text-sm text-black">
                            {t("showingLeads", {
                                start: (page - 1) * limit + 1,
                                end: Math.min(page * limit, info.total),
                                total: info.total,
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
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
                                    totalPages: info.totalPages || 1,
                                })}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={
                                    !info.hasMoreRecords &&
                                    page >= (info.totalPages || 1)
                                }
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
                )}
            </div>

            <CommonDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={t("confirmArchiveLead")}
                description={t("archiveLeadMessage")}
                variant="destructive"
                confirmText={isDeleting ? t("archiving") : t("archive")}
                cancelText={t("cancel")}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
            />
        </div>
    )
}

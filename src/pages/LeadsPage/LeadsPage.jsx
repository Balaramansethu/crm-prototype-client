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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
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
    Calendar,
    SlidersHorizontal,
} from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn, enumToTranslationKey } from "@/lib/utils"
import { StatusBadge } from "@/components/common"
import { SERVICE_TYPE_OPTIONS } from "@/constants/formOptions"
import { deleteLead } from "@/service/leadsService"
import { toast } from "sonner"
import CommonDialog from "@/components/common/CommonDialog"
import { formatPhoneDisplay } from "@/utils/leadTransformers"

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
    const [serviceTypes, setServiceTypes] = useState([])
    const [followUp, setFollowUp] = useState()
    const [showFilters, setShowFilters] = useState(false)
    const [ownerSearch, setOwnerSearch] = useState(
        searchParams.get("owner") || "",
    )

    const isSuperAdminUser =
        user?.role === "SUPER_ADMIN" || user?.role === "super_admin"
    const debouncedOwner = useDebounce(ownerSearch, 500)

    // Sync owner search to URL
    useEffect(() => {
        if (!isSuperAdminUser) return

        const params = new URLSearchParams(searchParams)
        if (debouncedOwner) {
            if (searchParams.get("owner") !== debouncedOwner) setPage(1)
            params.set("owner", debouncedOwner)
        } else {
            if (searchParams.get("owner")) setPage(1)
            params.delete("owner")
        }
        setSearchParams(params, { replace: true })
    }, [debouncedOwner, isSuperAdminUser, setSearchParams, searchParams])

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
        owner: isSuperAdminUser ? debouncedOwner : undefined,
        status: status === "all" ? "" : status,
        ...(serviceTypes.length > 0 && { serviceType: serviceTypes }),
        followUp: followUp ? format(followUp, "yyyy-MM-dd") : "",
    })

    const rawLeads = data?.leads || []
    const info = data?.info || { total: 0, totalPages: 1 }

    // Each company group from the API becomes a single grid row
    // Use the first lead's _id for navigation (GET-by-ID returns all contacts)
    const leads = useMemo(() => {
        return rawLeads.map((item) => {
            const company = item.company || {}
            const contactLeads = item.leads || []
            // Sort by priority to pick the primary lead
            const sorted = [...contactLeads].sort(
                (a, b) => (a.priority || 99) - (b.priority || 99),
            )
            const firstLead = sorted[0] || null

            return {
                _id: firstLead?._id || company._id,
                companyId: company._id,
                company,
                leadsCount: contactLeads.length,
                // Use first lead's data for status/followUp/createdBy columns
                status: firstLead?.status || "new",
                followUp: firstLead?.followUp || null,
                createdBy: firstLead?.createdBy || null,
            }
        })
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

    const toggleServiceType = (value) => {
        setServiceTypes((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        )
        setPage(1)
    }

    const clearFilters = () => {
        setContact("")
        setCompany("")
        setStatus("")
        setServiceTypes([])
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
        serviceTypes.length > 0 ||
        followUp

    return (
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 min-w-0">
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
            <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm min-w-0">
                {/* Filter Toolbar */}
                <div className="flex flex-col gap-3 sm:gap-4 border-b p-3 sm:p-4">
                    {/* Mobile Filter Toggle Button */}
                    <div className="flex items-center justify-between md:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="h-9 gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {t("filters")}
                            {hasActiveFilters && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {
                                        [
                                            contact,
                                            company,
                                            status && status !== "all",
                                            serviceTypes.length > 0,
                                            followUp,
                                        ].filter(Boolean).length
                                    }
                                </span>
                            )}
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                size="sm"
                                className="h-9 px-2 text-black hover:text-black md:hidden"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>

                    <div
                        className={cn(
                            "flex flex-1 flex-col gap-3 md:flex-row md:flex-wrap md:items-center",
                            showFilters ? "flex" : "hidden md:flex",
                        )}
                    >
                        {/* Company Search */}
                        <div className="relative flex-1 min-w-[140px] max-w-full md:max-w-[200px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            <Input
                                placeholder={t("filterByCompany")}
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="pl-9 h-9 text-sm bg-muted/50 focus:bg-background transition-colors text-black placeholder:text-gray-500"
                            />
                        </div>

                        {/* Contact Search */}
                        <div className="relative flex-1 min-w-[140px] max-w-full md:max-w-[240px]">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            <Input
                                placeholder={t("filterByContact")}
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="pl-9 h-9 text-sm bg-muted/50 focus:bg-background transition-colors text-black placeholder:text-gray-500"
                            />
                        </div>

                        {/* Service Type Filter - Multi-select with Checkboxes */}
                        <div className="relative flex-1 min-w-[160px] max-w-full md:max-w-[230px]">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center w-full h-9 rounded-md border border-input bg-muted/50 text-sm transition-colors hover:bg-background",
                                            serviceTypes.length > 0
                                                ? "text-black"
                                                : "text-gray-500",
                                        )}
                                    >
                                        <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 shrink-0 pointer-events-none" />
                                        <span className="truncate text-left flex-1 pl-9 pr-8 text-sm">
                                            {serviceTypes.length > 0
                                                ? serviceTypes.length === 1
                                                    ? t(
                                                          SERVICE_TYPE_OPTIONS.find(
                                                              (o) =>
                                                                  o.value ===
                                                                  serviceTypes[0],
                                                          )?.label ||
                                                              serviceTypes[0],
                                                      )
                                                    : `${serviceTypes.length} ${t("selected")}`
                                                : t("filterByServiceType")}
                                        </span>
                                        <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0 pointer-events-none" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[230px] p-2"
                                    align="start"
                                >
                                    <div className="flex flex-col gap-1">
                                        {SERVICE_TYPE_OPTIONS.map((option) => (
                                            <label
                                                key={option.value}
                                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/60 transition-colors"
                                            >
                                                <Checkbox
                                                    checked={serviceTypes.includes(
                                                        option.value,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleServiceType(
                                                            option.value,
                                                        )
                                                    }
                                                />
                                                <span className="text-sm text-foreground">
                                                    {t(option.label)}
                                                </span>
                                            </label>
                                        ))}
                                        {serviceTypes.length > 0 && (
                                            <>
                                                <div className="border-t my-1" />
                                                <button
                                                    onClick={() =>
                                                        setServiceTypes([])
                                                    }
                                                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    {t("clearFilters")}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Status Filter */}
                        <div className="relative flex-1 min-w-[130px] max-w-full md:max-w-[170px]">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-9 pl-9 bg-muted/50 focus:bg-background border-input text-sm">
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
                                    <SelectItem value="contacted_by_email">
                                        {t("contactedByEmail")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative flex-1 min-w-[150px] max-w-full md:max-w-[180px]">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />
                            <DatePicker
                                selected={followUp}
                                onChange={(date) => {
                                    if (date) {
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
                                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-muted/50 text-sm focus:bg-background transition-colors text-black placeholder:text-gray-500"
                                wrapperClassName="w-full"
                                showPopperArrow={false}
                                isClearable
                            />
                        </div>

                        {/* Owner Search (Super Admin Only) */}
                        {isSuperAdminUser && (
                            <div className="relative flex-1 min-w-[140px] max-w-full md:max-w-[200px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                                <Input
                                    placeholder={t("filterByAssignee")}
                                    value={ownerSearch}
                                    onChange={(e) =>
                                        setOwnerSearch(e.target.value)
                                    }
                                    className="pl-9 h-9 text-sm bg-muted/50 focus:bg-background transition-colors text-black placeholder:text-gray-500"
                                />
                            </div>
                        )}

                        {/* Clear Filters - always rendered, visibility toggled to prevent layout shift */}
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            size="sm"
                            className={cn(
                                "h-9 px-3 text-black hover:text-black shrink-0 hidden md:flex transition-opacity duration-150",
                                hasActiveFilters
                                    ? "visible opacity-100"
                                    : "invisible opacity-0 pointer-events-none",
                            )}
                            tabIndex={hasActiveFilters ? 0 : -1}
                            aria-hidden={!hasActiveFilters}
                        >
                            <X className="mr-2 h-3.5 w-3.5" />
                            {t("clearFilters")}
                        </Button>
                    </div>
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
                                {isSuperAdminUser && (
                                    <TableHead className="hidden md:table-cell text-xs font-bold uppercase tracking-wider text-black">
                                        {t("createdBy")}
                                    </TableHead>
                                )}
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
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
                                        colSpan={6}
                                        className="h-40 text-center text-red-600 font-bold"
                                    >
                                        {t("failedToLoadLeads")}
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-40 text-center text-black"
                                    >
                                        {t("noLeadsFound")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => (
                                    <TableRow
                                        key={lead.companyId}
                                        className="hover:bg-muted/30 text-black cursor-pointer"
                                        onClick={() =>
                                            navigate(`/leads/${lead._id}`, {
                                                state: { fromPage: page },
                                            })
                                        }
                                    >
                                        <TableCell className="font-bold text-black pl-4">
                                            {lead.company?.name || ""}
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
                                        <TableCell className="hidden xl:table-cell text-sm text-black tabular-nums">
                                            <span dir="ltr">
                                                {formatPhoneDisplay(
                                                    lead.company?.phone,
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
                                        {isSuperAdminUser && (
                                            <TableCell className="hidden md:table-cell text-black text-sm">
                                                {lead.createdBy &&
                                                typeof lead.createdBy === "object"
                                                    ? `${lead.createdBy.firstName} ${lead.createdBy.lastName}`
                                                    : "-"}
                                            </TableCell>
                                        )}
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
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
                        <div className="text-sm text-black text-center sm:text-left">
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

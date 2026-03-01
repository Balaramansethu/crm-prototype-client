import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FormContainer, CommonDialog, StatusBadge } from "@/components/common"
import {
    FormDatePicker,
    FormSelect,
    FormTimePicker,
} from "@/components/form-fields"
import { CALL_OUTCOME_OPTIONS } from "@/constants/formOptions"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    searchCompanies,
    searchLeadsByCompany,
    getLeadPreviousCallLogs,
} from "@/service/callLogsService"
import { formatPhoneDisplay } from "@/utils/leadTransformers"

// Helper to extract phone display string from a lead object
// Helper to extract phone display string from a lead object
function getPhoneFromLead(lead) {
    if (!lead) return ""
    if (lead.phone?.number) return formatPhoneDisplay(lead.phone)
    if (lead.contact?.phone?.number)
        return formatPhoneDisplay(lead.contact.phone)
    if (lead.company?.phone?.number)
        return formatPhoneDisplay(lead.company.phone)
    return ""
}

export default function CallLogForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const isEditMode = !!initialData

    // Derive initial lead data from initialData so state is correct from first render
    const initLead =
        initialData?.lead && typeof initialData.lead === "object"
            ? initialData.lead
            : null

    // Derive initial company from lead data
    const initCompanyId = (() => {
        if (!initLead) return ""
        if (typeof initLead.company === "object")
            return initLead.company?._id || ""
        return initLead.company || ""
    })()

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    // Company state
    const [companies, setCompanies] = useState([])
    const [loadingCompanies, setLoadingCompanies] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState(
        () => initCompanyId,
    )

    // Lead (contact person) state — initialize from initialData when in edit mode
    const [leads, setLeads] = useState(() => (initLead ? [initLead] : []))
    const [loadingLeads, setLoadingLeads] = useState(false)
    const [selectedLeadId, setSelectedLeadId] = useState(
        () => initLead?._id || "",
    )
    const [selectedLead, setSelectedLead] = useState(() => initLead)
    const [previousCallLogs, setPreviousCallLogs] = useState([])
    const [loadingPreviousData, setLoadingPreviousData] = useState(false)

    // Whether the selected company has contact persons (leads)
    // null = not yet determined (loading / no company selected), true/false after fetch
    const [hasContacts, setHasContacts] = useState(() =>
        initLead ? true : null,
    )

    // Phone display — initialize from initialData lead
    const [phoneDisplay, setPhoneDisplay] = useState(() =>
        getPhoneFromLead(initLead),
    )

    const defaultValues = useMemo(
        () => ({
            lead: initialData?.lead?._id || initialData?.lead || "",
            outcome: initialData?.outcome || "interested",
            followUp: initialData?.followUp
                ? new Date(initialData.followUp)
                : null,
            callStartTime: initialData?.callStartTime
                ? new Date(initialData.callStartTime).toTimeString().slice(0, 5)
                : new Date().toTimeString().slice(0, 5),
            durationHours: initialData?.callDuration
                ? Math.floor(initialData.callDuration / 3600)
                : "",
            durationMinutes: initialData?.callDuration
                ? Math.floor((initialData.callDuration % 3600) / 60)
                : "",
            durationSeconds: initialData?.callDuration
                ? initialData.callDuration % 60
                : "",
            remarks: initialData?.remarks || "",
        }),
        [initialData],
    )

    const form = useForm({
        defaultValues,
    })

    const {
        formState: { isDirty, isSubmitting },
        watch,
    } = form

    const currentOutcome = watch("outcome")

    // Fetch companies on mount
    useEffect(() => {
        const fetchCompaniesData = async () => {
            setLoadingCompanies(true)
            try {
                const response = await searchCompanies()
                const data = response.data || response
                let companiesList = Array.isArray(data)
                    ? data
                    : data.companies || []

                // In edit mode, ensure the current company is in the list
                if (
                    isEditMode &&
                    initLead?.company &&
                    typeof initLead.company === "object"
                ) {
                    const currentCompany = initLead.company
                    const companyExists = companiesList.some(
                        (c) => c._id === currentCompany._id,
                    )
                    if (!companyExists) {
                        companiesList = [currentCompany, ...companiesList]
                    }
                }

                setCompanies(companiesList)
            } catch (error) {
                console.error("Failed to fetch companies:", error)
                setCompanies([])
            } finally {
                setLoadingCompanies(false)
            }
        }
        fetchCompaniesData()
    }, [isEditMode, initLead])

    // Helper: get phone display from the selected company object
    const getPhoneFromCompany = (companyId) => {
        const company = companies.find((c) => c._id === companyId)
        if (!company?.phone?.number) return ""
        return formatPhoneDisplay(company.phone)
    }

    // Fetch leads (contact persons) when a company is selected
    useEffect(() => {
        if (!selectedCompanyId) {
            setLeads([])
            setHasContacts(null)
            return
        }

        // In edit mode, just use the lead from initialData
        if (isEditMode) {
            if (initialData?.lead && typeof initialData.lead === "object") {
                setLeads([initialData.lead])
                setHasContacts(true)
            }
            return
        }

        const fetchLeadsByCompany = async () => {
            setLoadingLeads(true)
            try {
                const response = await searchLeadsByCompany(selectedCompanyId)
                const data = response.data || response
                const rawLeads = Array.isArray(data) ? data : data.leads || []

                // Filter out leads with null/empty names
                const leadsList = rawLeads.filter(
                    (lead) => lead.name && lead.name.trim(),
                )

                setLeads(leadsList)
                const companyHasContacts = leadsList.length > 0
                setHasContacts(companyHasContacts)

                // If no contacts, auto-bind company phone from the API response
                if (!companyHasContacts) {
                    // Extract phone from the raw response's company object
                    const companyObj = rawLeads[0]?.company
                    const companyPhone = companyObj?.phone?.number
                        ? formatPhoneDisplay(companyObj.phone)
                        : getPhoneFromCompany(selectedCompanyId)
                    setPhoneDisplay(companyPhone)
                    setSelectedLeadId("")
                    setSelectedLead(null)
                    form.setValue("lead", "")
                }
            } catch (error) {
                console.error("Failed to fetch leads:", error)
                setLeads([])
                setHasContacts(false)
                // Fallback: bind company phone on error
                const companyPhone = getPhoneFromCompany(selectedCompanyId)
                setPhoneDisplay(companyPhone)
            } finally {
                setLoadingLeads(false)
            }
        }
        fetchLeadsByCompany()
    }, [selectedCompanyId, isEditMode, initialData, companies])

    // Get company name from lead
    const getCompanyName = (lead) => {
        if (!lead) return ""
        if (typeof lead.company === "object") return lead.company?.name || ""
        return lead.company || ""
    }

    // Format lead display: "LeadName (CompanyName)"
    const formatLeadDisplay = (lead) => {
        if (!lead) return ""
        const companyName = getCompanyName(lead)
        if (companyName) {
            return `${lead.name} (${companyName})`
        }
        return lead.name || ""
    }

    // Update phone display and selected lead when lead is selected
    useEffect(() => {
        if (selectedLeadId) {
            // Find lead in leads array, or fall back to initialData.lead in edit mode
            const lead =
                leads.find((l) => l._id === selectedLeadId) ||
                (isEditMode &&
                typeof initialData?.lead === "object" &&
                initialData.lead._id === selectedLeadId
                    ? initialData.lead
                    : null)
            setSelectedLead(lead || null)

            // Update phone display from the found lead
            const phone = getPhoneFromLead(lead)
            setPhoneDisplay(phone)
            form.setValue("lead", selectedLeadId)

            // Fetch all previous call log data for this lead history - ONLY in create mode
            if (!isEditMode) {
                const fetchPreviousData = async () => {
                    setLoadingPreviousData(true)
                    try {
                        const response =
                            await getLeadPreviousCallLogs(selectedLeadId)
                        // The user's provided JSON shows data is the array
                        const logs = response.data || []
                        setPreviousCallLogs(Array.isArray(logs) ? logs : [])
                    } catch (error) {
                        console.error(
                            "Failed to fetch previous call logs:",
                            error,
                        )
                        setPreviousCallLogs([])
                    } finally {
                        setLoadingPreviousData(false)
                    }
                }
                fetchPreviousData()
            }
        } else if (!isEditMode) {
            // Only clear state in create mode — in edit mode, we want to keep
            // the state that was initialized from initialData
            setSelectedLead(null)
            // Don't clear phone if company has no contacts — company phone is already bound
            if (hasContacts !== false) {
                setPhoneDisplay("")
            }
            form.setValue("lead", "")
            setPreviousCallLogs([])
        }
    }, [selectedLeadId, leads, form, isEditMode, initialData, hasContacts])

    // Initialize/reset form values when initialData changes (edit mode)
    // Note: leads, selectedLeadId, selectedLead, phoneDisplay are already
    // initialized from initialData via useState initializers above.
    // This effect only handles the form field reset.
    useEffect(() => {
        if (!initialData) return

        // Calculate duration values (HH:MM:SS)
        const totalSeconds = initialData.callDuration || 0
        const durationHrs = totalSeconds ? Math.floor(totalSeconds / 3600) : ""
        const durationMins = totalSeconds
            ? Math.floor((totalSeconds % 3600) / 60)
            : ""
        const durationSecs = totalSeconds ? totalSeconds % 60 : ""

        // Format callStartTime to HH:mm
        let timeValue = ""
        if (initialData.callStartTime) {
            try {
                const date = new Date(initialData.callStartTime)
                const hours = String(date.getHours()).padStart(2, "0")
                const mins = String(date.getMinutes()).padStart(2, "0")
                timeValue = `${hours}:${mins}`
            } catch {
                timeValue = ""
            }
        }

        // Determine outcome: Use initialData.outcome or fallback to lead status if it matches an outcome
        let initialOutcome = initialData.outcome
        if (!initialOutcome && initialData.lead?.status) {
            const statusAsOutcome = CALL_OUTCOME_OPTIONS.find(
                (o) => o.value === initialData.lead.status,
            )
            if (statusAsOutcome) initialOutcome = statusAsOutcome.value
        }

        form.reset({
            lead: initialData.lead?._id || initialData.lead || "",
            outcome: initialOutcome || "interested",
            followUp: initialData.followUp
                ? new Date(initialData.followUp)
                : null,
            callStartTime: timeValue,
            durationHours: durationHrs,
            durationMinutes: durationMins,
            durationSeconds: durationSecs,
            remarks: initialData.remarks || "",
        })

        // Also ensure lead/company state is set (in case initialData changed after mount)
        const lead = initialData.lead
        if (lead && typeof lead === "object") {
            // Set company
            const companyId =
                typeof lead.company === "object"
                    ? lead.company?._id
                    : lead.company || ""
            if (companyId) setSelectedCompanyId(companyId)

            setLeads((prev) =>
                prev.some((l) => l._id === lead._id) ? prev : [lead],
            )
            setSelectedLeadId(lead._id)
            setSelectedLead(lead)
            setPhoneDisplay(getPhoneFromLead(lead))
        }
    }, [initialData, form])

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && !isSubmitting) {
                e.preventDefault()
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty, isSubmitting])

    const handleCompanyChange = (companyId) => {
        setSelectedCompanyId(companyId)
        // Reset contact person when company changes
        setSelectedLeadId("")
        setSelectedLead(null)
        setPhoneDisplay("")
        form.setValue("lead", "")
        setPreviousCallLogs([])
        setHasContacts(null) // Reset until leads are fetched
    }

    const handleLeadChange = (leadId) => {
        setSelectedLeadId(leadId)
    }

    const handleSubmit = (data) => {
        // Validate lead selection — only required when company has contacts
        if (hasContacts !== false && !selectedLeadId) {
            form.setError("lead", {
                type: "required",
                message: t("leadRequired"),
            })
            return
        }

        if (!data.remarks) {
            form.setError("remarks", {
                type: "required",
                message: t("remarksRequired"),
            })
            return
        }

        // Validate callStartTime
        if (!data.callStartTime) {
            form.setError("callStartTime", {
                type: "required",
                message: t("callStartTimeRequired"),
            })
            return
        }

        // Validate duration fields (HH:MM:SS format)
        const hours = parseInt(data.durationHours, 10) || 0
        const minutes = parseInt(data.durationMinutes, 10) || 0
        const seconds = parseInt(data.durationSeconds, 10) || 0

        // Validate ranges: hours 0-23, minutes 0-59, seconds 0-59
        if (hours < 0 || hours > 23) {
            form.setError("durationHours", {
                type: "validate",
                message: t("hoursRange"),
            })
            return
        }
        if (minutes < 0 || minutes > 59) {
            form.setError("durationMinutes", {
                type: "validate",
                message: t("minutesRange"),
            })
            return
        }
        if (seconds < 0 || seconds > 59) {
            form.setError("durationSeconds", {
                type: "validate",
                message: t("secondsRange"),
            })
            return
        }

        if (hours === 0 && minutes === 0 && seconds === 0) {
            form.setError("durationHours", {
                type: "required",
                message: t("callDurationRequired"),
            })
            return
        }

        // Calculate total duration in seconds (HH:MM:SS to seconds)
        const totalDurationSeconds = hours * 3600 + minutes * 60 + seconds

        // Build callStartTime with current date and selected time
        let formattedCallStartTime = null
        if (data.callStartTime) {
            const today = new Date()
            const [hrs, mins] = data.callStartTime.split(":")
            today.setHours(parseInt(hrs, 10), parseInt(mins, 10), 0, 0)
            formattedCallStartTime = today.toISOString()
        }

        // Prepare payload - only send leadId
        const payload = {
            lead: selectedLeadId,
            outcome: data.outcome,
            followUp: data.followUp || undefined,
            remarks: data.remarks || undefined,
            callStartTime: formattedCallStartTime,
            callDuration: totalDurationSeconds,
        }

        onSubmit(payload)
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            navigate("/call-logs")
        }
    }

    const confirmLeave = () => {
        setShowUnsavedDialog(false)
        navigate("/call-logs")
    }

    const isSubmitDisabled = loading || (isEditMode && !isDirty)

    return (
        <>
            {/* Main Layout Container */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 w-full">
                {/* Main Form - Uses standard FormContainer for consistent alignment */}
                <FormContainer maxWidth="max-w-2xl" className="flex-1">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="grid gap-6"
                        >
                            {/* Company Select */}
                            <FormItem>
                                <FormLabel>
                                    {t("company")}{" "}
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={handleCompanyChange}
                                    value={selectedCompanyId}
                                    disabled={isEditMode || loadingCompanies}
                                >
                                    <FormControl>
                                        <SelectTrigger
                                            className={cn(
                                                isRTL ? "text-right" : "",
                                                isEditMode &&
                                                    "bg-muted !cursor-not-allowed",
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={
                                                    loadingCompanies
                                                        ? t("loading")
                                                        : t("selectCompany")
                                                }
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                        {companies.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                {t("noCompaniesAvailable")}
                                            </div>
                                        ) : (
                                            companies.map((company) => (
                                                <SelectItem
                                                    key={company._id}
                                                    value={company._id}
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormItem>

                            {/* Contact Person Select — hidden when company has no contacts */}
                            {(hasContacts !== false || isEditMode) && (
                                <FormField
                                    control={form.control}
                                    name="lead"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("contactPerson")}{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={handleLeadChange}
                                                value={selectedLeadId}
                                                disabled={
                                                    isEditMode ||
                                                    loadingLeads ||
                                                    !selectedCompanyId
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger
                                                        className={cn(
                                                            isRTL
                                                                ? "text-right"
                                                                : "",
                                                            (isEditMode ||
                                                                !selectedCompanyId) &&
                                                                "bg-muted !cursor-not-allowed",
                                                        )}
                                                    >
                                                        <SelectValue
                                                            placeholder={
                                                                !selectedCompanyId
                                                                    ? t(
                                                                          "selectCompanyFirst",
                                                                      )
                                                                    : loadingLeads
                                                                      ? t(
                                                                            "loading",
                                                                        )
                                                                      : t(
                                                                            "selectContactPerson",
                                                                        )
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent
                                                    dir={isRTL ? "rtl" : "ltr"}
                                                >
                                                    {leads.length === 0 ? (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                            {t(
                                                                "noLeadsAvailable",
                                                            )}
                                                        </div>
                                                    ) : (
                                                        leads.map((lead) => (
                                                            <SelectItem
                                                                key={lead._id}
                                                                value={lead._id}
                                                            >
                                                                {lead.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Phone Display (read-only) */}
                            <FormItem>
                                <FormLabel>{t("phone")}</FormLabel>
                                <FormControl>
                                    <Input
                                        value={phoneDisplay}
                                        disabled
                                        readOnly
                                        className="tabular-nums bg-muted !cursor-not-allowed"
                                        dir="ltr"
                                        placeholder={
                                            hasContacts === false
                                                ? t("companyPhone")
                                                : t("selectLeadFirst")
                                        }
                                    />
                                </FormControl>
                            </FormItem>

                            {/* Outcome Select */}
                            <FormSelect
                                control={form.control}
                                name="outcome"
                                label={t("callOutcome")}
                                placeholder={t("selectOutcome")}
                                options={CALL_OUTCOME_OPTIONS.map((opt) => ({
                                    ...opt,
                                    value: opt.value,
                                    label: t(opt.label),
                                }))}
                                showBadge
                                onValueChange={(val) => {
                                    // Only auto-set follow-up date in create mode
                                    if (!isEditMode) {
                                        if (val === "not_interested") {
                                            const sixMonthsLater = new Date()
                                            sixMonthsLater.setMonth(
                                                sixMonthsLater.getMonth() + 6,
                                            )
                                            form.setValue(
                                                "followUp",
                                                sixMonthsLater,
                                            )
                                        } else {
                                            form.setValue("followUp", null)
                                        }
                                    }
                                }}
                            />

                            {/* Follow-up Date */}
                            <FormDatePicker
                                control={form.control}
                                name="followUp"
                                label={
                                    currentOutcome === "promoted_to_meeting"
                                        ? t("nextMeetingDate")
                                        : t("followUp")
                                }
                                minDate={new Date()}
                            />

                            {/* Call Start Time - Custom Time Picker with Now and OK buttons */}
                            <FormTimePicker
                                control={form.control}
                                name="callStartTime"
                                label={t("callStartTime")}
                                required
                            />

                            {/* Call Duration - Hours, Minutes and Seconds side by side */}
                            <div className="space-y-2">
                                <FormLabel>{t("callDuration")}</FormLabel>
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="durationHours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="0"
                                                            maxLength={2}
                                                            className={cn(
                                                                "pr-10 tabular-nums",
                                                                isRTL
                                                                    ? "text-right pl-10 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                // Only allow digits
                                                                const numericValue =
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        "",
                                                                    )
                                                                const val =
                                                                    parseInt(
                                                                        numericValue,
                                                                        10,
                                                                    )
                                                                if (
                                                                    numericValue ===
                                                                    ""
                                                                ) {
                                                                    field.onChange(
                                                                        "",
                                                                    )
                                                                } else if (
                                                                    val >= 0 &&
                                                                    val <= 23
                                                                ) {
                                                                    field.onChange(
                                                                        numericValue,
                                                                    )
                                                                } else if (
                                                                    val > 23
                                                                ) {
                                                                    field.onChange(
                                                                        "23",
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                                                                isRTL
                                                                    ? "left-3"
                                                                    : "right-3",
                                                            )}
                                                        >
                                                            {t("hr")}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="durationMinutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="0"
                                                            maxLength={2}
                                                            className={cn(
                                                                "pr-12 tabular-nums",
                                                                isRTL
                                                                    ? "text-right pl-12 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                // Only allow digits
                                                                const numericValue =
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        "",
                                                                    )
                                                                const val =
                                                                    parseInt(
                                                                        numericValue,
                                                                        10,
                                                                    )
                                                                if (
                                                                    numericValue ===
                                                                    ""
                                                                ) {
                                                                    field.onChange(
                                                                        "",
                                                                    )
                                                                } else if (
                                                                    val >= 0 &&
                                                                    val <= 59
                                                                ) {
                                                                    field.onChange(
                                                                        numericValue,
                                                                    )
                                                                } else if (
                                                                    val > 59
                                                                ) {
                                                                    field.onChange(
                                                                        "59",
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                                                                isRTL
                                                                    ? "left-3"
                                                                    : "right-3",
                                                            )}
                                                        >
                                                            {t("min")}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="durationSeconds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="0"
                                                            maxLength={2}
                                                            className={cn(
                                                                "pr-12 tabular-nums",
                                                                isRTL
                                                                    ? "text-right pl-12 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                // Only allow digits
                                                                const numericValue =
                                                                    e.target.value.replace(
                                                                        /\D/g,
                                                                        "",
                                                                    )
                                                                const val =
                                                                    parseInt(
                                                                        numericValue,
                                                                        10,
                                                                    )
                                                                if (
                                                                    numericValue ===
                                                                    ""
                                                                ) {
                                                                    field.onChange(
                                                                        "",
                                                                    )
                                                                } else if (
                                                                    val >= 0 &&
                                                                    val <= 59
                                                                ) {
                                                                    field.onChange(
                                                                        numericValue,
                                                                    )
                                                                } else if (
                                                                    val > 59
                                                                ) {
                                                                    field.onChange(
                                                                        "59",
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                        <span
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                                                                isRTL
                                                                    ? "left-3"
                                                                    : "right-3",
                                                            )}
                                                        >
                                                            {t("sec")}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Remarks */}
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("remarks")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className={cn(
                                                    "min-h-[100px]",
                                                    isRTL ? "text-right" : "",
                                                )}
                                                placeholder={t("enterRemarks")}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={isSubmitDisabled}
                                    title={
                                        isEditMode && !isDirty
                                            ? t("noChangesToSave")
                                            : undefined
                                    }
                                >
                                    {loading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t("saveCallLog")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </FormContainer>

                {/* Lead Previous Data Card - Only shown when a lead is selected and not in edit mode */}
                {selectedLead && !isEditMode && (
                    <div className="lg:w-96 shrink-0 mt-6">
                        <Card className="mt-0">
                            <CardHeader className="border-b py-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {t("leadRemarks")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingPreviousData ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : previousCallLogs.length > 0 ? (
                                    <div className="flex flex-col">
                                        <Accordion
                                            type="single"
                                            collapsible
                                            className="w-full"
                                            defaultValue={`item-0`}
                                        >
                                            {previousCallLogs.map(
                                                (log, index) => (
                                                    <AccordionItem
                                                        key={log._id || index}
                                                        value={`item-${index}`}
                                                        className="border-b last:border-b-0"
                                                    >
                                                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/30">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <div className="flex flex-col min-w-0">
                                                                    {/* Created By Badge */}

                                                                    <span className="text-sm font-medium text-foreground truncate">
                                                                        {
                                                                            selectedLead?.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {log.updatedAt
                                                                            ? format(
                                                                                  new Date(
                                                                                      log.updatedAt,
                                                                                  ),
                                                                                  "d MMM, h:mm a",
                                                                              )
                                                                            : "-"}
                                                                        {log
                                                                            .lead
                                                                            ?.createdBy && (
                                                                            <Badge
                                                                                variant="ghost"
                                                                                className="mb-2 text-[10px] py-2 px-2 h-4 ml-3"
                                                                            >
                                                                                {
                                                                                    log
                                                                                        .createdBy
                                                                                        .firstName
                                                                                }{" "}
                                                                                {
                                                                                    log
                                                                                        .createdBy
                                                                                        .lastName
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pb-4">
                                                            <div className="mb-2">
                                                                <StatusBadge
                                                                    status={
                                                                        log.outcome ||
                                                                        log.lead
                                                                            ?.status ||
                                                                        "interested"
                                                                    }
                                                                    className="text-[10px] h-5"
                                                                />
                                                            </div>
                                                            <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
                                                                <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                                                                    {t(
                                                                        "remarks",
                                                                    )}
                                                                </p>
                                                                <p className="whitespace-pre-wrap leading-relaxed">
                                                                    {
                                                                        log.remarks
                                                                    }
                                                                </p>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ),
                                            )}
                                        </Accordion>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                            <FileText className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {t("noRemarksAvailable")}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <CommonDialog
                open={showUnsavedDialog}
                onOpenChange={setShowUnsavedDialog}
                title={t("unsavedChanges")}
                description={t("unsavedChangesWarning")}
                confirmText={t("leave")}
                cancelText={t("stayOnPage")}
                onConfirm={confirmLeave}
                variant="destructive"
                showIcon={false}
            />
        </>
    )
}

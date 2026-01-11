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
import { FormDatePicker, FormSelect } from "@/components/form-fields"
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
import { cn, enumToTranslationKey } from "@/lib/utils"
import {
    searchLeads,
    fetchCallLogs,
    getLeadPreviousCallLogs,
} from "@/service/callLogsService"

export default function CallLogForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    // Lead state
    const [leads, setLeads] = useState([])
    const [loadingLeads, setLoadingLeads] = useState(false)
    const [selectedLeadId, setSelectedLeadId] = useState("")
    const [selectedLead, setSelectedLead] = useState(null)
    const [previousCallLogs, setPreviousCallLogs] = useState([])
    const [loadingPreviousData, setLoadingPreviousData] = useState(false)

    // Phone display
    const [phoneDisplay, setPhoneDisplay] = useState("")

    const isEditMode = !!initialData

    const defaultValues = useMemo(
        () => ({
            lead: initialData?.lead?._id || initialData?.lead || "",
            outcome: initialData?.outcome || "interested",
            followUp: initialData?.followUp
                ? new Date(initialData.followUp)
                : null,
            callStartTime: initialData?.callStartTime
                ? new Date(initialData.callStartTime).toTimeString().slice(0, 5)
                : "",
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

    // Fetch all leads on mount
    useEffect(() => {
        const fetchLeads = async () => {
            setLoadingLeads(true)
            try {
                const response = await searchLeads({ limit: 200 })
                const data = response.data || response
                let leadsList = Array.isArray(data) ? data : data.leads || []

                // Filter out leads with null/empty names
                leadsList = leadsList.filter(
                    (lead) => lead.name && lead.name.trim(),
                )

                // In edit mode, ensure the current lead is in the list
                if (
                    isEditMode &&
                    initialData?.lead &&
                    typeof initialData.lead === "object"
                ) {
                    const currentLead = initialData.lead
                    if (currentLead.name && currentLead.name.trim()) {
                        const leadExists = leadsList.some(
                            (l) => l._id === currentLead._id,
                        )
                        if (!leadExists) {
                            leadsList = [currentLead, ...leadsList]
                        }
                    }
                }

                setLeads(leadsList)
            } catch (error) {
                console.error("Failed to fetch leads:", error)
                // In edit mode, still show the current lead
                if (
                    isEditMode &&
                    initialData?.lead &&
                    typeof initialData.lead === "object" &&
                    initialData.lead.name
                ) {
                    setLeads([initialData.lead])
                }
            } finally {
                setLoadingLeads(false)
            }
        }
        fetchLeads()
    }, [isEditMode, initialData])

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
            const lead = leads.find((l) => l._id === selectedLeadId)
            setSelectedLead(lead || null)

            if (lead?.phone?.number) {
                const phone = lead.phone
                setPhoneDisplay(
                    `${phone.extension || ""} ${phone.number}`.trim(),
                )
            } else if (lead?.company?.phone?.number) {
                const phone = lead.company.phone
                setPhoneDisplay(
                    `${phone.extension || ""} ${phone.number}`.trim(),
                )
            } else {
                setPhoneDisplay("")
            }
            form.setValue("lead", selectedLeadId)

            // Fetch all previous call log data for this lead history
            const fetchPreviousData = async () => {
                setLoadingPreviousData(true)
                try {
                    const response =
                        await getLeadPreviousCallLogs(selectedLeadId)
                    // The user's provided JSON shows data is the array
                    const logs = response.data || []
                    setPreviousCallLogs(Array.isArray(logs) ? logs : [])
                } catch (error) {
                    console.error("Failed to fetch previous call logs:", error)
                    setPreviousCallLogs([])
                } finally {
                    setLoadingPreviousData(false)
                }
            }
            fetchPreviousData()
        } else {
            setSelectedLead(null)
            setPhoneDisplay("")
            form.setValue("lead", "")
            setPreviousCallLogs([])
        }
    }, [selectedLeadId, leads, form])

    // Initialize edit mode with existing data
    useEffect(() => {
        if (!initialData || loadingLeads) return

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

        // Set lead for edit mode
        if (initialData.lead) {
            const lead = initialData.lead
            if (typeof lead === "object") {
                setSelectedLeadId(lead._id)
                setSelectedLead(lead)

                // Set phone display
                if (lead.phone?.number) {
                    setPhoneDisplay(
                        `${lead.phone.extension || ""} ${lead.phone.number}`.trim(),
                    )
                } else if (lead.contact?.phone?.number) {
                    const phone = lead.contact.phone
                    setPhoneDisplay(
                        `${phone.extension || ""} ${phone.number}`.trim(),
                    )
                }
            }
        }
    }, [initialData, form, loadingLeads])

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

    const handleLeadChange = (leadId) => {
        setSelectedLeadId(leadId)
    }

    const handleSubmit = (data) => {
        // Validate lead selection
        if (!selectedLeadId) {
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
            followUp: data.followUp,
            remarks: data.remarks,
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

    const isSubmitDisabled = loading

    return (
        <>
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 max-w-5xl">
                {/* Main Form */}
                <FormContainer className="flex-1 max-w-xl">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="grid gap-6"
                        >
                            {/* Lead Select - Shows "LeadName (CompanyName)" */}
                            <FormField
                                control={form.control}
                                name="lead"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("lead")}{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={handleLeadChange}
                                            value={selectedLeadId}
                                            disabled={
                                                isEditMode || loadingLeads
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        isRTL
                                                            ? "text-right"
                                                            : "",
                                                        isEditMode &&
                                                            "bg-muted !cursor-not-allowed",
                                                    )}
                                                >
                                                    <SelectValue
                                                        placeholder={
                                                            loadingLeads
                                                                ? t("loading")
                                                                : t(
                                                                      "selectLead",
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
                                                        {t("noLeadsAvailable")}
                                                    </div>
                                                ) : (
                                                    leads.map((lead) => (
                                                        <SelectItem
                                                            key={lead._id}
                                                            value={lead._id}
                                                        >
                                                            {formatLeadDisplay(
                                                                lead,
                                                            )}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                        placeholder={t("selectLeadFirst")}
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

                            {/* Call Start Time - Time only */}
                            <FormField
                                control={form.control}
                                name="callStartTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("callStartTime")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="time"
                                                className={cn(
                                                    "w-full cursor-pointer",
                                                    isRTL ? "text-right" : "",
                                                )}
                                                onClick={(e) =>
                                                    e.target.showPicker?.()
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
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
                                                            type="number"
                                                            min="0"
                                                            max="23"
                                                            placeholder="0"
                                                            className={cn(
                                                                "pr-10",
                                                                isRTL
                                                                    ? "text-right pl-10 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                const val =
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    )
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? ""
                                                                        : Math.min(
                                                                              Math.max(
                                                                                  val ||
                                                                                      0,
                                                                                  0,
                                                                              ),
                                                                              23,
                                                                          ),
                                                                )
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
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            placeholder="0"
                                                            className={cn(
                                                                "pr-12",
                                                                isRTL
                                                                    ? "text-right pl-12 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                const val =
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    )
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? ""
                                                                        : Math.min(
                                                                              Math.max(
                                                                                  val ||
                                                                                      0,
                                                                                  0,
                                                                              ),
                                                                              59,
                                                                          ),
                                                                )
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
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            placeholder="0"
                                                            className={cn(
                                                                "pr-12",
                                                                isRTL
                                                                    ? "text-right pl-12 pr-3"
                                                                    : "",
                                                            )}
                                                            onChange={(e) => {
                                                                const val =
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                        10,
                                                                    )
                                                                field.onChange(
                                                                    e.target
                                                                        .value ===
                                                                        ""
                                                                        ? ""
                                                                        : Math.min(
                                                                              Math.max(
                                                                                  val ||
                                                                                      0,
                                                                                  0,
                                                                              ),
                                                                              59,
                                                                          ),
                                                                )
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
                                                                {/* Avatar/Icon */}
                                                                <div className="shrink-0">
                                                                    <div className="text-[10px] -mt-1 -ml-2 text-muted-foreground">
                                                                        {t(
                                                                            "createdBy",
                                                                        )}{" "}
                                                                        :
                                                                    </div>
                                                                    <div className="mt-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-medium">
                                                                        {(
                                                                            selectedLead?.name ||
                                                                            "L"
                                                                        )
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    {/* Created By Badge */}
                                                                    {log.lead
                                                                        ?.createdBy && (
                                                                        <Badge
                                                                            variant="ghost"
                                                                            className="mb-2 text-[10px] py-2 px-2 h-4"
                                                                        >
                                                                            {
                                                                                log
                                                                                    .lead
                                                                                    .createdBy
                                                                                    .firstName
                                                                            }{" "}
                                                                            {
                                                                                log
                                                                                    .lead
                                                                                    .createdBy
                                                                                    .lastName
                                                                            }
                                                                        </Badge>
                                                                    )}
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
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pb-4">
                                                            <div className="pl-11">
                                                                <div className="mb-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            log.outcome ||
                                                                            log
                                                                                .lead
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

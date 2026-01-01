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
import { FormContainer, CommonDialog } from "@/components/common"
import { FormDatePicker } from "@/components/form-fields"
import { CALL_OUTCOME_OPTIONS } from "@/constants/formOptions"

import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchCompanies, searchLeadsByCompany } from "@/service/callLogsService"

export default function CallLogForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    // Company and Lead state
    const [companies, setCompanies] = useState([])
    const [leads, setLeads] = useState([])
    const [loadingCompanies, setLoadingCompanies] = useState(false)
    const [loadingLeads, setLoadingLeads] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState("")
    const [selectedLeadId, setSelectedLeadId] = useState("")
    const [showNewLeadField, setShowNewLeadField] = useState(false)
    const [newLeadName, setNewLeadName] = useState("")

    // Phone display
    const [phoneDisplay, setPhoneDisplay] = useState("")
    const [companyPhone, setCompanyPhone] = useState("")

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
            durationMinutes: initialData?.callDuration
                ? Math.floor(initialData.callDuration / 60)
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
    } = form

    // Fetch companies on mount
    useEffect(() => {
        const fetchCompanies = async () => {
            setLoadingCompanies(true)
            try {
                const response = await searchCompanies({ limit: 100 })
                const data = response.data || response
                let companiesList = data.companies || []
                
                // In edit mode, ensure the current company is in the list
                if (isEditMode && initialData?.lead?.company && typeof initialData.lead.company === 'object') {
                    const currentCompany = initialData.lead.company
                    const companyExists = companiesList.some(c => c._id === currentCompany._id)
                    if (!companyExists) {
                        companiesList = [currentCompany, ...companiesList]
                    }
                }
                
                setCompanies(companiesList)
                console.log("Companies loaded:", companiesList)
            } catch (error) {
                console.error("Failed to fetch companies:", error)
                // In edit mode, still show the current company
                if (isEditMode && initialData?.lead?.company && typeof initialData.lead.company === 'object') {
                    setCompanies([initialData.lead.company])
                }
            } finally {
                setLoadingCompanies(false)
            }
        }
        fetchCompanies()
    }, [isEditMode, initialData])

    // Fetch leads when company is selected
    useEffect(() => {
        if (!selectedCompanyId) {
            setLeads([])
            setShowNewLeadField(false)
            setCompanyPhone("")
            return
        }

        const fetchLeads = async () => {
            setLoadingLeads(true)
            try {
                const response = await searchLeadsByCompany(selectedCompanyId)
                const data = response.data || response
                const rawLeadsArray = Array.isArray(data) ? data : data.leads || []
                
                // Try to get company info from response (might include phone)
                let companyFromResponse = data.company || null
                
                // If no company in response, try to extract from first lead's populated company
                if (!companyFromResponse && rawLeadsArray.length > 0) {
                    const firstLead = rawLeadsArray[0]
                    if (firstLead.company && typeof firstLead.company === 'object') {
                        companyFromResponse = firstLead.company
                    }
                }
                
                // Filter out leads with null/empty names (company-only entries)
                let leadsArray = rawLeadsArray.filter(lead => lead.name && lead.name.trim())
                
                // In edit mode, ensure the current lead is in the list (if it has a name)
                if (isEditMode && initialData?.lead && typeof initialData.lead === 'object') {
                    const currentLead = initialData.lead
                    if (currentLead.name && currentLead.name.trim()) {
                        const leadExists = leadsArray.some(l => l._id === currentLead._id)
                        if (!leadExists) {
                            leadsArray = [currentLead, ...leadsArray]
                        }
                    }
                }
                
                setLeads(leadsArray)
                
                // Get company phone - try from response first, then from companies list
                let companyPhoneData = null
                
                // Helper to extract phone from object
                const extractPhone = (obj) => {
                    if (!obj) return null
                    if (obj.phone?.number) return obj.phone
                    if (obj.phoneNumber) return { number: obj.phoneNumber, extension: obj.phoneExtension || "" }
                    return null
                }

                companyPhoneData = extractPhone(companyFromResponse)

                if (!companyPhoneData) {
                    const selectedCompany = companies.find(c => c._id === selectedCompanyId)
                    companyPhoneData = extractPhone(selectedCompany)
                }
                
                if (companyPhoneData) {
                    setCompanyPhone(`${companyPhoneData.extension || ""} ${companyPhoneData.number}`.trim())
                }
                
                // If no valid leads (with names), show new lead field
                if (leadsArray.length === 0 && !selectedLeadId) {
                    setShowNewLeadField(true)
                    // Show company phone when entering new lead
                    if (companyPhoneData) {
                        setPhoneDisplay(`${companyPhoneData.extension || ""} ${companyPhoneData.number}`.trim())
                    }
                } else {
                    setShowNewLeadField(false)
                }
            } catch (error) {
                console.error("Failed to fetch leads:", error)
                
                // In edit mode, still show the current lead (if it has a name)
                if (isEditMode && initialData?.lead && typeof initialData.lead === 'object' && initialData.lead.name) {
                    setLeads([initialData.lead])
                    setShowNewLeadField(false)
                } else {
                    setLeads([])
                    if (!selectedLeadId) {
                        setShowNewLeadField(true)
                        // Show company phone
                        const selectedCompany = companies.find(c => c._id === selectedCompanyId)
                        if (selectedCompany?.phone?.number) {
                            const phone = selectedCompany.phone
                            setPhoneDisplay(`${phone.extension || ""} ${phone.number}`.trim())
                        }
                    }
                }
            } finally {
                setLoadingLeads(false)
            }
        }
        fetchLeads()
    }, [selectedCompanyId, isEditMode, initialData, companies])

    // Update phone display when lead is selected
    useEffect(() => {
        if (selectedLeadId) {
            const selectedLead = leads.find((l) => l._id === selectedLeadId)
            if (selectedLead?.phone?.number) {
                const phone = selectedLead.phone
                setPhoneDisplay(`${phone.extension || ""} ${phone.number}`.trim())
            } else {
                setPhoneDisplay("")
            }
            form.setValue("lead", selectedLeadId)
        } else if (selectedCompanyId && companyPhone) {
            // If company is selected but no lead yet, show company phone
            setPhoneDisplay(companyPhone)
            form.setValue("lead", "")
        } else {
            // Only clear if no company selected at all
            setPhoneDisplay("")
            form.setValue("lead", "")
        }
    }, [selectedLeadId, leads, form, showNewLeadField, companyPhone, selectedCompanyId])

    // Initialize edit mode with existing data (wait for companies to load)
    useEffect(() => {
        if (!initialData || loadingCompanies) return
        
        // Calculate duration values
        const durationMins = initialData.callDuration
            ? Math.floor(initialData.callDuration / 60)
            : ""
        const durationSecs = initialData.callDuration
            ? initialData.callDuration % 60
            : ""
        
        // Format callStartTime to HH:mm
        let timeValue = ""
        if (initialData.callStartTime) {
            try {
                const date = new Date(initialData.callStartTime)
                const hours = String(date.getHours()).padStart(2, '0')
                const mins = String(date.getMinutes()).padStart(2, '0')
                timeValue = `${hours}:${mins}`
            } catch {
                timeValue = ""
            }
        }

        form.reset({
            lead: initialData.lead?._id || initialData.lead || "",
            outcome: initialData.outcome || "interested",
            followUp: initialData.followUp
                ? new Date(initialData.followUp)
                : null,
            callStartTime: timeValue,
            durationMinutes: durationMins,
            durationSeconds: durationSecs,
            remarks: initialData.remarks || "",
        })

        // Set company and lead for edit mode
        if (initialData.lead) {
            const lead = initialData.lead
            if (typeof lead === "object") {
                // Lead has company info
                const companyId = lead.company?._id || lead.company
                if (companyId) {
                    setSelectedCompanyId(companyId)
                }
                setSelectedLeadId(lead._id)
                
                // Set phone display
                if (lead.phone?.number) {
                    setPhoneDisplay(`${lead.phone.extension || ""} ${lead.phone.number}`.trim())
                } else if (lead.contact?.phone?.number) {
                    const phone = lead.contact.phone
                    setPhoneDisplay(`${phone.extension || ""} ${phone.number}`.trim())
                }
            }
        }
    }, [initialData, form, loadingCompanies])

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
        setSelectedLeadId("")
        setNewLeadName("")
        form.setValue("lead", "")
        
        // Try to set phone display immediately from company list
        const selectedCompany = companies.find(c => c._id === companyId)
        if (selectedCompany?.phone?.number) {
            const phone = selectedCompany.phone
            setPhoneDisplay(`${phone.extension || ""} ${phone.number}`.trim())
            setCompanyPhone(`${phone.extension || ""} ${phone.number}`.trim())
        } else {
            setPhoneDisplay("")
            setCompanyPhone("")
        }
    }

    const handleLeadChange = (leadId) => {
        setSelectedLeadId(leadId)
        setShowNewLeadField(false)
        setNewLeadName("")
    }

    const handleSubmit = (data) => {
        // Validate lead selection
        if (!selectedLeadId && !newLeadName) {
            if (showNewLeadField || leads.length === 0) {
                form.setError("lead", {
                    type: "required",
                    message: t("leadNameRequired"),
                })
            } else {
                form.setError("lead", {
                    type: "required",
                    message: t("leadRequired"),
                })
            }
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

        // Validate durationMinutes and durationSeconds
        const minutes = parseInt(data.durationMinutes, 10) || 0
        const seconds = parseInt(data.durationSeconds, 10) || 0
        
        if (minutes === 0 && seconds === 0) {
            form.setError("durationMinutes", {
                type: "required",
                message: t("callDurationRequired"),
            })
            return
        }

        // Calculate total duration in seconds
        const totalDurationSeconds = (parseInt(data.durationMinutes, 10) || 0) * 60 + (parseInt(data.durationSeconds, 10) || 0)

        // Build callStartTime with current date and selected time
        let formattedCallStartTime = null
        if (data.callStartTime) {
            const today = new Date()
            const [hours, mins] = data.callStartTime.split(":")
            today.setHours(parseInt(hours, 10), parseInt(mins, 10), 0, 0)
            formattedCallStartTime = today.toISOString()
        }

        // Prepare payload
        const payload = {
            outcome: data.outcome,
            followUp: data.followUp,
            remarks: data.remarks,
            callStartTime: formattedCallStartTime,
            callDuration: totalDurationSeconds,
        }

        // If existing lead selected, use the ID; otherwise use leadName for new lead
        if (selectedLeadId) {
            payload.lead = selectedLeadId
        } else if (showNewLeadField && newLeadName) {
            // Send leadName for new lead creation (backend expects this)
            payload.leadName = newLeadName
            payload.companyId = selectedCompanyId
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

    // For edit mode, allow submit since we track changes via local state
    const isSubmitDisabled = loading

    // Get selected company name for display
    const selectedCompany = companies.find((c) => c._id === selectedCompanyId)

    return (
        <>
            <FormContainer>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="grid gap-6"
                    >
                        {/* Company Select */}
                        <FormItem>
                            <FormLabel>{t("company")}</FormLabel>
                            <Select
                                onValueChange={handleCompanyChange}
                                value={selectedCompanyId}
                                disabled={isEditMode}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            isRTL ? "text-right" : "",
                                            isEditMode && "bg-muted !cursor-not-allowed",
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
                                    {companies.map((company) => (
                                        <SelectItem
                                            key={company._id}
                                            value={company._id}
                                        >
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>

                        {/* Lead Select - Only show if company selected and has leads */}
                        {selectedCompanyId && !showNewLeadField && (
                            <FormField
                                control={form.control}
                                name="lead"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("leadName")}</FormLabel>
                                        <Select
                                            onValueChange={handleLeadChange}
                                            value={selectedLeadId}
                                            disabled={isEditMode || loadingLeads}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className={cn(
                                                        isRTL ? "text-right" : "",
                                                        isEditMode && "bg-muted !cursor-not-allowed",
                                                    )}
                                                >
                                                    <SelectValue
                                                        placeholder={
                                                            loadingLeads
                                                                ? t("loading")
                                                                : t("selectLead")
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                {leads.map((lead) => (
                                                    <SelectItem
                                                        key={lead._id}
                                                        value={lead._id}
                                                    >
                                                        {lead.name || lead.email || "-"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* New Lead Name Field - Show if company has no leads */}
                        {selectedCompanyId && showNewLeadField && (
                            <FormItem>
                                <FormLabel>
                                    {t("leadName")} <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        value={newLeadName}
                                        onChange={(e) => setNewLeadName(e.target.value)}
                                        placeholder={t("enterLeadName")}
                                        className={isRTL ? "text-right" : ""}
                                    />
                                </FormControl>
                                <p className="text-sm text-muted-foreground">
                                    {t("noLeadsForCompany")}
                                </p>
                            </FormItem>
                        )}

                        {/* Phone Display (read-only) */}
                        <FormItem>
                            <FormLabel>{t("phone")}</FormLabel>
                            <FormControl>
                                <Input
                                    value={phoneDisplay}
                                    disabled
                                    readOnly
                                    className="font-mono bg-muted !cursor-not-allowed"
                                    dir="ltr"
                                    placeholder={t("selectLeadFirst")}
                                />
                            </FormControl>
                        </FormItem>

                        {/* Outcome Select */}
                        <FormField
                            control={form.control}
                            name="outcome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("callOutcome")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger
                                                className={isRTL ? "text-right" : ""}
                                            >
                                                <SelectValue
                                                    placeholder={t("selectOutcome")}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                            {CALL_OUTCOME_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${option.color}`}>
                                                            {t(option.label)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Follow-up Date */}
                        <FormDatePicker
                            control={form.control}
                            name="followUp"
                            label={t("followUp")}
                            minDate={new Date()}
                        />

                        {/* Call Start Time - Time only */}
                        <FormField
                            control={form.control}
                            name="callStartTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("callStartTime")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="time"
                                            className={cn(
                                                "w-full",
                                                isRTL ? "text-right" : ""
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Call Duration - Minutes and Seconds side by side */}
                        <div className="space-y-2">
                            <FormLabel>{t("callDuration")}</FormLabel>
                            <div className="grid grid-cols-2 gap-3">
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
                                                        max="999"
                                                        placeholder="0"
                                                        className={cn(
                                                            "pr-12",
                                                            isRTL ? "text-right pl-12 pr-3" : ""
                                                        )}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : "")}
                                                    />
                                                    <span className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                                                        isRTL ? "left-3" : "right-3"
                                                    )}>
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
                                                        placeholder="0"
                                                        className={cn(
                                                            "pr-12",
                                                            isRTL ? "text-right pl-12 pr-3" : ""
                                                        )}
                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : "")}
                                                    />
                                                    <span className={cn(
                                                        "absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
                                                        isRTL ? "left-3" : "right-3"
                                                    )}>
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

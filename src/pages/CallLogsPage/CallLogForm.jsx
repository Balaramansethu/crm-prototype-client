
import { Button } from "@/components/ui/button"
import * as React from "react"
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
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
// We need a way to select a lead. For now, we will use a simple Select populated by fetching leads.
// In a real large-scale app, this should be an async searchable combobox.
import { useLeads } from "@/hooks/useLeads"
import { getLeadById } from "@/service/leadsService"

export default function CallLogForm({ onSubmit, loading = false, initialData = null }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const isRTL = i18n.dir() === "rtl"

    // Fetch leads for the dropdown
    // Fetching 100 to hopefully get enough. Ideally, this needs pagination/search.
    const { data } = useLeads({ limit: 100 })
    const leads = data?.leads || []

    // State to track selected lead details
    const [selectedLeadDetails, setSelectedLeadDetails] = useState({
        company: "",
        phone: ""
    })
    const [extraLead, setExtraLead] = useState(null)
    
    // Combine leads with extraLead if it exists and isn't already in the list
    const displayLeads = useMemo(() => {
        if (!extraLead) return leads
        if (leads.find(l => (l._id) === (extraLead._id))) return leads
        return [extraLead, ...leads]
    }, [leads, extraLead])

    const defaultValues = useMemo(() => ({
        lead: initialData?.lead?._id || initialData?.lead || "",
        outcome: initialData?.outcome || "interested",
        followUp: initialData?.followUp ? new Date(initialData.followUp) : null,
        remarks: initialData?.remarks || "",
    }), [initialData])

    const form = useForm({
        defaultValues,
    })

    // Update details helper
    const updateLeadDetails = (leadId) => {
         // Look in displayLeads or fallback to leads/extraLead logic
         // Since updateLeadDetails is called from render or effects, best to use the latest data we have.
         // But `leads` is in scope. `displayLeads` is in scope (if we move this function after displayLeads def).
         // I'll assume displayLeads is defined before this function.
         
         const allLeads = extraLead ? [extraLead, ...leads] : leads
         const selectedLead = allLeads.find(lead => (lead._id) === leadId)
         
         if (selectedLead) {
             setSelectedLeadDetails({
                 company: selectedLead.company || "",
                 phone: selectedLead.phone?.number 
                     ? `${selectedLead.phone.extension || ""} ${selectedLead.phone.number}`.trim()
                     : selectedLead.phone || ""
             })
             if (selectedLead.followUp) {
                 form.setValue("followUp", new Date(selectedLead.followUp))
             }
         } else {
             setSelectedLeadDetails({ company: "", phone: "" })
         }
    }

    // Handle new lead from URL check
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newLeadId = searchParams.get("newLeadId")

        if (newLeadId) {
            // Check if the lead is in the current list or extraLead
            const allLeads = extraLead ? [extraLead, ...leads] : leads
            const leadExists = allLeads.find(l => (l._id) === newLeadId)
            
            if (leadExists) {
                // Determine current form value
                const currentLead = form.getValues("lead")
                // Update if ID changed OR if details are missing (and should be there)
                if (currentLead !== newLeadId || !selectedLeadDetails.company) {
                    form.setValue("lead", newLeadId)
                    updateLeadDetails(newLeadId)
                }
            } else {
                // Lead not in list (maybe due to pagination limit), fetch it explicitly
                // Prevent duplicate fetching if we already finding it (though leadExists check handles that)
                getLeadById(newLeadId).then(data => {
                     const l = data.lead || data
                     if (l) {
                         setExtraLead(l)
                         form.setValue("lead", newLeadId)
                         // Manual set details for immediate feedback
                         setSelectedLeadDetails({
                            company: l.company || "",
                            phone: l.phone?.number 
                                ? `${l.phone.extension || ""} ${l.phone.number}`.trim()
                                : l.phone || ""
                        })
                        if (l.followUp) {
                            form.setValue("followUp", new Date(l.followUp))
                        }
                     }
                }).catch(err => console.error("Failed to fetch new lead", err))
            }
        }
    }, [location.search, leads, form, extraLead, selectedLeadDetails.company])

    // Reset form when initialData changes (important for edit page loading behavior)
    useEffect(() => {
        if (initialData) {
            form.reset({
                lead: initialData.lead?._id || initialData.lead || "",
                outcome: initialData.outcome || "interested",
                followUp: initialData.followUp ? new Date(initialData.followUp) : null,
                remarks: initialData.remarks || "",
            })
            // Set initial lead details if editing
            if (initialData.lead) {
                if (typeof initialData.lead === 'object') {
                    setSelectedLeadDetails({
                        company: initialData.lead.company || "",
                        phone: initialData.lead.phone?.number 
                            ? `${initialData.lead.phone.extension || ""} ${initialData.lead.phone.number}`.trim()
                            : initialData.lead.phone || ""
                    })
                } else {
                    // It's an ID, try to find in leads
                     updateLeadDetails(initialData.lead)
                }
            }
        }
    }, [initialData, form, leads])

    // Handle lead selection change
    const handleLeadChange = (leadId) => {
        if (leadId === "CREATE_NEW_LEAD") {
            const returnUrl = encodeURIComponent(location.pathname)
            navigate(`/leads/new?returnTo=${returnUrl}`)
            return
        }

        form.setValue("lead", leadId)
        updateLeadDetails(leadId)
    }

    const handleSubmit = (data) => {
        // Basic validation
        if (!data.lead) {
            form.setError("lead", { type: "required", message: t("leadRequired") || "Lead is required" })
            return
        }
        if (!data.remarks) {
            form.setError("remarks", { type: "required", message: t("remarksRequired") || "Remarks is required" })
            return
        }

        onSubmit(data)
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 py-6 lg:px-6">
                <div className="max-w-2xl rounded-md border bg-white p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
                            
                            {/* Lead Selection */}
                            <FormField
                                control={form.control}
                                name="lead"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("leadName") || "Lead"}</FormLabel>
                                        <Select onValueChange={handleLeadChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                    <SelectValue placeholder={t("selectLead") || "Select a lead"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                <SelectItem value="CREATE_NEW_LEAD" className="text-primary font-medium focus:bg-primary/10 cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="h-4 w-4" />
                                                        {t("createNewLead") || "Create Lead"}
                                                    </div>
                                                </SelectItem>
                                                {displayLeads.map((lead) => (
                                                    <SelectItem key={lead._id || lead.id} value={lead._id || lead.id}>
                                                        {lead.contact} ({lead.company})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Company Name - Auto-populated and disabled */}
                            <FormItem>
                                <FormLabel>{t("company") || "Company"}</FormLabel>
                                <FormControl>
                                    <Input 
                                        value={selectedLeadDetails.company}
                                        disabled
                                        readOnly
                                        className={cn("bg-muted !cursor-not-allowed", isRTL ? "text-right" : "")}
                                        placeholder={t("selectLeadFirst") || "Select a lead first"}
                                    />
                                </FormControl>
                            </FormItem>

                            {/* Phone Number - Auto-populated and disabled */}
                            <FormItem>
                                <FormLabel>{t("phone") || "Phone"}</FormLabel>
                                <FormControl>
                                    <Input 
                                        value={selectedLeadDetails.phone}
                                        disabled
                                        readOnly
                                        dir="ltr"
                                        className="bg-muted !cursor-not-allowed"
                                        placeholder={t("selectLeadFirst") || "Select a lead first"}
                                    />
                                </FormControl>
                            </FormItem>

                            {/* Outcome */}
                            <FormField
                                control={form.control}
                                name="outcome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("outcome") || "Outcome"}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                    <SelectValue placeholder={t("selectOutcome")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                <SelectItem value="interested">
                                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-green-100 text-green-700")}>
                                                        {t("interested") || "Interested"}
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="not_interested">
                                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-700")}>
                                                        {t("not_interested") || "Not Interested"}
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="contacted">
                                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700")}>
                                                        {t("contacted") || "Contacted"}
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="done">
                                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700")}>
                                                        {t("done") || "Done"}
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Follow Up Date */}
                            <FormField
                                control={form.control}
                                name="followUp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("followUp")}</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                selected={field.value}
                                                onChange={field.onChange}
                                                minDate={new Date()}
                                                placeholderText="DD-MM-YYYY"
                                                dateFormat="dd-MM-yyyy"
                                                className={cn(
                                                    "h-10 w-full rounded-md border px-3 text-sm",
                                                    isRTL ? "text-right" : "",
                                                )}
                                                wrapperClassName="w-full"
                                                showPopperArrow={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Remarks */}
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("remarks") || "Remarks"}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className={cn("min-h-[100px]", isRTL ? "text-right" : "")}
                                                placeholder={t("enterRemarks") || "Enter call details..."}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/call-logs")}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button type="submit" disabled={loading || !form.formState.isDirty}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("saveCallLog") || "Save Log"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

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
import { FormContainer } from "@/components/common"
import { FormDatePicker } from "@/components/form-fields"
import { CALL_OUTCOME_OPTIONS } from "@/constants/formOptions"

import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLeads } from "@/hooks/useLeads"
import { getLeadById } from "@/service/leadsService"

/**
 * Call Log Form Component
 * Handles both create and edit modes for call logs.
 * 
 * @param {Object} props
 * @param {function} props.onSubmit - Form submission handler
 * @param {boolean} [props.loading=false] - Loading state
 * @param {Object} [props.initialData] - Initial data for edit mode
 */
export default function CallLogForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const isRTL = i18n.dir() === "rtl"

    // Fetch leads for the dropdown
    const { data } = useLeads({ limit: 100 })
    const leads = data?.leads || []

    // State to track selected lead details
    const [selectedLeadDetails, setSelectedLeadDetails] = useState({
        company: "",
        phone: "",
    })
    const [extraLead, setExtraLead] = useState(null)

    // Combine leads with extraLead if it exists and isn't already in the list
    const displayLeads = useMemo(() => {
        if (!extraLead) return leads
        if (leads.find((l) => l._id === extraLead._id)) return leads
        return [extraLead, ...leads]
    }, [leads, extraLead])

    const defaultValues = useMemo(
        () => ({
            lead: initialData?.lead?._id || initialData?.lead || "",
            outcome: initialData?.outcome || "interested",
            followUp: initialData?.followUp ? new Date(initialData.followUp) : null,
            remarks: initialData?.remarks || "",
        }),
        [initialData]
    )

    const form = useForm({
        defaultValues,
    })

    // Helper to format phone from lead object
    const formatLeadPhone = (lead) => {
        if (!lead) return ""
        return lead.phone?.number
            ? `${lead.phone.extension || ""} ${lead.phone.number}`.trim()
            : lead.phone || ""
    }

    // Update details helper
    const updateLeadDetails = (leadId) => {
        const allLeads = extraLead ? [extraLead, ...leads] : leads
        const selectedLead = allLeads.find((lead) => lead._id === leadId)

        if (selectedLead) {
            setSelectedLeadDetails({
                company: selectedLead.company || "",
                phone: formatLeadPhone(selectedLead),
            })
            if (selectedLead.followUp) {
                form.setValue("followUp", new Date(selectedLead.followUp))
            }
        } else {
            setSelectedLeadDetails({ company: "", phone: "" })
        }
    }

    // Handle new lead from URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newLeadId = searchParams.get("newLeadId")

        if (newLeadId) {
            const allLeads = extraLead ? [extraLead, ...leads] : leads
            const leadExists = allLeads.find((l) => l._id === newLeadId)

            if (leadExists) {
                const currentLead = form.getValues("lead")
                if (currentLead !== newLeadId || !selectedLeadDetails.company) {
                    form.setValue("lead", newLeadId)
                    updateLeadDetails(newLeadId)
                }
            } else {
                getLeadById(newLeadId)
                    .then((data) => {
                        const l = data.lead || data
                        if (l) {
                            setExtraLead(l)
                            form.setValue("lead", newLeadId)
                            setSelectedLeadDetails({
                                company: l.company || "",
                                phone: formatLeadPhone(l),
                            })
                            if (l.followUp) {
                                form.setValue("followUp", new Date(l.followUp))
                            }
                        }
                    })
                    .catch((err) => console.error("Failed to fetch new lead", err))
            }
        }
    }, [location.search, leads, form, extraLead, selectedLeadDetails.company])

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                lead: initialData.lead?._id || initialData.lead || "",
                outcome: initialData.outcome || "interested",
                followUp: initialData.followUp ? new Date(initialData.followUp) : null,
                remarks: initialData.remarks || "",
            })

            if (initialData.lead) {
                if (typeof initialData.lead === "object") {
                    setSelectedLeadDetails({
                        company: initialData.lead.company || "",
                        phone: formatLeadPhone(initialData.lead),
                    })
                } else {
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
        if (!data.lead) {
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

        onSubmit(data)
    }

    return (
        <FormContainer>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="grid gap-6"
                >
                    {/* Lead Selection */}
                    <FormField
                        control={form.control}
                        name="lead"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("leadName")}</FormLabel>
                                <Select onValueChange={handleLeadChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={isRTL ? "text-right" : ""}>
                                            <SelectValue placeholder={t("selectLead")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                        <SelectItem
                                            value="CREATE_NEW_LEAD"
                                            className="text-primary font-medium focus:bg-primary/10 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                {t("createNewLead")}
                                            </div>
                                        </SelectItem>
                                        {displayLeads.map((lead) => (
                                            <SelectItem
                                                key={lead._id || lead.id}
                                                value={lead._id || lead.id}
                                            >
                                                {lead.contact} ({lead.company})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Company Name - Auto-populated */}
                    <FormItem>
                        <FormLabel>{t("company")}</FormLabel>
                        <FormControl>
                            <Input
                                value={selectedLeadDetails.company}
                                disabled
                                readOnly
                                className={cn(
                                    "bg-muted !cursor-not-allowed",
                                    isRTL ? "text-right" : ""
                                )}
                                placeholder={t("selectLeadFirst")}
                            />
                        </FormControl>
                    </FormItem>

                    {/* Phone Number - Auto-populated */}
                    <FormItem>
                        <FormLabel>{t("phone")}</FormLabel>
                        <FormControl>
                            <Input
                                value={selectedLeadDetails.phone}
                                disabled
                                readOnly
                                dir="ltr"
                                className="bg-muted !cursor-not-allowed"
                                placeholder={t("selectLeadFirst")}
                            />
                        </FormControl>
                    </FormItem>

                    {/* Outcome */}
                    <FormField
                        control={form.control}
                        name="outcome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("outcome")}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className={isRTL ? "text-right" : ""}>
                                            <SelectValue placeholder={t("selectOutcome")} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                        {CALL_OUTCOME_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                                        option.color
                                                    )}
                                                >
                                                    {t(option.value)}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Follow Up Date */}
                    <FormDatePicker
                        control={form.control}
                        name="followUp"
                        label={t("followUp")}
                        minDate={new Date()}
                    />

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
                                        className={cn("min-h-[100px]", isRTL ? "text-right" : "")}
                                        placeholder={t("enterRemarks")}
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
                            {t("saveCallLog")}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormContainer>
    )
}

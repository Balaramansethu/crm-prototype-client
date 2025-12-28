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
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLeads } from "@/hooks/useLeads"
import { getLeadById } from "@/service/leadsService"
import React from "react"

export default function CallLogForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const isRTL = i18n.dir() === "rtl"

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    const leadsParams = useMemo(() => ({ limit: 100 }), [])
    const { data } = useLeads(leadsParams)
    const leads = data?.leads || []

    const [selectedLeadDetails, setSelectedLeadDetails] = useState({
        company: "",
        phone: "",
    })
    const [extraLead, setExtraLead] = useState(null)

    const displayLeads = useMemo(() => {
        if (!extraLead) return leads
        if (leads.find((l) => l._id === extraLead._id)) return leads
        return [extraLead, ...leads]
    }, [leads, extraLead])

    const defaultValues = useMemo(
        () => ({
            lead: initialData?.lead?._id || initialData?.lead || "",
            outcome: initialData?.outcome || "interested",
            followUp: initialData?.followUp
                ? new Date(initialData.followUp)
                : null,
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

    const isEditMode = !!initialData

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

    // Format phone from either contact or company
    const formatPhone = (phoneObj) => {
        if (!phoneObj?.number) return ""
        return phoneObj.number
            ? `${phoneObj.extension || ""} ${phoneObj.number}`.trim()
            : ""
    }

    const getCompanyName = (lead) => {
        if (!lead) return ""
        return lead.company?.name || lead.company || ""
    }

    // Get phone - fallback to company phone if no contact phone
    const getLeadPhone = (lead) => {
        if (!lead) return ""
        if (lead.contact?.phone?.number) {
            return formatPhone(lead.contact.phone)
        }
        if (lead.company?.phone?.number) {
            return formatPhone(lead.company.phone)
        }
        return ""
    }

    const updateLeadDetails = (leadId) => {
        const allLeads = extraLead ? [extraLead, ...leads] : leads
        const selectedLead = allLeads.find((lead) => lead._id === leadId)

        if (selectedLead) {
            const newCompany = getCompanyName(selectedLead)
            const newPhone = getLeadPhone(selectedLead)
            
            // Only update state if values actually changed
            if (newCompany !== selectedLeadDetails.company || newPhone !== selectedLeadDetails.phone) {
                setSelectedLeadDetails({
                    company: newCompany,
                    phone: newPhone,
                })
            }
            
            if (selectedLead.followUp) {
                // Only set if different to avoid potential loops (though setValue handles this usually)
                const currentFollowUp = form.getValues("followUp")
                const newFollowUp = new Date(selectedLead.followUp)
                if (!currentFollowUp || currentFollowUp.getTime() !== newFollowUp.getTime()) {
                    form.setValue("followUp", newFollowUp)
                }
            }
        } else {
            if (selectedLeadDetails.company !== "" || selectedLeadDetails.phone !== "") {
                 setSelectedLeadDetails({ company: "", phone: "" })
            }
        }
    }

    // Handle newLeadId from URL (when returning from lead creation)
    const processedNewLeadIdRef = React.useRef(null)
    
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newLeadId = searchParams.get("newLeadId")

        // Skip if no newLeadId or already processed this ID
        if (!newLeadId || processedNewLeadIdRef.current === newLeadId) {
            return
        }

        const allLeads = extraLead ? [extraLead, ...leads] : leads
        const leadExists = allLeads.find((l) => l._id === newLeadId)

        if (leadExists) {
            processedNewLeadIdRef.current = newLeadId
            form.setValue("lead", newLeadId)
            // updateLeadDetails checks for changes internally now, but we can call it directly
            updateLeadDetails(newLeadId)
        } else if (leads.length === 0) {
            // Leads haven't loaded yet, fetch directly
            getLeadById(newLeadId)
                .then((data) => {
                    const l = data.data || data.lead || data
                    if (l) {
                        processedNewLeadIdRef.current = newLeadId
                        setExtraLead(l)
                        form.setValue("lead", newLeadId)
                        
                        // Manually set details since updateLeadDetails relies on state/leads
                        const newCompany = getCompanyName(l)
                        const newPhone = getLeadPhone(l)
                        
                        setSelectedLeadDetails({
                            company: newCompany,
                            phone: newPhone,
                        })
                        
                        if (l.followUp) {
                            form.setValue("followUp", new Date(l.followUp))
                        }
                    }
                })
                .catch((err) =>
                    console.error("Failed to fetch new lead", err),
                )
        }
    }, [location.search, leads, extraLead, form, selectedLeadDetails])

    // Update form values when initialData changes
    useEffect(() => {
        if (initialData) {
            // We use reset here which is fine, it sets the form values
            form.reset({
                lead: initialData.lead?._id || initialData.lead || "",
                outcome: initialData.outcome || "interested",
                followUp: initialData.followUp
                    ? new Date(initialData.followUp)
                    : null,
                remarks: initialData.remarks || "",
            })
        }
    }, [initialData, form])

    // Update read-only lead details for initialData
    useEffect(() => {
        if (initialData?.lead) {
            let newCompany = ""
            let newPhone = ""
            
            if (typeof initialData.lead === "object") {
                newCompany = getCompanyName(initialData.lead)
                newPhone = getLeadPhone(initialData.lead)
            } else {
                const leadId = initialData.lead
                const allLeads = extraLead ? [extraLead, ...leads] : leads
                const selectedLead = allLeads.find((lead) => lead._id === leadId)
                
                if (selectedLead) {
                    newCompany = getCompanyName(selectedLead)
                    newPhone = getLeadPhone(selectedLead)
                }
            }
            
            // Only update if changed
            if (newCompany !== selectedLeadDetails.company || newPhone !== selectedLeadDetails.phone) {
                setSelectedLeadDetails({
                    company: newCompany,
                    phone: newPhone,
                })
            }
        }
    }, [initialData, leads, extraLead, selectedLeadDetails])

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
            <FormContainer>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="grid gap-6"
                    >
                        <FormField
                            control={form.control}
                            name="lead"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("leadName")}</FormLabel>
                                    <Select
                                        onValueChange={handleLeadChange}
                                        value={field.value}
                                        disabled={isEditMode}
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
                                                    placeholder={t(
                                                        "selectLead",
                                                    )}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            dir={isRTL ? "rtl" : "ltr"}
                                        >
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
                                                    {lead.contact?.name ||
                                                        lead.company?.name ||
                                                        lead.company}{" "}
                                                    (
                                                    {lead.company?.name ||
                                                        lead.company}
                                                    )
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>{t("company")}</FormLabel>
                            <FormControl>
                                <Input
                                    value={selectedLeadDetails.company}
                                    disabled
                                    readOnly
                                    className={cn(
                                        "bg-muted !cursor-not-allowed",
                                        isRTL ? "text-right" : "",
                                    )}
                                    placeholder={t("selectLeadFirst")}
                                />
                            </FormControl>
                        </FormItem>

                        <FormItem>
                            <FormLabel>{t("phone")}</FormLabel>
                            <FormControl>
                                <Input
                                    value={selectedLeadDetails.phone}
                                    disabled
                                    readOnly
                                    className="font-mono bg-muted !cursor-not-allowed"
                                    dir="ltr"
                                    placeholder={t("selectLeadFirst")}
                                />
                            </FormControl>
                        </FormItem>

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
                                                className={
                                                    isRTL ? "text-right" : ""
                                                }
                                            >
                                                <SelectValue
                                                    placeholder={t(
                                                        "selectOutcome",
                                                    )}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            dir={isRTL ? "rtl" : "ltr"}
                                        >
                                            {CALL_OUTCOME_OPTIONS.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {t(option.label)}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormDatePicker
                            control={form.control}
                            name="followUp"
                            label={t("followUp")}
                            minDate={new Date()}
                        />

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

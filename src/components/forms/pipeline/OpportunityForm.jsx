import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormContainer, CommonDialog } from "@/components/common"
import { FormDatePicker } from "@/components/form-fields"
import { PIPELINE_STAGES } from "@/constants/pipelineOptions"

import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLeads } from "@/hooks/useLeads"
import { getLeadById } from "@/service/leadsService"

export default function OpportunityForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const isRTL = i18n.dir() === "rtl"
    const isEditMode = !!initialData

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    const { data } = useLeads({ limit: 100 })
    const leads = data?.leads || []

    const [selectedLeadDetails, setSelectedLeadDetails] = useState({
        leadName: "",
        companyName: "",
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
            opportunityStage: initialData?.opportunityStage || "lead",
            estimatedValue: initialData?.estimatedValue || "",
            probability: initialData?.probability || "",
            expectedRevenue: initialData?.expectedRevnue || initialData?.expectedRevenue || "",
            nextStep: initialData?.nextStep || "",
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
        watch,
    } = form

    const estimatedValue = watch("estimatedValue")
    const probability = watch("probability")

    useEffect(() => {
        if (estimatedValue && probability) {
            const expected = (Number(estimatedValue) * Number(probability)) / 100
            form.setValue("expectedRevenue", Math.round(expected))
        }
    }, [estimatedValue, probability, form])

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && !isSubmitting) {
                e.preventDefault()
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty, isSubmitting])

    const getLeadName = (lead) => {
        if (!lead) return ""
        return lead.contact?.name || lead.company?.name || ""
    }

    const getCompanyName = (lead) => {
        if (!lead) return ""
        return lead.company?.name || ""
    }

    const updateLeadDetails = (leadId) => {
        const allLeads = extraLead ? [extraLead, ...leads] : leads
        const selectedLead = allLeads.find((lead) => lead._id === leadId)

        if (selectedLead) {
            setSelectedLeadDetails({
                leadName: getLeadName(selectedLead),
                companyName: getCompanyName(selectedLead),
            })
        } else {
            setSelectedLeadDetails({ leadName: "", companyName: "" })
        }
    }

    // Handle newLeadId from query params (after creating a new lead)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const newLeadId = searchParams.get("newLeadId")

        if (newLeadId) {
            const allLeads = extraLead ? [extraLead, ...leads] : leads
            const leadExists = allLeads.find((l) => l._id === newLeadId)

            if (leadExists) {
                const currentLead = form.getValues("lead")
                if (currentLead !== newLeadId) {
                    form.setValue("lead", newLeadId)
                    setSelectedLeadDetails({
                        leadName: getLeadName(leadExists),
                        companyName: getCompanyName(leadExists),
                    })
                }
            } else if (!extraLead) {
                getLeadById(newLeadId)
                    .then((data) => {
                        const l = data.data || data.lead || data
                        if (l) {
                            setExtraLead(l)
                            form.setValue("lead", newLeadId)
                            setSelectedLeadDetails({
                                leadName: getLeadName(l),
                                companyName: getCompanyName(l),
                            })
                        }
                    })
                    .catch((err) =>
                        console.error("Failed to fetch new lead", err),
                    )
            }
        }
    }, [location.search, leads, extraLead])

    // Handle initialData for edit mode
    useEffect(() => {
        if (initialData) {
            form.reset({
                lead: initialData.lead?._id || initialData.lead || "",
                opportunityStage: initialData.opportunityStage || "lead",
                estimatedValue: initialData.estimatedValue || "",
                probability: initialData.probability || "",
                expectedRevenue: initialData.expectedRevnue || initialData.expectedRevenue || "",
                nextStep: initialData.nextStep || "",
                followUp: initialData.followUp
                    ? new Date(initialData.followUp)
                    : null,
                remarks: initialData.remarks || "",
            })

            if (initialData.lead && typeof initialData.lead === "object") {
                setSelectedLeadDetails({
                    leadName: getLeadName(initialData.lead),
                    companyName: getCompanyName(initialData.lead),
                })
            }
        }
    }, [initialData])

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

        onSubmit(data)
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            navigate("/pipeline")
        }
    }

    const confirmLeave = () => {
        setShowUnsavedDialog(false)
        navigate("/pipeline")
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
                                    <FormLabel>{t("lead")} *</FormLabel>
                                    <Select
                                        onValueChange={handleLeadChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger
                                                className={isRTL ? "text-right" : ""}
                                            >
                                                <SelectValue
                                                    placeholder={t("selectLead")}
                                                />
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
                                                    {lead.contact?.name || lead.company?.name} ({lead.company?.name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>{t("leadName")}</FormLabel>
                                <FormControl>
                                    <Input
                                        value={selectedLeadDetails.leadName}
                                        disabled
                                        readOnly
                                        className="bg-muted"
                                        placeholder={t("selectLeadFirst")}
                                    />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>{t("company")}</FormLabel>
                                <FormControl>
                                    <Input
                                        value={selectedLeadDetails.companyName}
                                        disabled
                                        readOnly
                                        className="bg-muted"
                                        placeholder={t("selectLeadFirst")}
                                    />
                                </FormControl>
                            </FormItem>
                        </div>

                        <FormField
                            control={form.control}
                            name="opportunityStage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("opportunityStage")}</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                <SelectValue placeholder={t("selectStage")} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                            {PIPELINE_STAGES.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id}>
                                                    {t(stage.id) || stage.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="estimatedValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("estimatedValue")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                dir="ltr"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="probability"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("probability")} (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                dir="ltr"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="expectedRevenue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("expectedRevenue")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                disabled
                                                readOnly
                                                className="bg-muted"
                                                dir="ltr"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="nextStep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("nextStep")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t("nextStepPlaceholder")}
                                            className={isRTL ? "text-right" : ""}
                                        />
                                    </FormControl>
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
                                                "min-h-[80px]",
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
                                {isEditMode ? t("saveChanges") : t("saveOpportunity")}
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

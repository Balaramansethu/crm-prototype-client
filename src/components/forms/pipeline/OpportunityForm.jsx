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
import { FormDatePicker, FormSelect } from "@/components/form-fields"
import { PIPELINE_STAGES } from "@/constants/pipelineOptions"

import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchPipelineCompanies } from "@/service/pipelineService"

export default function OpportunityForm({
    onSubmit,
    loading = false,
    initialData = null,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"
    const isEditMode = !!initialData

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [companies, setCompanies] = useState([])
    const [loadingCompanies, setLoadingCompanies] = useState(false)

    // Fetch companies on mount
    useEffect(() => {
        const fetchCompanies = async () => {
            setLoadingCompanies(true)
            try {
                const response = await searchPipelineCompanies({ limit: 100 })
                const data = response.data || response
                let companiesList = data.companies || []

                // In edit mode, ensure the current company is in the list
                if (
                    isEditMode &&
                    initialData?.company &&
                    typeof initialData.company === "object"
                ) {
                    const currentCompany = initialData.company
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
        fetchCompanies()
    }, [isEditMode, initialData])

    const defaultValues = useMemo(
        () => ({
            company: initialData?.company?._id || initialData?.company || "",
            opportunityStage: initialData?.opportunityStage || "lead",
            estimatedValue: initialData?.estimatedValue || "",
            probability: initialData?.probability || "",
            expectedRevenue:
                initialData?.expectedRevnue ||
                initialData?.expectedRevenue ||
                "",
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

    // Auto-calculate expected revenue
    useEffect(() => {
        if (estimatedValue && probability) {
            const expected =
                (Number(estimatedValue) * Number(probability)) / 100
            form.setValue("expectedRevenue", Math.round(expected))
        }
    }, [estimatedValue, probability, form])

    // Warn on page leave
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

    // Reset form when initialData changes (edit mode)
    useEffect(() => {
        if (initialData) {
            form.reset({
                company: initialData.company?._id || initialData.company || "",
                opportunityStage: initialData.opportunityStage || "lead",
                estimatedValue: initialData.estimatedValue || "",
                probability: initialData.probability || "",
                expectedRevenue:
                    initialData.expectedRevnue ||
                    initialData.expectedRevenue ||
                    "",
                nextStep: initialData.nextStep || "",
                followUp: initialData.followUp
                    ? new Date(initialData.followUp)
                    : null,
                remarks: initialData.remarks || "",
            })
        }
    }, [initialData, form])

    const handleSubmit = (data) => {
        // Validate company selection
        if (!data.company) {
            form.setError("company", {
                type: "required",
                message: t("companyRequired"),
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
                        {/* Company Selection */}
                        <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("company")} *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={loadingCompanies}
                                    >
                                        <FormControl>
                                            <SelectTrigger
                                                className={
                                                    isRTL ? "text-right" : ""
                                                }
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
                                        <SelectContent
                                            dir={isRTL ? "rtl" : "ltr"}
                                        >
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Opportunity Stage */}
                        <FormSelect
                            control={form.control}
                            name="opportunityStage"
                            label={t("opportunityStage")}
                            placeholder={t("selectStage")}
                            options={PIPELINE_STAGES.map((stage) => ({
                                value: stage.id,
                                label: t(stage.id) || stage.label,
                                color: stage.color,
                            }))}
                            showBadge
                        />

                        {/* Financial Values Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="estimatedValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t("estimatedValue")}
                                        </FormLabel>
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
                                        <FormLabel>
                                            {t("probability")} (%)
                                        </FormLabel>
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
                                        <FormLabel>
                                            {t("expectedRevenue")}
                                        </FormLabel>
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

                        {/* Next Step */}
                        <FormField
                            control={form.control}
                            name="nextStep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("nextStep")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t(
                                                "nextStepPlaceholder",
                                            )}
                                            className={
                                                isRTL ? "text-right" : ""
                                            }
                                        />
                                    </FormControl>
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

                        {/* Action Buttons */}
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
                                {isEditMode
                                    ? t("saveChanges")
                                    : t("saveOpportunity")}
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

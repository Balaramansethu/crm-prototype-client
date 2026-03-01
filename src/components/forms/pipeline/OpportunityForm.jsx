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
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { searchPipelineCompanies } from "@/service/pipelineService"
import { useUserStore } from "@/store/userStore"

import ProposalUploadSection from "./ProposalUploadSection"

export default function OpportunityForm({
    onSubmit,
    loading = false,
    initialData = null,
    onCompanyChange,
}) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"
    const isEditMode = !!initialData
    const user = useUserStore((state) => state.user)

    const isAdminOrSuperAdmin = ["admin", "super_admin"].includes(user?.role)

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [companies, setCompanies] = useState([])
    const [loadingCompanies, setLoadingCompanies] = useState(false)
    const [selectedCompanyId, setSelectedCompanyId] = useState(
        initialData?.company?._id || initialData?.company || "",
    )

    // Fetch companies on mount
    useEffect(() => {
        const fetchCompanies = async () => {
            setLoadingCompanies(true)
            try {
                const response = await searchPipelineCompanies()
                const data = response.data || response
                let companiesList = Array.isArray(data)
                    ? data
                    : data.companies || []

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
            // Proposal fields
            proposalNumber: initialData?.proposalNumber || "",
            proposalDocument: undefined, // Always start undefined for file input
        }),
        [initialData],
    )

    const form = useForm({
        defaultValues,
        mode: "onChange",
        shouldUnregister: false,
    })

    const {
        formState: { isDirty, isSubmitting, dirtyFields },
        watch,
        setValue,
        control,
    } = form

    const estimatedValue = watch("estimatedValue")
    const probability = watch("probability")
    const opportunityStage = watch("opportunityStage")

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
                proposalNumber: initialData.proposalNumber || "",
                proposalDocument: undefined,
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

        const formData = new FormData()

        // Helper to check if field should be included
        const shouldInclude = (key) => !isEditMode || dirtyFields[key]

        // Append standard fields
        if (shouldInclude("company")) formData.append("company", data.company)

        if (shouldInclude("opportunityStage"))
            formData.append("opportunityStage", data.opportunityStage)

        // Use loose check for values including 0
        if (
            shouldInclude("estimatedValue") &&
            data.estimatedValue !== "" &&
            data.estimatedValue !== undefined &&
            data.estimatedValue !== null
        )
            formData.append("estimatedValue", data.estimatedValue)

        if (
            shouldInclude("probability") &&
            data.probability !== "" &&
            data.probability !== undefined &&
            data.probability !== null
        )
            formData.append("probability", data.probability)

        // Include expectedRevenue if it's dirty OR if its dependencies (estimatedValue/probability) are dirty
        const shouldIncludeRevenue =
            !isEditMode ||
            dirtyFields.expectedRevenue ||
            dirtyFields.estimatedValue ||
            dirtyFields.probability
        if (
            shouldIncludeRevenue &&
            data.expectedRevenue !== "" &&
            data.expectedRevenue !== undefined &&
            data.expectedRevenue !== null
        )
            formData.append("expectedRevenue", data.expectedRevenue)

        if (shouldInclude("nextStep") && data.nextStep?.trim())
            formData.append("nextStep", data.nextStep.trim())

        if (shouldInclude("remarks") && data.remarks?.trim())
            formData.append("remarks", data.remarks.trim())

        if (shouldInclude("followUp") && data.followUp)
            formData.append("followUp", format(data.followUp, "yyyy-MM-dd"))

        // Handle Proposal Fields
        // Only include if user is admin
        if (isAdminOrSuperAdmin) {
            // Validation is handled by RHF in ProposalUploadSection, but double check here if needed
            if (shouldInclude("proposalNumber") && data.proposalNumber) {
                formData.append("proposalNumber", data.proposalNumber)
            }

            if (
                shouldInclude("proposalDocument") &&
                data.proposalDocument instanceof File
            ) {
                formData.append("proposalDocument", data.proposalDocument)
            }
        }

        onSubmit(formData)
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

    // Determine if we should show proposal section
    const hasExistingProposalData =
        !!initialData?.proposalNumber || !!initialData?.proposalDocument
    const showProposalSection =
        isAdminOrSuperAdmin &&
        (opportunityStage === "proposal" || hasExistingProposalData)

    // If stage is changed away from proposal, we hide the section but RHF keeps values by default
    // ideally.

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
                                        onValueChange={(val) => {
                                            field.onChange(val)
                                            setSelectedCompanyId(val)
                                            onCompanyChange?.(val)
                                        }}
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
                                            {companies.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    {t("noCompaniesAvailable")}
                                                </div>
                                            ) : (
                                                companies.map((company) => (
                                                    <SelectItem
                                                        key={company._id}
                                                        value={company._id}
                                                        disabled={
                                                            company.isArchived
                                                        }
                                                        className={
                                                            company.isArchived
                                                                ? "text-muted-foreground opacity-70 data-[disabled]:pointer-events-auto data-[disabled]:cursor-not-allowed"
                                                                : ""
                                                        }
                                                    >
                                                        {company.name}
                                                        {company.isArchived
                                                            ? ` (${t("archivedData")})`
                                                            : ""}
                                                    </SelectItem>
                                                ))
                                            )}
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
                                label: t(stage.label) || stage.label,
                                color: stage.color,
                            }))}
                            showBadge
                        />

                        {/* Proposal Upload Section - Conditional */}
                        {showProposalSection && (
                            <ProposalUploadSection
                                control={control}
                                setValue={setValue}
                                watch={watch}
                                existingProposalDocument={
                                    initialData?.proposalDocument
                                }
                                isEditMode={isEditMode}
                            />
                        )}

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

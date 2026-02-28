import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { FormContainer, CommonDialog } from "@/components/common"
import {
    FormInput,
    FormSelect,
    FormDatePicker,
    CountryCodeSelect,
    BeneficiarySection,
} from "@/components/form-fields"
import {
    DEFAULT_COMPANY_VALUES,
    DEFAULT_BENEFICIARY_VALUES,
} from "@/constants/formOptions"
import { PROSPECTUS_STATUS_OPTIONS } from "@/utils/prospectusTransformers"
import { validateProspectusForm } from "@/utils/prospectusValidations"
import CompanyDetailsForm from "@/components/forms/leads/CompanyDetailsForm"

import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useEffect, useState } from "react"

export default function ProspectusForm({
    initialData,
    onSubmit,
    loading = false,
    submitLabel,
}){
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isEditMode = !!initialData

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    const defaultValues = useMemo(() => {
        if (initialData) {
            return initialData
        }

        // New form defaults
        return {
            companyDetails: { ...DEFAULT_COMPANY_VALUES },
            name: "",
            email: "",
            phoneCountryCode: "+966",
            phoneExtension: "",
            phoneNumber: "",
            department: "",
            remarks: "",
            status: "new",
            source: "",
            followUp: undefined,
            priority: 0,
            beneficiary: { ...DEFAULT_BENEFICIARY_VALUES },
        }
    }, [initialData])

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const {
        formState: { isDirty, isSubmitting },
    } = form

    // Warn about unsaved changes
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

    const handleSubmit = (data) => {
        if (!validateProspectusForm(data, form.setError, t)) return
        onSubmit(data)
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            navigate("/prospectus")
        }
    }

    const confirmLeave = () => {
        setShowUnsavedDialog(false)
        navigate("/prospectus")
    }

    const isSubmitDisabled = loading || (isEditMode && !isDirty)

    return (
        <>
            <FormContainer maxWidth="max-w-5xl">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col gap-8"
                        noValidate
                    >
                        {/* ── Company Details (reused from Leads) ── */}
                        <CompanyDetailsForm control={form.control} />

                        {/* ── Contact Person Details ── */}
                        <div className="space-y-6 rounded-lg border border-gray-100 shadow-sm bg-white p-6">
                            <div className="border-b pb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {t("contactDetails")}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {t("prospectusContactDescription")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    control={form.control}
                                    name="name"
                                    label={t("name")}
                                />
                                <FormInput
                                    control={form.control}
                                    name="email"
                                    label={t("email")}
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                />

                                {/* Phone fields - inline to avoid prefix issues */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[140px_1fr_100px] gap-4">
                                    <CountryCodeSelect
                                        control={form.control}
                                        name="phoneCountryCode"
                                        label={t("countryCode")}
                                        placeholder="+966"
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("phone")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        dir="ltr"
                                                        placeholder="123456789"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneExtension"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("phoneExt") || "Ext."}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        dir="ltr"
                                                        placeholder="101"
                                                        className="text-center"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormInput
                                    control={form.control}
                                    name="department"
                                    label={t("department")}
                                    placeholder={t("departmentPlaceholder")}
                                />

                                <FormSelect
                                    control={form.control}
                                    name="status"
                                    label={t("status")}
                                    placeholder={t("selectStatus")}
                                    options={PROSPECTUS_STATUS_OPTIONS.map(
                                        (opt) => ({
                                            ...opt,
                                            label: t(opt.label),
                                        }),
                                    )}
                                />

                                <FormInput
                                    control={form.control}
                                    name="source"
                                    label={t("source")}
                                    placeholder={t("sourcePlaceholder")}
                                />

                                <FormDatePicker
                                    control={form.control}
                                    name="followUp"
                                    label={t("followUp")}
                                    minDate={new Date()}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("priority")}
                                            </FormLabel>
                                            <FormControl>
                                                <input
                                                    {...field}
                                                    type="number"
                                                    min="0"
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseInt(
                                                                e.target
                                                                    .value,
                                                            ) || 0,
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Remarks — full width */}
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="remarks"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("remarks")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder={t(
                                                            "remarksPlaceholder",
                                                        )}
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Beneficiary section */}
                                <BeneficiarySection
                                    control={form.control}
                                    namePrefix="beneficiary"
                                />
                            </div>
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex gap-2 justify-end border-t pt-6">
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
                                className="min-w-[120px]"
                                title={
                                    isEditMode && !isDirty
                                        ? t("noChangesToSave")
                                        : undefined
                                }
                            >
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {submitLabel || t("saveProspectus")}
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
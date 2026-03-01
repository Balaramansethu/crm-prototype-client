import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormContainer, CommonDialog } from "@/components/common"
import {
    DEFAULT_COMPANY_VALUES,
    DEFAULT_CONTACT_VALUES,
} from "@/constants/formOptions"
import { validateProspectusForm } from "@/utils/prospectusValidations"
import { PROSPECTUS_STATUS_OPTIONS } from "@/utils/prospectusTransformers"
import CompanyDetailsForm from "@/components/forms/leads/CompanyDetailsForm"
import ContactPersonForm from "@/components/forms/leads/ContactPersonForm"

import { Loader2, UserPlus } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useEffect, useState, useRef, useCallback } from "react"

export default function ProspectusForm({
    initialData,
    onSubmit,
    loading = false,
    submitLabel,
    editableContactIndex = null,
    preventIdsScroll = false,
}) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isEditMode = !!initialData
    const hasRestrictedEdit = isEditMode && editableContactIndex !== null

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const contactRefs = useRef([])

    // Scroll to highlighted contact on mount
    useEffect(() => {
        if (
            !preventIdsScroll &&
            hasRestrictedEdit &&
            editableContactIndex !== null
        ) {
            const timer = setTimeout(() => {
                const targetRef = contactRefs.current[editableContactIndex]
                if (targetRef) {
                    targetRef.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    })
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [hasRestrictedEdit, editableContactIndex, preventIdsScroll])

    const setContactRef = useCallback((el, index) => {
        contactRefs.current[index] = el
    }, [])

    const defaultValues = useMemo(() => {
        if (initialData) {
            return initialData
        }

        // New form defaults
        return {
            companyDetails: { ...DEFAULT_COMPANY_VALUES },
            contacts: [
                {
                    ...DEFAULT_CONTACT_VALUES,
                    priority: 1,
                },
            ],
        }
    }, [initialData])

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const {
        formState: { isDirty, isSubmitting },
        control,
    } = form

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contacts",
    })

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

        // Filter out completely empty contacts (if user just clicks Add Contact but leaves it blank)
        // A contact is considered entered if they provided at least a name, email, or a phone number.
        const validContacts = data.contacts.filter(
            (c) => c.name?.trim() || c.email?.trim() || c.phoneNumber?.trim(),
        )
        // If they cleared the only contact, we'll still pass it to transformers so it handles the company-only logic
        const submissionData = {
            ...data,
            contacts:
                validContacts.length > 0
                    ? validContacts
                    : data.contacts.slice(0, 1), // Keep at least one empty contact wrapper
        }

        onSubmit(submissionData)
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
                        <CompanyDetailsForm
                            control={control}
                            hideServiceTypeAsterisk={true}
                        />

                        {/* ── Contact Persons Details ── */}
                        {fields.length > 0 && (
                            <div className="space-y-6">
                                <div className="border-b pb-2 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {t("contactPersons")}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t("prospectusContactDescription")}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <ContactPersonForm
                                            key={field.id}
                                            ref={(el) =>
                                                setContactRef(el, index)
                                            }
                                            control={control}
                                            index={index}
                                            onRemove={() => remove(index)}
                                            showRemoveButton={
                                                !isEditMode
                                                    ? index > 0
                                                    : !field._id
                                            }
                                            totalContacts={fields.length}
                                            disabled={
                                                preventIdsScroll ||
                                                (hasRestrictedEdit &&
                                                    index !==
                                                        editableContactIndex &&
                                                    field._id)
                                            }
                                            isHighlighted={
                                                !preventIdsScroll &&
                                                hasRestrictedEdit &&
                                                index === editableContactIndex
                                            }
                                            isEditMode={isEditMode}
                                            statusOptions={
                                                PROSPECTUS_STATUS_OPTIONS
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Action Buttons ── */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between border-t pt-6">
                            <div className="order-2 sm:order-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={preventIdsScroll}
                                    onClick={() => {
                                        const nextPriority = fields.length + 1
                                        append({
                                            ...DEFAULT_CONTACT_VALUES,
                                            priority: nextPriority,
                                        })
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t("addContactPerson") || "Add Contact"}
                                </Button>
                            </div>

                            <div className="flex gap-2 justify-end order-1 sm:order-2">
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

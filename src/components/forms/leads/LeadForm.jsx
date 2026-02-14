import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormContainer, CommonDialog } from "@/components/common"
import {
    DEFAULT_CONTACT_VALUES,
    DEFAULT_BENEFICIARY_VALUES,
    DEFAULT_ADDRESS_VALUES,
    DEFAULT_COMPANY_VALUES,
} from "@/constants/formOptions"
import { validateLeadForm } from "@/utils/leadFieldValidations"
import CompanyDetailsForm from "./CompanyDetailsForm"
import ContactPersonForm from "./ContactPersonForm"
import { BeneficiarySection } from "@/components/form-fields"

import { Loader2, UserPlus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo, useEffect, useState, useRef, useCallback } from "react"

export default function LeadForm({
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
    // In edit mode, if editableContactIndex is provided, only that contact is editable
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
            // Small delay to ensure DOM is ready
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
    }, [hasRestrictedEdit, editableContactIndex])

    // Callback ref setter for contact forms
    const setContactRef = useCallback((el, index) => {
        contactRefs.current[index] = el
    }, [])

    const defaultValues = useMemo(() => {
        // Helper to normalize phone data with migration logic for old records
        const normalizePhone = (phone) => {
            let countryCode = phone?.countryCode || "+966"
            let extension = phone?.extension || ""
            const number = phone?.number || ""

            // Old records stored country code in extension field (e.g. "+966")
            // If countryCode is missing from API AND extension looks like a country code
            if (!phone?.countryCode && extension.startsWith("+")) {
                countryCode = extension
                extension = ""
            }

            // Also clear extension if it's explicitly the default "+966" (legacy artifact)
            if (extension === "+966") {
                extension = ""
            }

            return {
                phoneCountryCode: countryCode,
                phoneExtension: extension,
                phoneNumber: number,
            }
        }

        const company = initialData?.company || {}
        // Get leads from company.leads (other contacts)
        const companyLeads = company?.leads || []
        const legacyContact = initialData?.contact || {}

        // Check if this is a single lead edit (contact fields at root level)
        // This happens when we fetch a lead by its ID - the lead data is at root
        const hasRootLevelLead = initialData?.name && initialData?._id

        // Build contacts array
        let contacts = []
        let allLeadsWithIds = [] // Track lead IDs for finding editable index

        if (hasRootLevelLead) {
            // The current lead is at root level
            const phone = normalizePhone(initialData.phone)
            const currentLead = {
                _id: initialData._id,
                name: initialData.name || "",
                email: initialData.email || "",
                ...phone,
                status: initialData.status || "new",
                source: initialData.source || "",
                followUp: initialData.followUp
                    ? new Date(initialData.followUp)
                    : undefined,
                department: initialData.department || "",
                remarks: initialData.remarks || "",
                priority: initialData.priority || 1,
                beneficiary: initialData.benificiary
                    ? {
                          name: initialData.benificiary.name || "",
                          ...normalizePhone(initialData.benificiary.phone),
                      }
                    : undefined,
            }

            // Convert company.leads to the same format, filtering out unnamed ones
            const otherLeads = companyLeads
                .filter((lead) => lead.name && lead.name.trim())
                .map((lead) => ({
                    _id: lead._id,
                    name: lead.name || "",
                    email: lead.email || "",
                    ...normalizePhone(lead.phone),
                    status: lead.status || "new",
                    source: lead.source || "",
                    followUp: lead.followUp
                        ? new Date(lead.followUp)
                        : undefined,
                    department: lead.department || "",
                    remarks: lead.remarks || "",
                    priority: lead.priority || 2,
                    beneficiary: lead.benificiary
                        ? {
                              name: lead.benificiary.name || "",
                              ...normalizePhone(lead.benificiary.phone),
                          }
                        : undefined,
                }))

            // Combine all leads and sort by priority
            allLeadsWithIds = [currentLead, ...otherLeads]
            allLeadsWithIds.sort(
                (a, b) => (a.priority || 99) - (b.priority || 99),
            )

            // Keep _id in contacts to identify existing ones in edit mode
            contacts = allLeadsWithIds.map((lead) => ({ ...lead }))

            // Store lead IDs for editable index calculation (will be used below)
            if (typeof window !== "undefined") {
                window.__leadIdsOrder = allLeadsWithIds.map((l) => l._id)
            }
        } else if (initialData?.leads?.length > 0) {
            // Response already has leads array at root (company-level fetch)
            contacts = initialData.leads
                .filter((lead) => lead.name && lead.name.trim())
                .map((lead, index) => ({
                    _id: lead._id,
                    name: lead.name || "",
                    email: lead.email || "",
                    ...normalizePhone(lead.phone),
                    status: lead.status || "new",
                    source: lead.source || "",
                    followUp: lead.followUp
                        ? new Date(lead.followUp)
                        : undefined,
                    department: lead.department || "",
                    remarks: lead.remarks || "",
                    priority: lead.priority || index + 1,
                    beneficiary: lead.benificiary
                        ? {
                              name: lead.benificiary.name || "",
                              ...normalizePhone(lead.benificiary.phone),
                          }
                        : undefined,
                }))
        } else if (legacyContact.name || initialData?.contact) {
            // Fallback to legacy single contact structure
            const legacyPhone = normalizePhone(
                legacyContact.phone || initialData?.phone,
            )
            contacts = [
                {
                    _id: initialData?._id || legacyContact?._id,
                    name:
                        legacyContact.name ||
                        (typeof initialData?.contact === "string"
                            ? initialData.contact
                            : ""),
                    email: legacyContact.email || initialData?.email || "",
                    ...legacyPhone,
                    status: initialData?.status || "new",
                    source: initialData?.source || "",
                    followUp: initialData?.followUp
                        ? new Date(initialData.followUp)
                        : undefined,
                    department:
                        legacyContact.department ||
                        initialData?.department ||
                        "",
                    remarks:
                        legacyContact.remarks || initialData?.remarks || "",
                    priority: legacyContact.priority || 1,
                    beneficiary: initialData?.benificiary
                        ? {
                              name: initialData.benificiary.name || "",
                              ...normalizePhone(initialData.benificiary.phone),
                          }
                        : undefined,
                },
            ]
        } else {
            // New form - start with one empty contact
            contacts = [
                {
                    name: "",
                    email: "",
                    phoneCountryCode: "+966",
                    phoneExtension: "",
                    phoneNumber: "",
                    status: "new",
                    source: "",
                    followUp: undefined,
                    department: "",
                    remarks: "",
                    priority: 1,
                    beneficiary: { ...DEFAULT_BENEFICIARY_VALUES },
                },
            ]
        }

        const companyPhone = normalizePhone(company.phone)
        const beneficiaryPhone = normalizePhone(initialData?.benificiary?.phone)

        return {
            companyDetails: {
                ...DEFAULT_COMPANY_VALUES,
                name:
                    company.name ||
                    (typeof initialData?.company === "string"
                        ? initialData.company
                        : "") ||
                    DEFAULT_COMPANY_VALUES.name,
                email: company.email || DEFAULT_COMPANY_VALUES.email,
                phoneCountryCode:
                    companyPhone.phoneCountryCode ||
                    DEFAULT_COMPANY_VALUES.phoneCountryCode,
                phoneExtension:
                    companyPhone.phoneExtension ||
                    DEFAULT_COMPANY_VALUES.phoneExtension,
                phoneNumber:
                    companyPhone.phoneNumber ||
                    DEFAULT_COMPANY_VALUES.phoneNumber,
                website:
                    company.website ||
                    initialData?.website ||
                    DEFAULT_COMPANY_VALUES.website,
                socialProfile:
                    company.socialProfile ||
                    initialData?.socialProfile ||
                    DEFAULT_COMPANY_VALUES.socialProfile,
                serviceType:
                    company.serviceType ||
                    initialData?.serviceType ||
                    DEFAULT_COMPANY_VALUES.serviceType,
                address: company.address || DEFAULT_COMPANY_VALUES.address,
            },
            contacts,
        }
    }, [initialData])

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const {
        formState: { isDirty, isSubmitting },
    } = form

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    })

    // Warn user about unsaved changes when navigating away
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
        if (!validateLeadForm(data, form.setError, t)) return

        // Filter out contacts that don't have a name (required for a valid contact)
        // This allows company-only submissions when no contact details are entered
        const validContacts = data.contacts
            .filter((c) => c.name?.trim())
            .map((c) => {
                // Map dropReason to droppedReason if present
                if (c.status === "dropped" && c.dropReason) {
                    return { ...c, droppedReason: c.dropReason }
                }
                return c
            })

        onSubmit({ ...data, contacts: validContacts })
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            navigate("/leads")
        }
    }

    const confirmLeave = () => {
        setShowUnsavedDialog(false)
        navigate("/leads")
    }

    // In edit mode, disable submit if no changes were made
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
                        <CompanyDetailsForm
                            control={form.control}
                            isHighlighted={preventIdsScroll}
                        />

                        {/* BeneficiarySection moved to ContactPersonForm */}

                        {fields.length > 0 && (
                            <div className="space-y-6">
                                <div className="border-b pb-2 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {t("contactPersons")}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t("contactPersonsDescription")}
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
                                            control={form.control}
                                            index={index}
                                            onRemove={() => remove(index)}
                                            beneficiaryDefaultOpen={
                                                !!field.beneficiary
                                            }
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
                                                    field._id) // Only disable existing contacts that aren't the primary edit target
                                            }
                                            isHighlighted={
                                                !preventIdsScroll &&
                                                hasRestrictedEdit &&
                                                index === editableContactIndex
                                            }
                                            isEditMode={isEditMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between border-t pt-6">
                            <div className="order-2 sm:order-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={preventIdsScroll}
                                    onClick={() => {
                                        // Auto-assign next priority number (1-based)
                                        const nextPriority = fields.length + 1
                                        append({
                                            ...DEFAULT_CONTACT_VALUES,
                                            priority: nextPriority,
                                        })
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t("addContactPerson")}
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
                                    {submitLabel || t("saveLead")}
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

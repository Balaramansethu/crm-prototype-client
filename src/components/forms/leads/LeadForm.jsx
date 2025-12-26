import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormContainer } from "@/components/common"
import { DEFAULT_CONTACT_VALUES } from "@/constants/formOptions"
import CompanyDetailsForm from "./CompanyDetailsForm"
import ContactPersonForm from "./ContactPersonForm"

import { Loader2, UserPlus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"

/**
 * Lead Form Component
 * Handles both create and edit modes for leads.
 * Uses modular sub-components for company and contact details.
 * 
 * @param {Object} props
 * @param {Object} [props.initialData] - Initial data for edit mode
 * @param {function} props.onSubmit - Form submission handler
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.submitLabel] - Custom submit button label
 */
export default function LeadForm({
    initialData,
    onSubmit,
    loading = false,
    submitLabel,
}) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const isEditMode = !!initialData

    const defaultValues = useMemo(
        () => ({
            companyDetails: {
                name: initialData?.company || "",
                phone: initialData?.companyPhone || "",
                website: initialData?.website || "",
                socialProfile: initialData?.socialProfile || "",
            },
            contacts: [
                {
                    name: initialData?.contact || "",
                    designation: initialData?.designation || "",
                    phoneExtension: initialData?.phone?.extension || "",
                    phoneNumber: initialData?.phone?.number || "",
                    email: initialData?.email || "",
                    priority: initialData?.priority || "medium",
                    status: initialData?.status || "new",
                    source: initialData?.source || "",
                    followUp: initialData?.followUp
                        ? new Date(initialData.followUp)
                        : undefined,
                },
            ],
        }),
        [initialData]
    )

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    })

    const handleSubmit = (data) => {
        // Validate Company
        if (!data.companyDetails.name?.trim()) {
            form.setError("companyDetails.name", {
                type: "manual",
                message: t("companyRequired"),
            })
            return
        }

        // Validate and filter contacts
        let hasErrors = false
        const validContacts = []

        data.contacts.forEach((contact, index) => {
            const isEmpty = !(
                contact.name?.trim() ||
                contact.phoneNumber?.trim() ||
                contact.email?.trim() ||
                contact.designation?.trim() ||
                (contact.phoneExtension && contact.phoneExtension.trim())
            )

            if (isEmpty) return // Skip empty contacts

            // Validate non-empty contacts
            if (!contact.name?.trim()) {
                form.setError(`contacts.${index}.name`, {
                    type: "manual",
                    message: t("contactRequired"),
                })
                hasErrors = true
            }

            if (!contact.phoneNumber?.trim()) {
                form.setError(`contacts.${index}.phoneNumber`, {
                    type: "manual",
                    message: t("phoneRequired"),
                })
                hasErrors = true
            } else if (contact.phoneNumber.length < 8) {
                form.setError(`contacts.${index}.phoneNumber`, {
                    type: "manual",
                    message: t("phoneTooShort"),
                })
                hasErrors = true
            }

            if (!contact.email?.trim()) {
                form.setError(`contacts.${index}.email`, {
                    type: "manual",
                    message: t("emailRequired"),
                })
                hasErrors = true
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
                form.setError(`contacts.${index}.email`, {
                    type: "manual",
                    message: t("emailInvalid"),
                })
                hasErrors = true
            }

            validContacts.push(contact)
        })

        if (hasErrors) return

        onSubmit({ ...data, contacts: validContacts })
    }

    const handleAddContact = () => {
        append(DEFAULT_CONTACT_VALUES)
    }

    return (
        <FormContainer maxWidth="max-w-5xl" className="mx-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-8"
                    noValidate
                >
                    {/* Company Details Section */}
                    <CompanyDetailsForm control={form.control} />

                    {/* Contact Persons Section - Only show if there are contacts */}
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
                                        control={form.control}
                                        index={index}
                                        onRemove={() => remove(index)}
                                        showRemoveButton={!isEditMode}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between border-t pt-6">
                        <div className="order-2 sm:order-1">
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddContact}
                                    className="w-full sm:w-auto"
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t("addContactPerson")}
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end order-1 sm:order-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/leads")}
                            >
                                {t("cancel")}
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-[120px]"
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
    )
}

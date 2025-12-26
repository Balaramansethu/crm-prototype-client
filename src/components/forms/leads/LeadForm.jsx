import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormContainer } from "@/components/common"
import { DEFAULT_CONTACT_VALUES } from "@/constants/formOptions"
import { validateLeadForm } from "@/utils/leadFieldValidations"
import CompanyDetailsForm from "./CompanyDetailsForm"
import ContactPersonForm from "./ContactPersonForm"

import { Loader2, UserPlus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"

export default function LeadForm({
    initialData,
    onSubmit,
    loading = false,
    submitLabel,
}) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const isEditMode = !!initialData

    const defaultValues = useMemo(() => {
        const company = initialData?.company || {}
        const contact = initialData?.contact || {}

        return {
            companyDetails: {
                name: company.name || (typeof initialData?.company === "string" ? initialData.company : ""),
                email: company.email || "",
                phoneExtension: company.phone?.extension || "",
                phoneNumber: company.phone?.number || "",
                website: company.website || initialData?.website || "",
                socialProfile: company.socialProfile || initialData?.socialProfile || "",
            },
            contacts: [
                {
                    name: contact.name || (typeof initialData?.contact === "string" ? initialData.contact : ""),
                    email: contact.email || initialData?.email || "",
                    phoneExtension: contact.phone?.extension || initialData?.phone?.extension || "",
                    phoneNumber: contact.phone?.number || initialData?.phone?.number || "",
                    status: initialData?.status || "new",
                    source: initialData?.source || "",
                    followUp: initialData?.followUp ? new Date(initialData.followUp) : undefined,
                },
            ],
        }
    }, [initialData])

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    })

    const handleSubmit = (data) => {
        if (!validateLeadForm(data, form.setError, t)) return

        const validContacts = data.contacts.filter(
            (c) => c.name?.trim() || c.email?.trim(),
        )

        onSubmit({ ...data, contacts: validContacts })
    }

    return (
        <FormContainer maxWidth="max-w-5xl" className="mx-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-8"
                    noValidate
                >
                    <CompanyDetailsForm control={form.control} />

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

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between border-t pt-6">
                        <div className="order-2 sm:order-1">
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => append(DEFAULT_CONTACT_VALUES)}
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

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"
// import { validateLeadFields } from "@/utils/leadFieldValidations"

import { Loader2, Plus, Trash2, UserPlus } from "lucide-react"
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
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const isRTL = useMemo(() => i18n.dir() === "rtl", [i18n])
    const isEditMode = !!initialData;

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
                }
            ],
        }),
        [initialData],
    )

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "contacts",
    });

    const handleSubmit = (data) => {
        const errors = {};
        
        // Validate Company
        if (!data.companyDetails.name?.trim()) {
            form.setError("companyDetails.name", { type: "manual", message: t("companyRequired") });
            return;
        }

        // Filter out completely empty contacts
        const nonEmptyContacts = data.contacts.filter(contact => {
            return (
                contact.name?.trim() ||
                contact.phoneNumber?.trim() ||
                contact.email?.trim() ||
                contact.designation?.trim() ||
                (contact.phoneExtension && contact.phoneExtension.trim())
            );
        });

        // Validate Non-Empty Contacts
        let hasErrors = false;
        nonEmptyContacts.forEach((contact, index) => {
            // Find the original index to set error correctly? 
            // Actually, if we filter, the indices shift in data passed to onSubmit, but for setError we need to map back to form state indices.
            // A simpler approach: iterate the Original array, check if empty, if not empty -> validate. 
        });

        // Refined approach:
        let validContacts = [];
        data.contacts.forEach((contact, index) => {
             const isEmpty = !(
                contact.name?.trim() ||
                contact.phoneNumber?.trim() ||
                contact.email?.trim() ||
                contact.designation?.trim() ||
                (contact.phoneExtension && contact.phoneExtension.trim())
            );

            if (isEmpty) {
                // Skip validation
                return;
            }

            // It's not empty, so it must be complete/valid:
            if (!contact.name?.trim()) {
                form.setError(`contacts.${index}.name`, { type: "manual", message: t("contactRequired") });
                hasErrors = true;
            }
            if (!contact.phoneNumber?.trim()) {
                 form.setError(`contacts.${index}.phoneNumber`, { type: "manual", message: t("phoneRequired") });
                 hasErrors = true;
            } else if (contact.phoneNumber.length < 8) {
                 form.setError(`contacts.${index}.phoneNumber`, { type: "manual", message: t("phoneTooShort") });
                 hasErrors = true;
            }
            // Email is required
             if (!contact.email?.trim()) {
                 form.setError(`contacts.${index}.email`, { type: "manual", message: t("emailRequired") });
                 hasErrors = true;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
                 form.setError(`contacts.${index}.email`, { type: "manual", message: t("emailInvalid") });
                 hasErrors = true;
            }

            validContacts.push(contact);
        });

        if (hasErrors) return;

        // Submit with filtered valid contacts
        onSubmit({ ...data, contacts: validContacts })
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 py-6 lg:px-6">
                <div className="max-w-5xl mx-auto rounded-md bg-white p-6 shadow-sm border">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="flex flex-col gap-8"
                            noValidate
                        >
                            {/* --- Master Form: Company Details --- */}
                            <div className="space-y-6">
                                <div className="border-b pb-2">
                                     <h3 className="text-xl font-semibold text-gray-900">{t("companyDetails")}</h3>
                                     <p className="text-sm text-gray-500">Enter the company information.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="companyDetails.name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("company")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className={isRTL ? "text-right" : ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="companyDetails.phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("companyPhone")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} dir="ltr" placeholder="+966..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="companyDetails.website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("website")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder={t("websitePlaceholder")} dir="ltr" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="companyDetails.socialProfile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("socialProfile")}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder={t("socialProfilePlaceholder")} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                             {/* --- Child Form: Contact Persons --- */}
                             <div className="space-y-6">
                                <div className="border-b pb-2 flex justify-between items-center">
                                     <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{t("contactPersons")}</h3>
                                        <p className="text-sm text-gray-500">Manage contact persons for this company.</p>
                                     </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="relative rounded-lg border p-6 bg-gray-50/50">
                                            {!isEditMode && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            
                                            <h4 className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t("contactPerson")} #{index + 1}</h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Name & Designation */}
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("name")}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} className={isRTL ? "text-right" : ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.designation`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("designation")}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder={t("designationPlaceholder")} className={isRTL ? "text-right" : ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Phone */}
                                                <div className="md:col-span-2 grid grid-cols-[100px_1fr] gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`contacts.${index}.phoneExtension`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t("extension")}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} dir="ltr" placeholder="+966" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`contacts.${index}.phoneNumber`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t("phone")}</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} dir="ltr" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Email & Priority */}
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.email`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("email")}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="email" placeholder={t("emailPlaceholder")} className={isRTL ? "text-right" : ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.priority`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("priority")}</FormLabel>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <FormControl>
                                                                    <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                                    <SelectItem value="high">{t("high")}</SelectItem>
                                                                    <SelectItem value="medium">{t("medium")}</SelectItem>
                                                                    <SelectItem value="low">{t("low")}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Status & Source */}
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.status`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("status")}</FormLabel>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <FormControl>
                                                                    <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                                        <SelectValue placeholder={t("selectStatus")} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                                    {[
                                                                        { value: "new", color: "bg-blue-100 text-blue-900" },
                                                                        { value: "qualified", color: "bg-green-100 text-green-900" },
                                                                        { value: "contacted", color: "bg-yellow-100 text-yellow-900" },
                                                                        { value: "done", color: "bg-gray-100 text-gray-900" },
                                                                    ].map((status) => (
                                                                        <SelectItem key={status.value} value={status.value}>
                                                                            <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", status.color)}>
                                                                                {t(status.value)}
                                                                            </span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.source`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("source")}</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder={t("sourcePlaceholder")} className={isRTL ? "text-right" : ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Follow Up */}
                                                <FormField
                                                    control={form.control}
                                                    name={`contacts.${index}.followUp`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t("followUp")}</FormLabel>
                                                            <FormControl>
                                                                <DatePicker
                                                                    selected={field.value}
                                                                    onChange={field.onChange}
                                                                    minDate={new Date()}
                                                                    placeholderText="DD-MM-YYYY"
                                                                    dateFormat="dd-MM-yyyy"
                                                                    className={cn(
                                                                        "h-10 w-full rounded-md border px-3 text-sm",
                                                                        isRTL ? "text-right" : "",
                                                                    )}
                                                                    wrapperClassName="w-full"
                                                                    showPopperArrow={false}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>

                            {/* Buttons Section */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between border-t pt-6">
                                <div className="order-2 sm:order-1">
                                    {!isEditMode && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => append({ 
                                                name: "", designation: "", phoneExtension: "", phoneNumber: "", email: "", priority: "medium", status: "new" 
                                            })}
                                            className="w-full sm:w-auto"
                                        >
                                           <UserPlus className="mr-2 h-4 w-4" /> {t("addContactPerson")}
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
                </div>
            </div>
        </div>
    )
}

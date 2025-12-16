import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { validateLeadFields } from "@/utils/leadFieldValidations"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LeadForm({ initialData, onSubmit, loading, submitLabel, title }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    const form = useForm({
        defaultValues: {
            company: "",
            contact: "",
            phoneExtension: "",
            phoneNumber: "",
            email: "",
            status: "new",
            source: "",
            followUp: undefined,
        },
    })

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                company: initialData.company || "",
                contact: initialData.contact || "",
                phoneExtension: initialData.phone?.extension || "",
                phoneNumber: initialData.phone?.number || "",
                email: initialData.email || "",
                status: initialData.status || "new",
                source: initialData.source || "",
                followUp: initialData.followUp ? new Date(initialData.followUp) : undefined,
            })
        }
    }, [initialData, form])

    const handleSubmit = (data) => {
        // Custom Validation
        const validationErrors = validateLeadFields(data)
        if (Object.keys(validationErrors).length > 0) {
            Object.keys(validationErrors).forEach((key) => {
                form.setError(key, {
                    type: "manual",
                    message: validationErrors[key],
                })
            })
            return
        }
        onSubmit(data)
    }

    return (
        <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                 {/* No header here, parent component handles layouts/breadcrumbs usually, 
                     but if we want to follow exact style of CreateLeadPage which had it inside:
                     we can keep the form pure and let the page handle the wrapper, 
                     OR we can put the wrapper here. 
                     The user asked for DRY. The header structure might differ slightly (Edit vs Create titles).
                     I'll stick to just the Form part in this component to be most flexible, 
                     but the wrapper styling in CreateLeadPage was nice. 
                     I will replicate the white box container here.
                 */}
                
                <div className="rounded-md border bg-white p-6 max-w-2xl">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="grid gap-6"
                        >
                            {/* Contact Name */}
                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("contact")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className={isRTL ? "text-right" : "text-left"} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Company */}
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("company")}</FormLabel>
                                        <FormControl>
                                            <Input {...field} className={isRTL ? "text-right" : "text-left"} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("email")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
                                                placeholder={t("emailPlaceholder")}
                                                className={isRTL ? "text-right" : "text-left"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone (Extension + Number) */}
                            <div className="grid grid-cols-[100px_1fr] gap-4">
                                <FormField
                                    control={form.control}
                                    name="phoneExtension"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("extension")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="+966"
                                                    dir="ltr" // Always LTR for phone extension
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
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

                            {/* Status and Source */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("status")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className={isRTL ? "text-right" : "text-left"}>
                                                        <SelectValue
                                                            placeholder={t("selectStatus")}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                    <SelectItem value="new">
                                                        {t("new")}
                                                    </SelectItem>
                                                    <SelectItem value="qualified">
                                                        {t("qualified")}
                                                    </SelectItem>
                                                    <SelectItem value="contacted">
                                                        {t("contacted")}
                                                    </SelectItem>
                                                    <SelectItem value="done">
                                                        {t("done")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="source"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("source")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t("sourcePlaceholder")}
                                                    className={isRTL ? "text-right" : "text-left"}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Follow Up */}
                            <FormField
                                control={form.control}
                                name="followUp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t("followUp")}</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                selected={field.value}
                                                onChange={(date) =>
                                                    field.onChange(date)
                                                }
                                                placeholderText="DD-MM-YYYY"
                                                dateFormat="dd-MM-yyyy"
                                                className={cn(
                                                    "w-full h-10 px-3 rounded-md border border-input bg-background text-sm",
                                                    isRTL ? "text-right" : "text-left"
                                                )}
                                                wrapperClassName="w-full"
                                                showPopperArrow={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/leads")}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={loading || (initialData && !form.formState.isDirty)}
                                >
                                    {loading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {submitLabel || t("saveLead")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}



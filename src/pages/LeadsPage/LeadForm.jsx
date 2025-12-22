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
import { validateLeadFields } from "@/utils/leadFieldValidations"

import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
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


    const defaultValues = useMemo(
        () => ({
            company: initialData?.company ?? "",
            contact: initialData?.contact ?? "",
            phoneExtension: initialData?.phone?.extension ?? "",
            phoneNumber: initialData?.phone?.number ?? "",
            email: initialData?.email ?? "",
            status: initialData?.status ?? "new",
            source: initialData?.source ?? "",
            followUp: initialData?.followUp
                ? new Date(initialData.followUp)
                : undefined,
        }),
        [initialData],
    )

    const form = useForm({
        defaultValues,
        mode: "onBlur",
    })


    const handleSubmit = (data) => {
        const validationErrors = validateLeadFields(data)

        if (Object.keys(validationErrors).length > 0) {
            Object.entries(validationErrors).forEach(([key, message]) => {
                form.setError(key, {
                    type: "manual",
                    message,
                })
            })
            return
        }

        onSubmit(data)
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 py-6 lg:px-6">
                <div className="max-w-2xl rounded-md border bg-white p-6">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="grid gap-6"
                            noValidate
                        >
                            {/* Contact Name */}
                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("contact")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className={
                                                    isRTL ? "text-right" : ""
                                                }
                                            />
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
                                            <Input
                                                {...field}
                                                className={
                                                    isRTL ? "text-right" : ""
                                                }
                                            />
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
                                                {...field}
                                                type="email"
                                                placeholder={t(
                                                    "emailPlaceholder",
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

                            {/* Phone */}
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
                                                    dir="ltr"
                                                    placeholder="+966"
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

                            {/* Status & Source */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("status")}</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger
                                                        className={
                                                            isRTL
                                                                ? "text-right"
                                                                : ""
                                                        }
                                                    >
                                                        <SelectValue
                                                            placeholder={t(
                                                                "selectStatus",
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent
                                                    dir={isRTL ? "rtl" : "ltr"}
                                                >
                                                    {[
                                                        { value: "new", color: "bg-blue-100 text-blue-900" },
                                                        { value: "qualified", color: "bg-green-100 text-green-900" },
                                                        { value: "contacted", color: "bg-yellow-100 text-yellow-900" },
                                                        { value: "done", color: "bg-gray-100 text-gray-900" },
                                                    ].map((status) => (
                                                        <SelectItem
                                                            key={status.value}
                                                            value={status.value}
                                                        >
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
                                    name="source"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("source")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t(
                                                        "sourcePlaceholder",
                                                    )}
                                                    className={
                                                        isRTL
                                                            ? "text-right"
                                                            : ""
                                                    }
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

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/leads")}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        (initialData && !form.formState.isDirty)
                                    }
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


import { Button } from "@/components/ui/button"
import * as React from "react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
// We need a way to select a lead. For now, we will use a simple Select populated by fetching leads.
// In a real large-scale app, this should be an async searchable combobox.
import { useLeads } from "@/hooks/useLeads"

export default function CallLogForm({ onSubmit, loading = false, initialData = null }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const isRTL = i18n.dir() === "rtl"

    // Fetch leads for the dropdown
    // Fetching 100 to hopefully get enough. Ideally, this needs pagination/search.
    const { data } = useLeads({ limit: 100 })
    const leads = data?.leads || []

    const defaultValues = useMemo(() => ({
        lead: initialData?.lead?._id || initialData?.lead || "",
        outcome: initialData?.outcome || "intrested",
        followUp: initialData?.followUp ? new Date(initialData.followUp) : null,
        remarks: initialData?.remarks || "",
    }), [initialData])

    const form = useForm({
        defaultValues,
    })

    // Reset form when initialData changes (important for edit page loading behavior)
    React.useEffect(() => {
        if (initialData) {
            form.reset({
                lead: initialData.lead?._id || initialData.lead || "",
                outcome: initialData.outcome || "intrested",
                followUp: initialData.followUp ? new Date(initialData.followUp) : null,
                remarks: initialData.remarks || "",
            })
        }
    }, [initialData, form])

    const handleSubmit = (data) => {
        // Basic validation
        if (!data.lead) {
            form.setError("lead", { type: "required", message: t("leadRequired") || "Lead is required" })
            return
        }
        if (!data.remarks) {
            form.setError("remarks", { type: "required", message: t("remarksRequired") || "Remarks is required" })
            return
        }

        onSubmit(data)
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 py-6 lg:px-6">
                <div className="max-w-2xl rounded-md border bg-white p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
                            
                            {/* Lead Selection */}
                            <FormField
                                control={form.control}
                                name="lead"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("leadName") || "Lead"}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                    <SelectValue placeholder={t("selectLead") || "Select a lead"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                {leads.map((lead) => (
                                                    <SelectItem key={lead._id || lead.id} value={lead._id || lead.id}>
                                                        {lead.contact} ({lead.company})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Outcome */}
                            <FormField
                                control={form.control}
                                name="outcome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("outcome") || "Outcome"}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={isRTL ? "text-right" : ""}>
                                                    <SelectValue placeholder={t("selectOutcome")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                                                <SelectItem value="intrested">{t("interested") || "Interested"}</SelectItem>
                                                <SelectItem value="not_intrested">{t("not_interested") || "Not Interested"}</SelectItem>
                                                <SelectItem value="contacted">{t("contacted") || "Contacted"}</SelectItem>
                                                <SelectItem value="done">{t("done") || "Done"}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Follow Up Date */}
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

                            {/* Remarks */}
                            <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("remarks") || "Remarks"}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className={cn("min-h-[100px]", isRTL ? "text-right" : "")}
                                                placeholder={t("enterRemarks") || "Enter call details..."}
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
                                    onClick={() => navigate("/call-logs")}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button type="submit" disabled={loading || !form.formState.isDirty}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("saveCallLog") || "Save Log"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

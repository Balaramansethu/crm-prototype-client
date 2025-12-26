import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormInput, FormSelect, FormDatePicker } from "@/components/form-fields"
import {
    LEAD_STATUS_OPTIONS,
    LEAD_PRIORITY_OPTIONS,
} from "@/constants/formOptions"
import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

/**
 * Contact Person Form Section
 * Handles individual contact person information in a Lead form.
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {number} props.index - Contact index in the array
 * @param {function} props.onRemove - Callback to remove this contact
 * @param {boolean} [props.showRemoveButton=true] - Whether to show remove button
 */
export default function ContactPersonForm({
    control,
    index,
    onRemove,
    showRemoveButton = true,
}) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    return (
        <div className="relative rounded-lg border p-6 bg-gray-50/50">
            {/* Header with title and delete button */}
            <div
                className={cn(
                    "flex items-center justify-between mb-4",
                    isRTL ? "flex-row-reverse" : "",
                )}
            >
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {t("contactPerson")} #{index + 1}
                </h4>
                {showRemoveButton && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name & Designation */}
                <FormInput
                    control={control}
                    name={`contacts.${index}.name`}
                    label={t("name")}
                />
                <FormInput
                    control={control}
                    name={`contacts.${index}.designation`}
                    label={t("designation")}
                    placeholder={t("designationPlaceholder")}
                />

                {/* Phone with Extension */}
                <div className="md:col-span-2 grid grid-cols-[100px_1fr] gap-4">
                    <FormField
                        control={control}
                        name={`contacts.${index}.phoneExtension`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("extension")}</FormLabel>
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
                        control={control}
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
                <FormInput
                    control={control}
                    name={`contacts.${index}.email`}
                    label={t("email")}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                />
                <FormSelect
                    control={control}
                    name={`contacts.${index}.priority`}
                    label={t("priority")}
                    options={LEAD_PRIORITY_OPTIONS}
                />

                {/* Status & Source */}
                <FormSelect
                    control={control}
                    name={`contacts.${index}.status`}
                    label={t("status")}
                    placeholder={t("selectStatus")}
                    options={LEAD_STATUS_OPTIONS}
                    showBadge
                />
                <FormInput
                    control={control}
                    name={`contacts.${index}.source`}
                    label={t("source")}
                    placeholder={t("sourcePlaceholder")}
                />

                {/* Follow Up */}
                <FormDatePicker
                    control={control}
                    name={`contacts.${index}.followUp`}
                    label={t("followUp")}
                    minDate={new Date()}
                />
            </div>
        </div>
    )
}

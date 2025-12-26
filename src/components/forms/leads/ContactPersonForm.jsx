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
} from "@/constants/formOptions"
import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

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
                <FormInput
                    control={control}
                    name={`contacts.${index}.name`}
                    label={`${t("name")} *`}
                />
                <FormInput
                    control={control}
                    name={`contacts.${index}.email`}
                    label={`${t("email")} *`}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                />

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
                                        placeholder="+91"
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

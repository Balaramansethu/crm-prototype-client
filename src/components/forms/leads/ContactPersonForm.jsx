import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormInput, FormSelect, FormDatePicker } from "@/components/form-fields"
import { LEAD_STATUS_OPTIONS, LEAD_STATUS_OPTIONS_EDIT, CALL_OUTCOME_OPTIONS } from "@/constants/formOptions"
import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useWatch } from "react-hook-form"

const ContactPersonForm = forwardRef(function ContactPersonForm(
    {
        control,
        index,
        onRemove,
        showRemoveButton = true,
        totalContacts = 1,
        disabled = false,
        isHighlighted = false,
        isEditMode = false,
    },
    ref,
) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    // Only show priority when there are multiple contacts
    const showPriority = totalContacts > 1

    // Watch the status field to conditionally show drop reason
    const status = useWatch({
        control,
        name: `contacts.${index}.status`,
    })

    const isDropped = status === "dropped"

    // Use different status options based on mode
    let statusOptions = isEditMode ? LEAD_STATUS_OPTIONS_EDIT : LEAD_STATUS_OPTIONS

    // Dynamic addition of current status if it matches an outcome but not in list
    if (status && !statusOptions.find((opt) => opt.value === status)) {
        const outcomeDef = CALL_OUTCOME_OPTIONS.find((opt) => opt.value === status)
        if (outcomeDef) {
            statusOptions = [
                ...statusOptions,
                { ...outcomeDef, label: outcomeDef.label },
            ]
        } else {
            statusOptions = [
                ...statusOptions,
                { value: status, label: status },
            ]
        }
    }

    return (
        <div
            ref={ref}
            className={cn(
                "relative rounded-lg border p-6 bg-gray-50/50 transition-all duration-300",
                disabled && "opacity-70 bg-gray-100/50",
                isHighlighted &&
                    "border-2 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20",
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between mb-4",
                    isRTL ? "flex-row-reverse" : "",
                )}
            >
                <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {t("contactPerson")} #{index + 1}
                        {disabled && (
                            <span className="ml-2 text-xs text-gray-400 normal-case">
                                ({t("readOnly") || "Read Only"})
                            </span>
                        )}
                    </h4>
                    {/* Priority Badge/Input - Only shown when multiple contacts */}
                    {showPriority && (
                        <FormField
                            control={control}
                            name={`contacts.${index}.priority`}
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 space-y-0">
                                    <FormLabel className="text-xs text-gray-500 whitespace-nowrap">
                                        {t("priority")}:
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            min={1}
                                            disabled={disabled}
                                            className="w-16 h-7 text-center text-sm font-medium"
                                            onChange={(e) => {
                                                const value = parseInt(
                                                    e.target.value,
                                                    10,
                                                )
                                                field.onChange(
                                                    value > 0 ? value : 1,
                                                )
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                {showRemoveButton && !disabled && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-primary shrink-0"
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
                    label={t("name")}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`contacts.${index}.email`}
                    label={t("email")}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    disabled={disabled}
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
                                        disabled={disabled}
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
                                    <Input
                                        {...field}
                                        dir="ltr"
                                        disabled={disabled}
                                    />
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
                    options={statusOptions.map((opt) => ({
                        ...opt,
                        label: t(opt.label),
                    }))}
                    showBadge
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`contacts.${index}.source`}
                    label={t("source")}
                    placeholder={t("sourcePlaceholder")}
                    disabled={disabled}
                />

                <FormDatePicker
                    control={control}
                    name={`contacts.${index}.followUp`}
                    label={t("followUp")}
                    minDate={new Date()}
                    disabled={disabled}
                />

                {/* Conditional Drop Reason Field - Only shown when status is 'dropped' */}
                {isDropped && (
                    <div className="md:col-span-2">
                        <FormField
                            control={control}
                            name={`contacts.${index}.dropReason`}
                            rules={{
                                required: isDropped ? t("dropReasonRequired") : false,
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t("dropReason")}{" "}
                                        <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder={t("dropReasonPlaceholder")}
                                            className={cn(
                                                "min-h-[80px]",
                                                isRTL ? "text-right" : "",
                                            )}
                                            disabled={disabled}
                                            aria-required="true"
                                            aria-describedby={`drop-reason-desc-${index}`}
                                        />
                                    </FormControl>
                                    <p
                                        id={`drop-reason-desc-${index}`}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {t("dropReasonDescription")}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    )
})

export default ContactPersonForm

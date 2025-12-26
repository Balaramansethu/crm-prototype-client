import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

/**
 * Reusable form select field with RTL support and styled badge options.
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} props.label - Label text
 * @param {string} [props.placeholder] - Select placeholder
 * @param {Array} props.options - Array of { value, color? } objects
 * @param {boolean} [props.showBadge=false] - Whether to show colored badge for options
 * @param {function} [props.onValueChange] - Custom change handler (receives value)
 */
export default function FormSelect({
    control,
    name,
    label,
    placeholder,
    options = [],
    showBadge = false,
    onValueChange,
}) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <Select
                        value={field.value}
                        onValueChange={onValueChange || field.onChange}
                    >
                        <FormControl>
                            <SelectTrigger
                                className={isRTL ? "text-right" : ""}
                            >
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                            {options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {showBadge && option.color ? (
                                        <span
                                            className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                                option.color,
                                            )}
                                        >
                                            {t(option.value)}
                                        </span>
                                    ) : (
                                        t(option.value)
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

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
 * @param {boolean} [props.disabled=false] - Whether select is disabled
 * @param {function} [props.onValueChange] - Custom change handler (receives value)
 */
export default function FormSelect({
    control,
    name,
    label,
    placeholder,
    options = [],
    showBadge = false,
    disabled = false,
    onValueChange,
}) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const selectedOption = options.find(
                    (o) => o.value === field.value,
                )
                const triggerColorClass =
                    showBadge && selectedOption?.color
                        ? selectedOption.color
                        : ""

                // Extract a "dot" color from the badge color if possible
                // Lead status colors are like "bg-blue-100 text-blue-900"
                // We'll try to find a darker version or just use the badge's text color as bg for the dot
                const getDotClass = (colorStr) => {
                    if (!colorStr) return "bg-slate-400"

                    // Try to match text color first: text-blue-900 -> bg-blue-500
                    const textMatch = colorStr.match(/text-([a-z]+)-([0-9]+)/)
                    if (textMatch) {
                        return `bg-${textMatch[1]}-500`
                    }

                    // Try to match background color: bg-blue-100 -> bg-blue-500
                    const bgMatch = colorStr.match(/bg-([a-z]+)-([0-9]+)/)
                    if (bgMatch) {
                        return `bg-${bgMatch[1]}-500`
                    }

                    return "bg-slate-400"
                }

                return (
                    <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <Select
                            value={field.value}
                            onValueChange={(val) => {
                                field.onChange(val)
                                if (onValueChange) onValueChange(val)
                            }}
                            disabled={disabled}
                        >
                            <FormControl>
                                <SelectTrigger
                                    className={cn(
                                        isRTL ? "text-right" : "",
                                        triggerColorClass,
                                        showBadge && "font-medium",
                                    )}
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
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        getDotClass(
                                                            option.color,
                                                        ),
                                                    )}
                                                />
                                                <span className="font-medium text-slate-700">
                                                    {option.label ||
                                                        t(option.value)}
                                                </span>
                                            </div>
                                        ) : (
                                            option.label || t(option.value)
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}

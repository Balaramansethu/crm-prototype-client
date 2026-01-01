import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

/**
 * Reusable form date picker field with RTL support.
 * By default, past dates are disabled (minDate is set to today).
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} props.label - Label text
 * @param {string} [props.placeholder="DD-MM-YYYY"] - Placeholder text
 * @param {string} [props.dateFormat="dd-MM-yyyy"] - Date format
 * @param {Date} [props.minDate] - Minimum selectable date (defaults to today)
 * @param {Date} [props.maxDate] - Maximum selectable date
 * @param {boolean} [props.allowPastDates=false] - Set to true to allow selecting past dates
 * @param {boolean} [props.disabled=false] - Whether date picker is disabled
 */
export default function FormDatePicker({
    control,
    name,
    label,
    placeholder = "DD-MM-YYYY",
    dateFormat = "dd-MM-yyyy",
    minDate,
    maxDate,
    allowPastDates = false,
    disabled = false,
}) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    // Set minDate to today if not provided and past dates are not allowed
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const effectiveMinDate = allowPastDates ? minDate : minDate || today

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            minDate={effectiveMinDate}
                            maxDate={maxDate}
                            placeholderText={placeholder}
                            dateFormat={dateFormat}
                            disabled={disabled}
                            className={cn(
                                "h-10 w-full rounded-md border px-3 text-sm",
                                isRTL ? "text-right" : "",
                                disabled &&
                                    "opacity-50 cursor-not-allowed bg-muted",
                            )}
                            wrapperClassName="w-full"
                            showPopperArrow={false}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

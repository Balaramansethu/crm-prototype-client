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
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} props.label - Label text
 * @param {string} [props.placeholder="DD-MM-YYYY"] - Placeholder text
 * @param {string} [props.dateFormat="dd-MM-yyyy"] - Date format
 * @param {Date} [props.minDate] - Minimum selectable date
 * @param {Date} [props.maxDate] - Maximum selectable date
 */
export default function FormDatePicker({
    control,
    name,
    label,
    placeholder = "DD-MM-YYYY",
    dateFormat = "dd-MM-yyyy",
    minDate,
    maxDate,
}) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

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
                            minDate={minDate}
                            maxDate={maxDate}
                            placeholderText={placeholder}
                            dateFormat={dateFormat}
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
    )
}

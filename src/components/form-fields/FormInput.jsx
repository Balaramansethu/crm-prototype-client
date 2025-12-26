import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

/**
 * Reusable form input field with RTL support and consistent styling.
 * 
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 * @param {string} props.name - Field name for the form
 * @param {string} props.label - Label text (translation key or string)
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.type="text"] - Input type (text, email, tel, etc.)
 * @param {string} [props.dir] - Text direction override (ltr/rtl)
 * @param {boolean} [props.disabled] - Whether input is disabled
 * @param {string} [props.className] - Additional CSS classes
 */
export default function FormInput({
    control,
    name,
    label,
    placeholder,
    type = "text",
    dir,
    disabled = false,
    className,
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
                        <Input
                            {...field}
                            type={type}
                            placeholder={placeholder}
                            dir={dir}
                            disabled={disabled}
                            className={cn(
                                isRTL && !dir ? "text-right" : "",
                                className
                            )}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

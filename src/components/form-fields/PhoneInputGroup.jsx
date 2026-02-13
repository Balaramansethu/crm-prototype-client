import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CountryCodeSelect from "./CountryCodeSelect"
import { useTranslation } from "react-i18next"

/**
 * Reusable phone input group with country code selector, number input, and extension input.
 *
 * Used for:
 * - Company phone
 * - Contact phone
 * - Beneficiary phone
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control
 * @param {string} props.namePrefix - Field name prefix (e.g. "companyDetails", "contacts.0", "beneficiary")
 * @param {boolean} [props.required=false] - Whether phone number is required
 * @param {boolean} [props.disabled=false] - Whether fields are disabled
 * @param {boolean} [props.showExtension=true] - Whether to show the extension field
 */
export default function PhoneInputGroup({
    control,
    namePrefix,
    required = false,
    disabled = false,
    showExtension = true,
}) {
    const { t } = useTranslation()

    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[140px_1fr_100px] gap-4">
            <CountryCodeSelect
                control={control}
                name={`${namePrefix}.phoneCountryCode`}
                label={t("countryCode")}
                disabled={disabled}
                placeholder="+966"
            />
            <FormField
                control={control}
                name={`${namePrefix}.phoneNumber`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            {t("phone")} {required && "*"}
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                dir="ltr"
                                disabled={disabled}
                                placeholder="123456789"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {showExtension && (
                <FormField
                    control={control}
                    name={`${namePrefix}.phoneExtension`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("phoneExt") || "Ext."}</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    dir="ltr"
                                    disabled={disabled}
                                    placeholder="101"
                                    className="text-center"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    )
}

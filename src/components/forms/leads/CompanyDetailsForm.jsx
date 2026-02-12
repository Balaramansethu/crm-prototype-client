import {
    FormInput,
    FormSelect,
    CountryCodeSelect,
} from "@/components/form-fields"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SERVICE_TYPE_OPTIONS } from "@/constants/formOptions"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export default function CompanyDetailsForm({
    control,
    disabled = false,
    isHighlighted = false,
}) {
    const { t } = useTranslation()

    return (
        <div
            className={cn(
                "space-y-6 rounded-lg p-6",
                disabled && "opacity-70",
                isHighlighted
                    ? "border-2 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                    : "border border-gray-100 shadow-sm bg-white",
            )}
        >
            <div className="border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                    {t("companyDetails")}
                </h3>
                <p className="text-sm text-gray-500">
                    {t("companyDetailsDescription")}
                    {disabled && (
                        <span className="ml-2 text-xs text-gray-400">
                            ({t("readOnly") || "Read Only"})
                        </span>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    control={control}
                    name="companyDetails.name"
                    label={`${t("company")} *`}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name="companyDetails.email"
                    label={t("email")}
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    disabled={disabled}
                />

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4">
                    <CountryCodeSelect
                        control={control}
                        name="companyDetails.phoneExtension"
                        label={t("extension")}
                        disabled={disabled}
                        placeholder="+966"
                    />
                    <FormField
                        control={control}
                        name="companyDetails.phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("phone")} *</FormLabel>
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

                {/* Service Type Dropdown */}
                <FormSelect
                    control={control}
                    name="companyDetails.serviceType"
                    label={`${t("serviceType")} *`}
                    placeholder={t("selectServiceType")}
                    options={SERVICE_TYPE_OPTIONS.map((opt) => ({
                        ...opt,
                        label: t(opt.label),
                    }))}
                    disabled={disabled}
                />

                <FormInput
                    control={control}
                    name="companyDetails.website"
                    label={t("website")}
                    placeholder={t("websitePlaceholder")}
                    dir="ltr"
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name="companyDetails.socialProfile"
                    label={t("socialProfile")}
                    placeholder={t("socialProfilePlaceholder")}
                    disabled={disabled}
                />
            </div>
        </div>
    )
}

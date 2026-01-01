import { FormInput } from "@/components/form-fields"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export default function CompanyDetailsForm({ control, disabled = false }) {
    const { t } = useTranslation()

    return (
        <div className={cn("space-y-6", disabled && "opacity-70")}>
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

                <div className="md:col-span-2 grid grid-cols-[100px_1fr] gap-4">
                    <FormField
                        control={control}
                        name="companyDetails.phoneExtension"
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

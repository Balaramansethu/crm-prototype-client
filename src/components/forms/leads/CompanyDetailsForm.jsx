import { FormInput } from "@/components/form-fields"
import { useTranslation } from "react-i18next"

/**
 * Company Details Form Section
 * Handles company-level information in a Lead form.
 * 
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control object
 */
export default function CompanyDetailsForm({ control }) {
    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            <div className="border-b pb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                    {t("companyDetails")}
                </h3>
                <p className="text-sm text-gray-500">
                    {t("companyDetailsDescription")}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    control={control}
                    name="companyDetails.name"
                    label={t("company")}
                />
                <FormInput
                    control={control}
                    name="companyDetails.phone"
                    label={t("companyPhone")}
                    placeholder="+966..."
                    dir="ltr"
                />
                <FormInput
                    control={control}
                    name="companyDetails.website"
                    label={t("website")}
                    placeholder={t("websitePlaceholder")}
                    dir="ltr"
                />
                <FormInput
                    control={control}
                    name="companyDetails.socialProfile"
                    label={t("socialProfile")}
                    placeholder={t("socialProfilePlaceholder")}
                />
            </div>
        </div>
    )
}

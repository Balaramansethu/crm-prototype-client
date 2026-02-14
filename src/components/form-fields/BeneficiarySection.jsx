import FormInput from "./FormInput"
import PhoneInputGroup from "./PhoneInputGroup"
import { useTranslation } from "react-i18next"

/**
 * Beneficiary section for the Lead form.
 * Collapsible section with name and phone fields.
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control
 * @param {boolean} [props.disabled=false] - Whether fields are disabled
 * @param {boolean} [props.defaultOpen=false] - Whether section is initially expanded
 */
export default function BeneficiarySection({
    control,
    namePrefix = "beneficiary",
    disabled = false,
}) {
    const { t } = useTranslation()
    return (
        <div className="md:col-span-2 space-y-4 rounded-lg border border-dashed border-gray-200 p-4 mt-2">
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {t("beneficiaryContactDetails")}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    control={control}
                    name={`${namePrefix}.name`}
                    label={t("beneficiaryName")}
                    placeholder={
                        t("beneficiaryNamePlaceholder") ||
                        "Enter beneficiary name"
                    }
                    disabled={disabled}
                />
                <PhoneInputGroup
                    control={control}
                    namePrefix={namePrefix}
                    disabled={disabled}
                    showExtension={true}
                />
            </div>
        </div>
    )
}

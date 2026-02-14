import { useTranslation } from "react-i18next"
import FormInput from "./FormInput"

/**
 * Reusable address fields section.
 * Renders door, street, area, city, pincode, short address.
 *
 * @param {Object} props
 * @param {Object} props.control - React Hook Form control (Used for FormInput)
 * @param {string} props.namePrefix - Field name prefix (e.g. "companyDetails.address")
 * @param {boolean} [props.disabled=false] - Whether fields are disabled
 */
export default function AddressFields({
    control,
    namePrefix,
    disabled = false,
}) {
    const { t } = useTranslation()

    return (
        <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-1">
                {t("address")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    control={control}
                    name={`${namePrefix}.door`}
                    label={t("door")}
                    placeholder={t("doorPlaceholder") || "Door/Unit No."}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`${namePrefix}.street`}
                    label={t("street")}
                    placeholder={t("streetPlaceholder") || "Street name"}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`${namePrefix}.area`}
                    label={t("area")}
                    placeholder={t("areaPlaceholder") || "Area/District"}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`${namePrefix}.city`}
                    label={t("city")}
                    placeholder={t("cityPlaceholder") || "City"}
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`${namePrefix}.pincode`}
                    label={t("pincode")}
                    placeholder="12345"
                    disabled={disabled}
                />
                <FormInput
                    control={control}
                    name={`${namePrefix}.shortAddress`}
                    label={t("shortAddress")}
                    placeholder="AAAA1234"
                    disabled={disabled}
                />
            </div>
        </div>
    )
}

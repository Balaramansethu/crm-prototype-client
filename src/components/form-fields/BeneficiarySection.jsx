import FormInput from "./FormInput"
import PhoneInputGroup from "./PhoneInputGroup"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

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
    defaultOpen = false,
}) {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="space-y-4 rounded-lg border border-gray-100 shadow-sm bg-white">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    "w-full flex items-center justify-between p-6 pb-2 text-left",
                    !isOpen && "pb-6",
                )}
            >
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {t("beneficiary")}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t("beneficiaryDescription")}
                    </p>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-gray-500 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {isOpen && (
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div /> {/* Spacer for grid alignment */}
                        <PhoneInputGroup
                            control={control}
                            namePrefix={namePrefix}
                            disabled={disabled}
                            showExtension={true}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

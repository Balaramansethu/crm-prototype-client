import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { createLead } from "@/service/leadsService"
import { useUserStore } from "@/store/userStore"
import { toast } from "sonner"
import { useState } from "react"
import { format } from "date-fns"
import LeadForm from "./LeadForm"

export default function CreateLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                company: data.company,
                contact: data.contact,
                email: data.email,
                status: data.status,
                owner: user?._id || user?.id,
            }

            if (data.source && data.source.trim() !== "") {
                payload.source = data.source
            }

            if (data.followUp) {
                payload.followUp = format(data.followUp, "yyyy-MM-dd")
            }

            if (data.phoneNumber && data.phoneNumber.trim() !== "") {
                payload.phone = {
                    number: data.phoneNumber,
                    extension: data.phoneExtension || "",
                }
            }

            await createLead(payload)
            toast.success(t("leadCreatedSuccess"))
            navigate("/leads")
        } catch (error) {
            console.error(error)
            const message =
                error?.response?.data?.message || t("somethingWrong")
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                {/* HEADER */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                        className="hover:text-foreground cursor-pointer"
                        onClick={() => navigate("/leads")}
                    >
                        {t("leads")}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                        {t("createLead")}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t("createLead")}
                    </h1>
                </div>
            </div>

            {/* Form Component */}
            <div className="-mt-8">
                <LeadForm
                    onSubmit={onSubmit}
                    loading={loading}
                    submitLabel={t("saveLead")}
                />
            </div>
        </div>
    )
}

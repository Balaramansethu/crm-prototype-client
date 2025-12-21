
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { createCallLog } from "@/service/callLogsService"
import { toast } from "sonner"
import { useState } from "react"
import { format } from "date-fns"
import CallLogForm from "./CallLogForm"

export default function CreateCallLogPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                lead: data.lead,
                outcome: data.outcome,
                remarks: data.remarks,
            }

            if (data.followUp) {
                payload.followUp = format(data.followUp, "yyyy-MM-dd")
            } else {
                // API requires followUp? The prompt says "required: [true, 'Follow up date is required']"
                // So verify if it's missing
                if (!payload.followUp) {
                     toast.error(t("followUpRequired") || "Follow up date is required")
                     setLoading(false)
                     return
                }
            }

            await createCallLog(payload)
            toast.success(t("callLogCreatedSuccess") || "Call log created successfully")
            navigate("/call-logs")
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || t("somethingWrong")
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
                        onClick={() => navigate("/call-logs")}
                    >
                        {t("callLogs") || "Call Logs"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                        {t("createCallLog") || "Create Call Log"}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t("createCallLog") || "Create Call Log"}
                    </h1>
                </div>
            </div>

            {/* Form Component */}
            <div className="-mt-8 px-4 lg:px-6">
                <CallLogForm
                    onSubmit={onSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}

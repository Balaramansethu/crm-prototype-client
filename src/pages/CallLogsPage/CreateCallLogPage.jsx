import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common"
import { CallLogForm } from "@/components/forms"
import { createCallLog } from "@/service/callLogsService"
import { toast } from "sonner"
import { useState } from "react"
import { format } from "date-fns"

export default function CreateCallLogPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const breadcrumbs = [
        { label: t("callLogs"), path: "/call-logs" },
        { label: t("createCallLog") },
    ]

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                outcome: data.outcome,
                remarks: data.remarks,
                callDuration: data.callDuration,
                callStartTime: data.callStartTime,
            }

            // Include lead ID if exists
            if (data.lead) {
                payload.lead = data.lead
            }

            // Include leadName and companyId if creating new lead
            if (data.leadName) {
                payload.leadName = data.leadName
                payload.companyId = data.companyId
            }

            if (data.followUp) {
                payload.followUp = format(data.followUp, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            } else {
                toast.error(t("followUpRequired"))
                setLoading(false)
                return
            }

            await createCallLog(payload)
            toast.success(t("callLogCreatedSuccess"))
            navigate("/call-logs")
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
            <PageHeader breadcrumbs={breadcrumbs} title={t("createCallLog")} />

            <div className="-mt-8 px-4 lg:px-6">
                <CallLogForm onSubmit={onSubmit} loading={loading} />
            </div>
        </div>
    )
}

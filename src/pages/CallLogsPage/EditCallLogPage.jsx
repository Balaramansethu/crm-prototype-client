import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common"
import { CallLogForm } from "@/components/forms"
import { updateCallLog, getCallLogById } from "@/service/callLogsService"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { format } from "date-fns"

export default function EditCallLogPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [initialData, setInitialData] = useState(null)
    const [fetching, setFetching] = useState(true)

    const breadcrumbs = [
        { label: t("callLogs"), path: "/call-logs" },
        { label: t("editCallLog") },
    ]

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const response = await getCallLogById(id)
                const logData = response.data
                setInitialData(logData)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadCallLog"))
                navigate("/call-logs")
            } finally {
                setFetching(false)
            }
        }
        if (id) {
            fetchLog()
        }
    }, [id, navigate, t])

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
            }

            await updateCallLog(id, payload)
            toast.success(t("callLogUpdatedSuccess"))
            navigate("/call-logs")
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || t("somethingWrong")
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex flex-1 items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <PageHeader
                breadcrumbs={breadcrumbs}
                title={t("editCallLog")}
            />

            <div className="-mt-8 px-4 lg:px-6">
                <CallLogForm
                    initialData={initialData}
                    onSubmit={onSubmit}
                    loading={loading}
                />
            </div>
        </div>
    )
}

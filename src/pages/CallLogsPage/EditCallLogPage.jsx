
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronRight, Loader2 } from "lucide-react"
import { updateCallLog, getCallLogById } from "@/service/callLogsService"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import CallLogForm from "./CallLogForm"

export default function EditCallLogPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [initialData, setInitialData] = useState(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const response = await getCallLogById(id)
                // Assuming response is the data object or response.data. 
                // Based on service it returns response.data
                // If response.data is wrapper: response.data.callLog ?
                // Response structure: { data: { _id: ..., lead: ..., ... } }
                // So response (from service) is the whole object.
                // We need response.data
                const logData = response.data
                setInitialData(logData)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadCallLog") || "Failed to load call log")
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
            toast.success(t("callLogUpdatedSuccess") || "Call log updated successfully")
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
                        {t("editCallLog") || "Edit Call Log"}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t("editCallLog") || "Edit Call Log"}
                    </h1>
                </div>
            </div>

            {/* Form Component */}
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

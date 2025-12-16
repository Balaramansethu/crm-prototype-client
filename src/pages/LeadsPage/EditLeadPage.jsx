import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronRight, Loader2 } from "lucide-react"
import { getLeadById, updateLead } from "@/service/leadsService"
import { toast } from "sonner"
import { format } from "date-fns"
import LeadForm from "./LeadForm"

export default function EditLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [initialData, setInitialData] = useState(null)

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const response = await getLeadById(id)
                setInitialData(response.data)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadLead"))
                navigate("/leads")
            } finally {
                setFetching(false)
            }
        }
        if (id) {
            fetchLead()
        }
    }, [id, navigate, t])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = {
                company: data.company,
                contact: data.contact,
                email: data.email,
                status: data.status,
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

            await updateLead(id, payload)
            toast.success(t("leadUpdatedSuccess"))
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

    if (fetching) {
        return (
            <div className="flex h-full items-center justify-center">
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
                        onClick={() => navigate("/leads")}
                    >
                        {t("leads")}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                        {t("editLead")}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{t("editLead")}</h1>
                </div>
            </div>

            {/* Form Component */}
            <div className="-mt-8">
                <LeadForm
                    initialData={initialData}
                    onSubmit={onSubmit}
                    loading={loading}
                    submitLabel={t("saveChanges")}
                />
            </div>
        </div>
    )
}

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
            // Flatten the nested structure back to flat payload for update
            // Flatten the nested structure back to flat payload for update
            const { companyDetails, contacts } = data;
            const contact = contacts && contacts.length > 0 ? contacts[0] : undefined;

            const payload = {
                company: companyDetails.name,
                contact: contact?.name || "",
                email: contact?.email || "",
                status: contact?.status || "new",
                designation: contact?.designation || "",
                priority: contact?.priority || "medium",
                website: companyDetails.website,
                socialProfile: companyDetails.socialProfile,
                companyPhone: companyDetails.phone,
            }

            if (contact?.source && contact.source.trim() !== "") {
                payload.source = contact.source
            }

            if (contact?.followUp) {
                payload.followUp = format(contact.followUp, "yyyy-MM-dd")
            }

            if (contact?.phoneNumber && contact.phoneNumber.trim() !== "") {
                payload.phone = {
                    number: contact.phoneNumber,
                    extension: contact.phoneExtension || "",
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

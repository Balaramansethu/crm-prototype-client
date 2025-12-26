import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common"
import { LeadForm } from "@/components/forms"
import { getLeadById, updateLead } from "@/service/leadsService"
import { toast } from "sonner"
import { format } from "date-fns"

export default function EditLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [initialData, setInitialData] = useState(null)

    const breadcrumbs = [
        { label: t("leads"), path: "/leads" },
        { label: t("editLead") },
    ]

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
            const { companyDetails, contacts } = data
            const contact =
                contacts && contacts.length > 0 ? contacts[0] : undefined

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
            <PageHeader breadcrumbs={breadcrumbs} title={t("editLead")} />

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

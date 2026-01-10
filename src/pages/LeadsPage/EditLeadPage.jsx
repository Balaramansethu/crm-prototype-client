import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common"
import { LeadForm } from "@/components/forms"
import { getLeadById, updateLead } from "@/service/leadsService"
import { transformLeadUpdatePayload } from "@/utils/leadTransformers"
import { toast } from "sonner"

export default function EditLeadPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams() // This is the lead (contact) ID
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [initialData, setInitialData] = useState(null)
    const [editableContactIndex, setEditableContactIndex] = useState(null)

    const breadcrumbs = [
        { label: t("leads"), path: "/leads" },
        { label: t("editLead") },
    ]

    useEffect(() => {
        const fetchLead = async () => {
            try {
                // Fetch the individual lead data
                const response = await getLeadById(id)
                const leadData = response.data

                if (!leadData) {
                    toast.error(t("failedToLoadLead"))
                    navigate("/leads")
                    return
                }

                // Check if this is a root-level lead with company.leads
                const hasRootLevelLead = leadData?.name && leadData?._id
                const companyLeads = leadData?.company?.leads || []

                if (hasRootLevelLead) {
                    // Build the combined leads list same as LeadForm does
                    const currentLead = {
                        _id: leadData._id,
                        priority: leadData.priority || 1,
                    }
                    const otherLeads = companyLeads.map((lead) => ({
                        _id: lead._id,
                        priority: lead.priority || 2,
                    }))

                    // Combine and sort by priority (same logic as LeadForm)
                    const allLeads = [currentLead, ...otherLeads]
                    allLeads.sort(
                        (a, b) => (a.priority || 99) - (b.priority || 99),
                    )

                    // Find index of the current lead in sorted array
                    const contactIndex = allLeads.findIndex(
                        (lead) => lead._id === id,
                    )
                    setEditableContactIndex(
                        contactIndex !== -1 ? contactIndex : 0,
                    )
                } else if (leadData?.leads?.length > 0) {
                    // Response already has leads array at root (company-level fetch)
                    const contactIndex = leadData.leads.findIndex(
                        (lead) => lead._id === id,
                    )
                    setEditableContactIndex(
                        contactIndex !== -1 ? contactIndex : 0,
                    )
                } else {
                    // Single lead, it's the only one
                    setEditableContactIndex(0)
                }

                setInitialData(leadData)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadLead"))
                navigate("/leads")
            } finally {
                setFetching(false)
            }
        }
        if (id) fetchLead()
    }, [id, navigate, t])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = transformLeadUpdatePayload(
                data,
                editableContactIndex,
            )
            // Update using the lead ID (not company ID)
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

    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const focus = searchParams.get("focus")

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
                    editableContactIndex={editableContactIndex}
                    preventIdsScroll={focus === "company"}
                />
            </div>
        </div>
    )
}

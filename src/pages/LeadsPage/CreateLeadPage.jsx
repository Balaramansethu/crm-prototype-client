import { useTranslation } from "react-i18next"
import { useNavigate, useLocation } from "react-router-dom"
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
    const location = useLocation()
    const user = useUserStore((state) => state.user)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const { companyDetails, contacts } = data;
            const createdLeads = [];

            if (!contacts || contacts.length === 0) {
                 const payload = {
                    company: companyDetails.name,
                    contact: "",
                    email: "",
                    status: "new",
                    owner: user?._id || user?.id,
                    website: companyDetails.website,
                    socialProfile: companyDetails.socialProfile,
                    companyPhone: companyDetails.phone 
                 }
                 const createdLead = await createLead(payload)
                 createdLeads.push(createdLead);
            } else {
                for (const contact of contacts) {
                    const payload = {
                        company: companyDetails.name,
                        contact: contact.name,
                        email: contact.email,
                        status: contact.status,
                        owner: user?._id || user?.id,
                        designation: contact.designation,
                        priority: contact.priority,
                        website: companyDetails.website,
                        socialProfile: companyDetails.socialProfile,
                        companyPhone: companyDetails.phone 
                    }

                    if (contact.source && contact.source.trim() !== "") {
                        payload.source = contact.source
                    }

                    if (contact.followUp) {
                        payload.followUp = format(contact.followUp, "yyyy-MM-dd")
                    }

                    if (contact.phoneNumber && contact.phoneNumber.trim() !== "") {
                        payload.phone = {
                            number: contact.phoneNumber,
                            extension: contact.phoneExtension || "",
                        }
                    }

                    const createdLead = await createLead(payload)
                    createdLeads.push(createdLead);
                }
            }

            toast.success(t("leadCreatedSuccess"))
            
            const searchParams = new URLSearchParams(location.search)
            const returnTo = searchParams.get("returnTo")

            if (returnTo) {
                // Use the Last created lead ID if multiple
                const lastLead = createdLeads[createdLeads.length - 1];
                const leadId = lastLead._id  || lastLead.lead?._id || lastLead.data?._id
                
                const separator = returnTo.includes('?') ? '&' : '?'
                navigate(`${returnTo}${separator}newLeadId=${leadId}`)
            } else {
                navigate("/leads")
            }
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

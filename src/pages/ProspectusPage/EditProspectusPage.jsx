import { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common"
import { ProspectusForm } from "@/components/forms/prospectus"
import {
    getProspectusById,
    updateProspectus,
} from "@/service/prospectusService"
import {
    extractFormDefaults,
    transformProspectusUpdatePayload,
} from "@/utils/prospectusTransformers"
import { toast } from "sonner"

export default function EditProspectusPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [initialData, setInitialData] = useState(null)
    const [editableContactIndex, setEditableContactIndex] = useState(null)
    const originalDataRef = useRef(null)

    const breadcrumbs = [
        { label: t("prospectus"), path: "/prospectus" },
        { label: t("editProspectus") },
    ]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProspectusById(id)
                const data = response.data

                if (!data) {
                    toast.error(t("failedToLoadProspectus"))
                    navigate("/prospectus")
                    return
                }

                const formDefaults = extractFormDefaults(data)

                // Find index of the current prospectus in sorted array
                const contactIndex = formDefaults.contacts?.findIndex(
                    (c) => c._id === id,
                )
                setEditableContactIndex(contactIndex !== -1 ? contactIndex : 0)

                originalDataRef.current = formDefaults
                setInitialData(formDefaults)
            } catch (error) {
                console.error(error)
                toast.error(t("failedToLoadProspectus"))
                navigate("/prospectus")
            } finally {
                setFetching(false)
            }
        }
        if (id) fetchData()
    }, [id, navigate, t])

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const payload = transformProspectusUpdatePayload(
                data,
                originalDataRef.current,
                editableContactIndex,
            )

            if (Object.keys(payload).length === 0) {
                toast.info(t("noChangesToSave"))
                setLoading(false)
                return
            }

            await updateProspectus(id, payload)
            toast.success(t("prospectusUpdatedSuccess"))
            navigate("/prospectus")
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
            <PageHeader breadcrumbs={breadcrumbs} title={t("editProspectus")} />

            <div className="-mt-8 px-2 sm:px-4 lg:px-12">
                <ProspectusForm
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

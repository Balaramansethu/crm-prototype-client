import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { Loader2, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getCompanyActivity } from "@/service/pipelineService"
import StatusBadge from "./StatusBadge"

/**
 * Activity card component showing call log activity for a company.
 * Displays lead status changes with timestamps.
 *
 * @param {Object} props
 * @param {string} props.companyId - The company ID to fetch activity for
 * @param {string} [props.className] - Additional CSS classes
 */
export default function CompanyActivityCard({ companyId, className }) {
    const { t } = useTranslation()
    const [activityData, setActivityData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchActivity = async () => {
            if (!companyId) {
                setActivityData([])
                return
            }
            setLoading(true)
            try {
                const response = await getCompanyActivity(companyId)
                const data = response.data || response
                setActivityData(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Failed to fetch activity:", error)
                setActivityData([])
            } finally {
                setLoading(false)
            }
        }
        fetchActivity()
    }, [companyId])

    if (!companyId) return null

    return (
        <div className={cn("lg:w-96 shrink-0", className)}>
            <Card className="mt-6">
                <CardHeader className="border-b py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {t("activity")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : activityData.length === 0 ? (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                            {t("noDataAvailable")}
                        </div>
                    ) : (
                        <div className="max-h-[500px] overflow-y-auto">
                            {activityData.map((item, index) => {
                                // Get current status
                                const currentStatus = item?.outcome || "new"
                                // Get previous status from next item (older entry) or default to "new"
                                const nextItem = activityData[index + 1]
                                const previousStatus =
                                    nextItem?.outcome || "new"

                                return (
                                    <div
                                        key={item._id || index}
                                        className="flex gap-3 px-4 py-2 border-b last:border-b-0 hover:bg-muted/30"
                                    >
                                        {/* Avatar/Icon */}
                                        <div className="shrink-0">
                                            <div className="text-[10px] mt-1.5 -ml-2 text-muted-foreground">
                                                {t("createdBy")} :
                                            </div>
                                            <div className="mt-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                                {item.leadDetails?.contact?.name?.charAt(
                                                    0,
                                                ) || "L"}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Created By Badge */}
                                            {item.leadDetails?.createdBy && (
                                                <Badge
                                                    variant="ghost"
                                                    className="mb-2 text-[10px] py-2 px-2 h-4"
                                                >
                                                    {
                                                        item.leadDetails
                                                            .createdBy.firstName
                                                    }{" "}
                                                    {
                                                        item.leadDetails
                                                            .createdBy.lastName
                                                    }
                                                </Badge>
                                            )}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-foreground truncate">
                                                    {item.leadDetails?.contact
                                                        ?.name ||
                                                        t("unknownContact")}
                                                </span>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {item.updatedAt
                                                        ? format(
                                                              new Date(
                                                                  item.updatedAt,
                                                              ),
                                                              "d MMM, h:mm a",
                                                          )
                                                        : "-"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {t("stageChanged")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <StatusBadge
                                                    status={previousStatus}
                                                    className="text-xs"
                                                />
                                                <span className="text-muted-foreground">
                                                    →
                                                </span>
                                                <StatusBadge
                                                    status={currentStatus}
                                                    className="text-xs"
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    ({t("stage")})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

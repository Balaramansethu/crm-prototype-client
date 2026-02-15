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
                                const currentStatus = item?.outcome || "new"
                                const nextItem = activityData[index + 1]
                                const previousStatus = nextItem?.outcome || "new"

                                const currentDate = new Date(item.updatedAt)
                                const previousDate = nextItem?.updatedAt ? new Date(nextItem.updatedAt) : null

                                let gapText = null
                                if (previousDate) {
                                  const diffTime = Math.abs(currentDate - previousDate);
                                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
                                  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
                                  
                                  const parts = [];
                                  if (diffDays > 0) {
                                      parts.push(`${diffDays} ${diffDays === 1 ? t("day") : t("days")}`);
                                      if (diffHours > 0) parts.push(`${diffHours} ${diffHours === 1 ? t("hour") : t("hours")}`);
                                  } else if (diffHours > 0) {
                                      parts.push(`${diffHours} ${diffHours === 1 ? t("hour") : t("hours")}`);
                                      if (diffMinutes > 0) parts.push(`${diffMinutes} ${diffMinutes === 1 ? t("minute") : t("minutes")}`);
                                  } else {
                                      parts.push(`${diffMinutes} ${diffMinutes === 1 ? t("minute") : t("minutes")}`);
                                  }
                                  
                                  gapText = `(${parts.join(" ")})`
                                }

                                return (
                                    <div
                                        key={item._id || index}
                                        className="flex gap-3 px-4 py-2 border-b last:border-b-0 hover:bg-muted/30"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-sm font-medium text-foreground truncate">
                                                    {item.leadDetails?.contact?.name || t("unknownContact")}
                                                </span>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {item.updatedAt
                                                            ? format(new Date(item.updatedAt), "d MMM, h:mm a")
                                                            : "-"}
                                                    </span>
                                                    {item.createdBy && (
                                                        <Badge
                                                            variant="ghost"
                                                            className="mt-1 text-[10px] py-0.5 px-2 h-4 max-w-[100px] truncate"
                                                            title={`${item.createdBy.firstName || ""} ${item.createdBy.lastName || ""}`.trim()}
                                                        >
                                                            {item.createdBy.firstName} {item.createdBy.lastName}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5 ml-1.5">
                                                {t("stageChanged")}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <StatusBadge
                                                    status={currentStatus}
                                                    className="text-xs"
                                                />
                                                {gapText && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {gapText}
                                                    </span>
                                                )}
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

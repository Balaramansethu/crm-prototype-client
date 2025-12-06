import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
    const { t } = useTranslation()

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* ---------- Card 1 ---------- */}
            <Card className="@container/card">
                <CardHeader className="flex items-start justify-between text-start">
                    <div>
                        <CardDescription>{t("totalRevenue")}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            $1,250.00
                        </CardTitle>
                    </div>

                    <CardAction>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <IconTrendingUp className="size-4" />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>

                <CardFooter className="flex flex-col gap-1.5 text-sm items-start text-start">
                    <div className="line-clamp-1 flex items-center gap-2 font-medium">
                        {t("trendingUpThisMonth")}
                        <IconTrendingUp className="size-4" />
                    </div>

                    <div className="text-muted-foreground">
                        {t("visitorsLast6Months")}
                    </div>
                </CardFooter>
            </Card>

            {/* ---------- Card 2 ---------- */}
            <Card className="@container/card">
                <CardHeader className="flex items-start justify-between text-start">
                    <div>
                        <CardDescription>{t("newCustomers")}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            1,234
                        </CardTitle>
                    </div>

                    <CardAction>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <IconTrendingDown className="size-4" />
                            -20%
                        </Badge>
                    </CardAction>
                </CardHeader>

                <CardFooter className="flex flex-col gap-1.5 text-sm items-start text-start">
                    <div className="line-clamp-1 flex items-center gap-2 font-medium">
                        {t("downThisPeriod", { percent: "20%" })}
                        <IconTrendingDown className="size-4" />
                    </div>

                    <div className="text-muted-foreground">
                        {t("acquisitionNeedsAttention")}
                    </div>
                </CardFooter>
            </Card>

            {/* ---------- Card 3 ---------- */}
            <Card className="@container/card">
                <CardHeader className="flex items-start justify-between text-start">
                    <div>
                        <CardDescription>{t("activeAccounts")}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            45,678
                        </CardTitle>
                    </div>

                    <CardAction>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <IconTrendingUp className="size-4" />
                            +12.5%
                        </Badge>
                    </CardAction>
                </CardHeader>

                <CardFooter className="flex flex-col gap-1.5 text-sm items-start text-start">
                    <div className="line-clamp-1 flex items-center gap-2 font-medium">
                        {t("strongUserRetention")}
                        <IconTrendingUp className="size-4" />
                    </div>

                    <div className="text-muted-foreground">
                        {t("engagementExceedTargets")}
                    </div>
                </CardFooter>
            </Card>

            {/* ---------- Card 4 ---------- */}
            <Card className="@container/card">
                <CardHeader className="flex items-start justify-between text-start">
                    <div>
                        <CardDescription>{t("growthRate")}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            4.5%
                        </CardTitle>
                    </div>

                    <CardAction>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <IconTrendingUp className="size-4" />
                            +4.5%
                        </Badge>
                    </CardAction>
                </CardHeader>

                <CardFooter className="flex flex-col gap-1.5 text-sm items-start text-start">
                    <div className="line-clamp-1 flex items-center gap-2 font-medium">
                        {t("steadyPerformanceIncrease")}
                        <IconTrendingUp className="size-4" />
                    </div>

                    <div className="text-muted-foreground">
                        {t("meetsGrowthProjections")}
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

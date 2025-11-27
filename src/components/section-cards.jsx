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
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === "ar"

  const headerAlign = isRTL ? "text-right" : "text-left"
  const footerAlign =
    "flex flex-col gap-1.5 text-sm " +
    (isRTL ? "items-end text-right" : "items-start text-left")
  const rowDir = isRTL ? "flex-row-reverse" : "flex-row"

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* ---------- Card 1 ---------- */}
      <Card className="@container/card">
        <CardHeader
          className={`flex items-start justify-between ${headerAlign}`}
        >
          <div>
            <CardDescription>{t("totalRevenue")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              $1,250.00
            </CardTitle>
          </div>

          <CardAction>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${rowDir}`}
            >
              <IconTrendingUp className="size-4" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className={footerAlign}>
          <div className={`line-clamp-1 flex items-center gap-2 font-medium ${rowDir}`}>
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
        <CardHeader
          className={`flex items-start justify-between ${headerAlign}`}
        >
          <div>
            <CardDescription>{t("newCustomers")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              1,234
            </CardTitle>
          </div>

          <CardAction>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${rowDir}`}
            >
              <IconTrendingDown className="size-4" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className={footerAlign}>
          <div className={`line-clamp-1 flex items-center gap-2 font-medium ${rowDir}`}>
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
        <CardHeader
          className={`flex items-start justify-between ${headerAlign}`}
        >
          <div>
            <CardDescription>{t("activeAccounts")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              45,678
            </CardTitle>
          </div>

          <CardAction>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${rowDir}`}
            >
              <IconTrendingUp className="size-4" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className={footerAlign}>
          <div className={`line-clamp-1 flex items-center gap-2 font-medium ${rowDir}`}>
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
        <CardHeader
          className={`flex items-start justify-between ${headerAlign}`}
        >
          <div>
            <CardDescription>{t("growthRate")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              4.5%
            </CardTitle>
          </div>

          <CardAction>
            <Badge
              variant="outline"
              className={`flex items-center gap-1 ${rowDir}`}
            >
              <IconTrendingUp className="size-4" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className={footerAlign}>
          <div className={`line-clamp-1 flex items-center gap-2 font-medium ${rowDir}`}>
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

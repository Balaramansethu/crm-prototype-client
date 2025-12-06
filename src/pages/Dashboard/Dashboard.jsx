import { useEffect, useState } from "react"
import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
    fetchDashboard,
    fetchAdminDashboard,
    fetchSuperAdminDashboard,
} from "@/service/dashboardService"

import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogOut, User, Mail, Shield } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)

    const isRTL = i18n.language === "ar"

    const fetchForRoute = async () => {
        setLoading(true)
        try {
            let response
            if (location.pathname === "/dashboard/super-admin") {
                response = await fetchSuperAdminDashboard()
            } else if (location.pathname === "/dashboard/admin") {
                response = await fetchAdminDashboard()
            } else {
                response = await fetchDashboard()
            }
            setDashboardData(response)
        } catch (err) {
            const message = err?.response?.data?.message || t("somethingWrong")
            toast.error(message)

            if (err?.response?.status === 401) navigate("/login")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchForRoute()
    }, [location.pathname])

    const renderCards = () => {
        const cards = dashboardData?.data?.cards || dashboardData?.error?.cards
        if (!cards) return null

        const borderColor =
            user.role === "admin"
                ? "border-green-200"
                : user.role === "super_admin"
                  ? "border-purple-200"
                  : ""

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
                {cards.map((card, index) => (
                    <Card key={index} className={borderColor}>
                        <CardHeader>
                            <CardTitle>{t(card.title) || card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base">
                                {t(card.description) || card.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />

                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>

                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                <div className="animate-fadeIn mt-4 px-4 lg:px-6">
                    {!loading && dashboardData && renderCards()}
                </div>
            </div>
        </div>
    )
}

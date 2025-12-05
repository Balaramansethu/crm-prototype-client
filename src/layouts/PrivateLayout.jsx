import { Navigate, Outlet } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PrivateLayout() {
    const user = useUserStore((s) => s.user)
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    if (!user) return <Navigate to="/" replace />

    return (
        <div dir={isRTL ? "rtl" : "ltr"}>
            <SidebarProvider
                style={{
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                }}
            >
                <AppSidebar variant="inset" side={isRTL ? "right" : "left"} />

                <SidebarInset>
                    <SiteHeader />

                    <div className="flex flex-1 flex-col">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}

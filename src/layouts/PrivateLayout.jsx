import { Navigate, Outlet } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { useTranslation } from "react-i18next"
import { SiteHeader } from "@/components/site-header"
import {
    FloatingSidebar,
    FloatingSidebarProvider,
    MainContent,
} from "@/components/floating-sidebar"

export default function PrivateLayout() {
    const user = useUserStore((s) => s.user)
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    if (!user) return <Navigate to="/" replace />

    return (
        <FloatingSidebarProvider>
            <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
                {/* Floating Sidebar */}
                <FloatingSidebar />

                {/* Main Content Area - Full Screen */}
                <MainContent className="flex flex-col">
                    <SiteHeader />
                    <div className="flex flex-1 flex-col p-4 lg:p-6">
                        <Outlet />
                    </div>
                </MainContent>
            </div>
        </FloatingSidebarProvider>
    )
}


import { Navigate, Outlet } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { useTranslation } from "react-i18next"
import { SiteHeader } from "@/components/site-header"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function PrivateLayout() {
    const user = useUserStore((s) => s.user)
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    if (!user) return <Navigate to="/" replace />

    return (
        <SidebarProvider>
            <div
                dir={isRTL ? "rtl" : "ltr"}
                className="flex min-h-screen w-full bg-background overflow-hidden"
            >
                {/* shadcn Sidebar */}
                <AppSidebar />

                {/* Main Content Area */}
                <SidebarInset>
                    <SiteHeader />
                    {/* Responsive padding: smaller on mobile, larger on desktop */}
                    {/* min-w-0 lets the flex child shrink below content width */}
                    <div className="flex flex-1 flex-col min-w-0 p-2 sm:p-4 lg:p-6">
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

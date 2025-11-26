import * as React from "react"
import {
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"
import LanguageToggle from "@/components/LanguageToggle"
import { useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/store/userStore"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useTranslation } from "react-i18next"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }) {
    const user = useUserStore((s) => s.user)
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()


    return (
        <div dir="ltr">
        <Sidebar collapsible="offcanvas" {...props}>
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* ✅ ONLY ONE CHILD FOR asChild */}
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#" className="flex items-center gap-2">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">
                                    CRM Tool
                                </span>
                            </a>
                        </SidebarMenuButton>

                        {/* ✅ LanguageToggle MUST BE OUTSIDE asChild */}
                        <div className="mt-2 px-2">
                            <LanguageToggle />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent>
                <SidebarMenu className="mb-4">
                    {/* Employee dashboard */}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={location.pathname === "/dashboard"}
                            onClick={() => navigate("/dashboard")}
                        >
                            <IconDashboard className="me-2 h-4 w-4" />
                            {t("employeeDashboard")}
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {(user.role === "admin" || user.role === "super_admin") && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={
                                    location.pathname === "/dashboard/admin"
                                }
                                onClick={() => navigate("/dashboard/admin")}
                            >
                                <IconUsers className="me-2 h-4 w-4" />
                                {t("adminDashboard")}

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {user.role === "super_admin" && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={
                                    location.pathname ===
                                    "/dashboard/super-admin"
                                }
                                onClick={() =>
                                    navigate("/dashboard/super-admin")
                                }
                            >
                                <IconListDetails className="me-2 h-4 w-4" />
                                {t("superAdminDashboard")}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>

                {/* EVERYTHING BELOW IS OPTIONAL NAVIGATION */}
                <NavMain
                    items={[
                        {
                            title: t("overview"),
                            url: "#",
                            icon: IconDashboard,
                        },
                    ]}
                />

                <NavDocuments
                    items={[
                        { name: t("dataLibrary"), icon: IconDatabase, url: "#" },
                        { name: t("reports"), icon: IconReport, url: "#" },
                        {
                            name: t("wordAssistant"),
                            icon: IconFileWord,
                            url: "#",
                        },
                    ]}
                />

                <NavSecondary
                    className="mt-auto"
                    items={[
                        { title: t("settings"), icon: IconSettings, url: "#" },
                        { title: t("help"), icon: IconHelp, url: "#" },
                        { title: t("search"), icon: IconSearch, url: "#" },
                    ]}
                />
            </SidebarContent>

            {/* FOOTER USER CARD */}
            <SidebarFooter>
                <NavUser
                    user={{
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        avatar: user.profileImage || "",
                    }}
                />
            </SidebarFooter>
        </Sidebar> </div>
    )
}

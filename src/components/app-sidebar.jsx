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
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    return (
        <Sidebar
            collapsible="offcanvas"
            {...props}
            dir={isRTL ? "rtl" : "ltr"}
            className={isRTL ? "rtl" : "ltr"}
        >
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#" className="flex items-center gap-2">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">
                                    {t("crmTool")}
                                </span>
                            </a>
                        </SidebarMenuButton>

                        <div
                            className={`mt-2 px-2 ${
                                isRTL ? "text-right" : "text-left"
                            }`}
                        >
                            <LanguageToggle />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent>
                <SidebarMenu className="mb-1 pl-2">
                        <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={location.pathname === "/dashboard/leads"}
                            onClick={() => navigate("/leads")}
                            className="flex items-center gap-2"
                        >
                            <IconListDetails className="h-4 w-4" />
                            <span>{t("leads")}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            isActive={location.pathname === "/dashboard"}
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2"
                        >
                            <IconDashboard className="h-4 w-4" />
                            <span>{t("employeeDashboard")}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {(user.role === "admin" || user.role === "super_admin") && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={
                                    location.pathname === "/dashboard/admin"
                                }
                                onClick={() => navigate("/dashboard/admin")}
                                className="flex items-center gap-2"
                            >
                                <IconUsers className="h-4 w-4" />
                                <span>{t("adminDashboard")}</span>
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
                                className="flex items-center gap-2"
                            >
                                <IconListDetails className="h-4 w-4" />
                                <span>{t("superAdminDashboard")}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>

                {/* MAIN NAV */}
                <NavMain
                    items={[
                        {
                            title: t("overview"),
                            url: "#",
                            icon: IconDashboard,
                        },
                    ]}
                />

                {/* DOCUMENTS */}
                <NavDocuments
                    items={[
                        {
                            name: t("dataLibrary"),
                            icon: IconDatabase,
                            url: "#",
                        },
                        { name: t("reports"), icon: IconReport, url: "#" },
                        {
                            name: t("wordAssistant"),
                            icon: IconFileWord,
                            url: "#",
                        },
                    ]}
                />

                {/* SECONDARY */}
                <NavSecondary
                    className="mt-2"
                    items={[
                        { title: t("settings"), icon: IconSettings, url: "#" },
                        { title: t("help"), icon: IconHelp, url: "#" },
                        { title: t("search"), icon: IconSearch, url: "#" },
                    ]}
                />
            </SidebarContent>

            {/* FOOTER USER CARD */}
            <SidebarFooter className={isRTL ? "text-right" : "text-left"}>
                <NavUser
                    user={{
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                        avatar: user.profileImage || "",
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    )
}

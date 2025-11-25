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

import { useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/store/userStore"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

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

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">
                                    CRM Tool
                                </span>
                            </a>
                        </SidebarMenuButton>
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
                            <IconDashboard className="mr-2 h-4 w-4" />
                            Employee Dashboard
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
                                <IconUsers className="mr-2 h-4 w-4" />
                                Admin Dashboard
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
                                <IconListDetails className="mr-2 h-4 w-4" />
                                Super Admin Dashboard
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>

                {/* EVERYTHING BELOW IS OPTIONAL NAVIGATION */}
                <NavMain
                    items={[
                        {
                            title: "Overview",
                            url: "#",
                            icon: IconDashboard,
                        },
                    ]}
                />

                <NavDocuments
                    items={[
                        { name: "Data Library", icon: IconDatabase, url: "#" },
                        { name: "Reports", icon: IconReport, url: "#" },
                        {
                            name: "Word Assistant",
                            icon: IconFileWord,
                            url: "#",
                        },
                    ]}
                />

                <NavSecondary
                    className="mt-auto"
                    items={[
                        { title: "Settings", icon: IconSettings, url: "#" },
                        { title: "Help", icon: IconHelp, url: "#" },
                        { title: "Search", icon: IconSearch, url: "#" },
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
        </Sidebar>
    )
}

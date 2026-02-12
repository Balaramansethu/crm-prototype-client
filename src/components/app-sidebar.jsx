import {
    IconArchive,
    IconLayoutKanban,
    IconListDetails,
    IconPhone,
} from "@tabler/icons-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar"
import LanguageToggle from "@/components/LanguageToggle"
import { useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { useTranslation } from "react-i18next"

export function AppSidebar({ ...props }) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const navigate = useNavigate()
    const location = useLocation()
    const user = useUserStore((s) => s.user)
    const { setOpenMobile, isMobile } = useSidebar()

    // Primary navigation items
    const mainNavItems = [
        {
            icon: IconListDetails,
            label: t("leads"),
            path: "/leads",
            isActive: location.pathname.startsWith("/leads"),
        },
        {
            icon: IconPhone,
            label: t("callLogs"),
            path: "/call-logs",
            isActive: location.pathname.startsWith("/call-logs"),
        },
        {
            icon: IconLayoutKanban,
            label: t("pipeline"),
            path: "/pipeline",
            isActive: location.pathname.startsWith("/pipeline"),
        },
    ]

    // Add archived for super_admin
    if (user?.role === "super_admin") {
        mainNavItems.push({
            icon: IconArchive,
            label: t("archivedData"),
            path: "/archived",
            isActive: location.pathname.startsWith("/archived"),
        })
    }

    const handleNavClick = (path) => {
        navigate(path)
        // Close mobile sidebar on navigation
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    return (
            <Sidebar
                collapsible="offcanvas"
                side={isRTL ? "right" : "left"}
                {...props}
            >
                {/* ─── Header: Logo + Company Name ─── */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <img
                                        src="https://bunny-wp-pullzone-dgpgtislbk.b-cdn.net/wp-content/uploads/2023/12/Datasack_tech_logo4_240X240_72dpi.png"
                                        alt="Datasack Logo"
                                        className="size-5 object"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {t("datasack")}
                                    </span>
                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        CRM Platform
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* ─── Content: Navigation Groups ─── */}
                <SidebarContent>
                    {/* Language Toggle Group */}
                    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                        <SidebarGroupContent>
                            <div className="px-1">
                                <LanguageToggle />
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

                    {/* Primary Navigation */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {mainNavItems.map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            isActive={item.isActive}
                                            tooltip={item.label}
                                            onClick={() =>
                                                handleNavClick(item.path)
                                            }
                                        >
                                            <item.icon className="size-4" />
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
    )
}

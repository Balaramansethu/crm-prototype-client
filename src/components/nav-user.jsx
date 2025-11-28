import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

import { useTranslation } from "react-i18next"
import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"

export function NavUser() {
    const { isMobile } = useSidebar()
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const { t } = useTranslation()

    // Generate initials
    const initials =
        `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            {/* Avatar */}
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                {user?.profileImage ? (
                                    <AvatarImage
                                        src={user.profileImage}
                                        alt={`${user.firstName} ${user.lastName}`}
                                    />
                                ) : (
                                    <AvatarFallback className="rounded-lg">
                                        {initials}
                                    </AvatarFallback>
                                )}
                            </Avatar>

                            {/* User Details */}
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.email}
                                </span>
                            </div>

                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    {/* Dropdown Content */}
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user?.profileImage ? (
                                        <AvatarImage
                                            src={user.profileImage}
                                            alt={`${user.firstName} ${user.lastName}`}
                                        />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">
                                            {initials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        {/* LOGOUT */}
                        <DropdownMenuItem onClick={() => logout.mutate(null)}>
                            <IconLogout />
                            {t("logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

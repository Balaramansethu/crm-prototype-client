import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserPlus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { InviteModal } from "@/components/InviteModal"

export function SiteHeader() {
    const { t } = useTranslation()
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const [inviteModalOpen, setInviteModalOpen] = useState(false)

    // Generate initials for avatar fallback
    const initials =
        `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()

    return (
        <>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex w-full items-center gap-2 px-4 lg:px-6">
                    {/* Sidebar Toggle */}
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />


                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer outline-none">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user?.profileImage ? (
                                        <AvatarImage
                                            src={user.profileImage}
                                            alt={`${user?.firstName} ${user?.lastName}`}
                                        />
                                    ) : (
                                        <AvatarFallback className="rounded-lg bg-primary/30 text-primary">
                                            {initials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="min-w-56 rounded-lg"
                            align="end"
                            sideOffset={8}
                        >
                            {/* User Info */}
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {user?.profileImage ? (
                                            <AvatarImage
                                                src={user.profileImage}
                                                alt={`${user?.firstName} ${user?.lastName}`}
                                            />
                                        ) : (
                                            <AvatarFallback className="rounded-lg bg-primary/30 text-primary">
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

                            {/* Invite - super_admin only */}
                            {user?.role === "super_admin" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setInviteModalOpen(true)
                                        }
                                        className="cursor-pointer"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {t("invite")}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}

                            {/* Logout */}
                            <DropdownMenuItem
                                onClick={() => logout.mutate(null)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                {t("logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Invite Modal */}
            <InviteModal
                open={inviteModalOpen}
                onOpenChange={setInviteModalOpen}
            />
        </>
    )
}

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
import { IconLogout, IconUserPlus, IconMenu2 } from "@tabler/icons-react"
import { InviteModal } from "@/components/InviteModal"
import { useFloatingSidebar } from "@/components/floating-sidebar"

export function SiteHeader() {
    const { t } = useTranslation()
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const { expand } = useFloatingSidebar()

    // Generate initials for avatar fallback
    const initials =
        `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()

    return (
        <>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex w-full items-center gap-2 px-4 lg:px-6">
                    {/* Mobile Menu Button - visible only on mobile */}
                    <button
                        onClick={expand}
                        className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors"
                        aria-label="Open menu"
                    >
                        <IconMenu2 className="h-5 w-5" />
                    </button>

                    {/* Logo and Title */}
                    <div className="flex items-center gap-2">
                        {/* Logo - visible on mobile only since sidebar has it on desktop */}
                        <img
                            src="https://bunny-wp-pullzone-dgpgtislbk.b-cdn.net/wp-content/uploads/2023/12/Datasack_tech_logo4_240X240_72dpi.png"
                            alt="Datasack Logo"
                            className="w-7 h-7 rounded object-contain md:hidden"
                        />
                        <h1 className="text-base font-medium">
                            {t("datasack")}
                        </h1>
                    </div>

                    {/* Spacer to push user menu to the right */}
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
                                        <AvatarFallback className="rounded-m bg-primary/30 text-primary">
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
                            {/* User Info Label */}
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {user?.profileImage ? (
                                            <AvatarImage
                                                src={user.profileImage}
                                                alt={`${user?.firstName} ${user?.lastName}`}
                                            />
                                        ) : (
                                            <AvatarFallback className="rounded-m bg-primary/30 text-primary">
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

                            {/* Invite Button - Only visible for super_admin */}
                            {user?.role === "super_admin" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => setInviteModalOpen(true)}
                                        className="cursor-pointer"
                                    >
                                        <IconUserPlus className="mr-2 h-4 w-4" />
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
                                <IconLogout className="mr-2 h-4 w-4" />
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

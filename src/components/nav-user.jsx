import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/userStore"
import { useTranslation } from "react-i18next"

export function NavUser() {
    const user = useUserStore((s) => s.user)
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    // Generate initials
    const initials =
        `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()

    return (
        <div
            className={`flex items-center gap-3 px-2 py-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
            {/* Avatar */}
            <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
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

            {/* User Details */}
            <div
                className={`grid flex-1 text-sm leading-tight min-w-0 ${isRTL ? "text-right" : "text-left"}`}
            >
                <span className="truncate font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                </span>
            </div>
        </div>
    )
}

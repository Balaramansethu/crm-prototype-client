import * as React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IconUserPlus, IconLink } from "@tabler/icons-react"
import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

import {
    checkInviteStatus,
    inviteMembers,
    getOrganizationMembers,
} from "@/service/organizationService"

export function InviteModal({ open, onOpenChange }) {
    const { t } = useTranslation()
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("member")
    const [members, setMembers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isMembersLoading, setIsMembersLoading] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [emailError, setEmailError] = useState("")

    // Fetch organization members when modal opens
    useEffect(() => {
        if (open) {
            fetchMembers()
        }
    }, [open])

    const fetchMembers = async () => {
        setIsMembersLoading(true)
        try {
            const response = await getOrganizationMembers()
            setMembers(response?.data || response || [])
        } catch (error) {
            console.error("Failed to fetch members:", error)
            // Use mock data for demo
            setMembers([
                {
                    id: "1",
                    name: "Bala",
                    email: "bala@datasack.in",
                    username: "bala19406339",
                    role: "member",
                    status: "active",
                    isCurrentUser: true,
                },
                {
                    id: "2",
                    name: "Thirunavukkarasu",
                    email: "thiru@datasack.in",
                    username: "thiruthanikaiarasu",
                    role: "admin",
                    status: "active",
                },
                {
                    id: "3",
                    name: "Prabanjan Jeyasankar",
                    email: "prabanjan@datasack.in",
                    username: "prabanjanjeyasankar1",
                    role: "member",
                    status: "active",
                },
            ])
        } finally {
            setIsMembersLoading(false)
        }
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validateDomain = (email) => {
        // Only allow @datasack.in domain
        return email.toLowerCase().endsWith("@datasack.in")
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        setEmailError("") // Clear error when user types
    }

    const handleInvite = async () => {
        if (!email.trim()) {
            setEmailError(t("emailRequired"))
            return
        }

        if (!validateEmail(email)) {
            setEmailError(t("emailInvalid"))
            return
        }

        if (!validateDomain(email)) {
            setEmailError(t("invalidDomain"))
            return
        }

        setEmailError("") // Clear any previous errors

        setIsInviting(true)
        try {
            // Check if user is already a member
            const statusResponse = await checkInviteStatus(email)
            if (statusResponse?.isAlreadyMember) {
                toast.error(t("alreadyAMember"))
                return
            }

            // Send invite
            await inviteMembers([{ email, role }])
            toast.success(t("inviteSent"))
            setEmail("")
            setRole("member")
            fetchMembers() // Refresh members list
        } catch (error) {
            console.error("Failed to invite:", error)
            toast.error(t("failedToInvite"))
        } finally {
            setIsInviting(false)
        }
    }

    const handleCreateLink = () => {
        // Placeholder for create link functionality
        toast.info(t("featureComingSoon"))
    }

    const getInitials = (name) => {
        if (!name) return "?"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const getAvatarColor = (name) => {
        const colors = [
            "bg-red-500",
            "bg-orange-500",
            "bg-amber-500",
            "bg-yellow-500",
            "bg-lime-500",
            "bg-green-500",
            "bg-emerald-500",
            "bg-teal-500",
            "bg-cyan-500",
            "bg-sky-500",
            "bg-blue-500",
            "bg-indigo-500",
            "bg-violet-500",
            "bg-purple-500",
            "bg-fuchsia-500",
            "bg-pink-500",
            "bg-rose-500",
        ]
        if (!name) return colors[0]
        const index = name.charCodeAt(0) % colors.length
        return colors[index]
    }

    const getRoleDisplay = (memberRole) => {
        if (memberRole === "admin") return t("admin")
        return t("member")
    }

    const getRoleDescription = (member) => {
        if (member.role === "admin") return t("workspaceAdmin")
        return t("workspaceGuest")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[500px] bg-white border border-gray-200 text-gray-900 shadow-2xl rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="text-lg text-center font-semibold text-gray-900">
                        {t("shareBoard")}
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="px-5 pb-5 space-y-4">
                    {/* Email input section */}
                    <div className="space-y-2">
                        {/* Desktop: horizontal layout */}
                        <div className="hidden sm:flex gap-2">
                            <Input
                                type="email"
                                placeholder={t("emailPlaceholderInvite")}
                                value={email}
                                onChange={handleEmailChange}
                                className={`flex-1 h-10 bg-white border text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 rounded-lg text-sm ${
                                    emailError 
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100" 
                                        : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
                                }`}
                            />
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-[120px] h-10 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium text-sm">
                                    <SelectValue placeholder={t("member")} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                                    <SelectItem
                                        value="member"
                                        className="text-gray-900 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {t("member")}
                                    </SelectItem>
                                    <SelectItem
                                        value="admin"
                                        className="text-gray-900 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {t("admin")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting || !email.trim()}
                                className="h-10 bg-gray-900 hover:bg-gray-800 text-white px-5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                {isInviting ? t("loading") : t("share")}
                            </Button>
                        </div>

                        {/* Mobile: stacked layout */}
                        <div className="flex sm:hidden flex-col gap-2">
                            <Input
                                type="email"
                                placeholder={t("emailPlaceholderInvite")}
                                value={email}
                                onChange={handleEmailChange}
                                className={`w-full h-11 bg-white border text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 rounded-lg text-sm ${
                                    emailError 
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100" 
                                        : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
                                }`}
                            />
                            <div className="flex gap-2">
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="flex-1 h-11 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium text-sm">
                                        <SelectValue placeholder={t("member")} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                                        <SelectItem
                                            value="member"
                                            className="text-gray-900 hover:bg-gray-50 cursor-pointer"
                                        >
                                            {t("member")}
                                        </SelectItem>
                                        <SelectItem
                                            value="admin"
                                            className="text-gray-900 hover:bg-gray-50 cursor-pointer"
                                        >
                                            {t("admin")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleInvite}
                                    disabled={isInviting || !email.trim()}
                                    className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    {isInviting ? t("loading") : t("share")}
                                </Button>
                            </div>
                        </div>

                        {/* Error message */}
                        {emailError && (
                            <p className="text-sm text-red-500 flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Board members section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {t("boardMembers")}
                            </span>
                            {!isMembersLoading && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                    {members.length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-0.5 max-h-[180px] sm:max-h-[220px] overflow-y-auto -mx-1 px-1">
                            {isMembersLoading ? (
                                // Skeleton loading state
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2.5 py-2 px-1"
                                    >
                                        <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-100" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-28 bg-gray-100" />
                                            <Skeleton className="h-3 w-40 bg-gray-100" />
                                        </div>
                                        <Skeleton className="h-7 w-16 sm:w-20 bg-gray-100 rounded-lg" />
                                    </div>
                                ))
                            ) : (
                                members.map((member) => (
                                    <div
                                        key={member.id || member.email}
                                        className="flex items-center gap-2.5 py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <Avatar
                                            className={`h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ${getAvatarColor(member.name)}`}
                                        >
                                            <AvatarFallback className="text-white font-semibold text-sm bg-transparent">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Name and username */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {member.name}
                                                {member.isCurrentUser && (
                                                    <span className="text-gray-400 font-normal ml-1">
                                                        ({t("you")})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                @{member.username || member.email.split('@')[0]}
                                                <span className="hidden sm:inline"> • {getRoleDescription(member)}</span>
                                            </p>
                                        </div>

                                        {/* Role badge */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-default flex-shrink-0 ${
                                                    member.role === "admin" 
                                                        ? "bg-gray-100 text-gray-500" 
                                                        : "bg-gray-50 text-gray-600 border border-gray-200"
                                                }`}>
                                                    {getRoleDisplay(member.role)}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                                <p>{t("alreadyAMember")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


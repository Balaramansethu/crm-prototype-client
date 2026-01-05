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
    const [role, setRole] = useState("employee")
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
            const membersList =
                response?.data?.members || response?.members || []
            setMembers(membersList)
        } catch (error) {
            console.error("Failed to fetch members:", error)
            setMembers([])
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

        // if (!validateDomain(email)) {
        //     setEmailError(t("invalidDomain"))
        //     return
        // }

        setEmailError("") // Clear any previous errors

        setIsInviting(true)
        try {
            // Check if user can be invited
            const statusResponse = await checkInviteStatus(email)
            const inviteData = statusResponse?.data || statusResponse

            if (!inviteData?.canInvite) {
                // User cannot be invited - show reason
                const reason = inviteData?.reason || t("alreadyAMember")
                setEmailError(reason)
                toast.error(reason)
                return
            }

            // Send invite
            await inviteMembers([{ email, role }])
            toast.success(t("inviteSent"))
            setEmail("")
            setRole("employee")
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

    const getMemberName = (member) => {
        if (member.firstName || member.lastName) {
            return `${member.firstName || ""} ${member.lastName || ""}`.trim()
        }
        return member.name || member.email?.split("@")[0] || "Unknown"
    }

    const getInitials = (member) => {
        const name = getMemberName(member)
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
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[550px] max-h-[90vh] bg-white border border-gray-200 text-gray-900 shadow-2xl rounded-xl sm:rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
                    <DialogTitle className="text-base sm:text-xl text-center font-semibold text-gray-900 tracking-tight">
                        {t("shareBoard")}
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Email input section */}
                    <div className="space-y-3">
                        {/* Desktop: horizontal layout */}
                        <div className="hidden md:flex items-center gap-3">
                            <Input
                                type="email"
                                placeholder={t("emailPlaceholderInvite")}
                                value={email}
                                onChange={handleEmailChange}
                                className={`flex-1 h-10 bg-white border text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 rounded-lg text-sm transition-all ${
                                    emailError
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
                                }`}
                            />
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="w-[140px] h-10 px-3 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium text-sm focus:ring-2 focus:ring-gray-100 focus:ring-offset-0">
                                    <SelectValue placeholder={t("employee")} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl">
                                    <SelectItem
                                        value="employee"
                                        className="text-gray-900 hover:bg-gray-50 cursor-pointer h-10"
                                    >
                                        {t("employee")}
                                    </SelectItem>
                                    <SelectItem
                                        value="admin"
                                        className="text-gray-900 hover:bg-gray-50 cursor-pointer h-10"
                                    >
                                        {t("admin")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting || !email.trim()}
                                className="h-10 bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-lg font-medium text-sm transition-all disabled:opacity-50 shadow-sm"
                            >
                                {isInviting ? t("loading") : t("share")}
                            </Button>
                        </div>

                        {/* Mobile & Tablet: stacked layout */}
                        <div className="flex md:hidden flex-col gap-3">
                            <Input
                                type="email"
                                placeholder={t("emailPlaceholderInvite")}
                                value={email}
                                onChange={handleEmailChange}
                                className={`w-full h-12 bg-white border text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 rounded-lg text-base px-4 ${
                                    emailError
                                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                        : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
                                }`}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger className="w-full h-12 px-4 bg-white border border-gray-200 text-gray-900 rounded-lg font-medium text-base">
                                        <SelectValue
                                            placeholder={t("employee")}
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-xl">
                                        <SelectItem
                                            value="employee"
                                            className="text-gray-900 hover:bg-gray-50 cursor-pointer h-12 text-base"
                                        >
                                            {t("employee")}
                                        </SelectItem>
                                        <SelectItem
                                            value="admin"
                                            className="text-gray-900 hover:bg-gray-50 cursor-pointer h-12 text-base"
                                        >
                                            {t("admin")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleInvite}
                                    disabled={isInviting || !email.trim()}
                                    className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-base transition-all disabled:opacity-50 shadow-sm"
                                >
                                    {isInviting ? t("loading") : t("share")}
                                </Button>
                            </div>
                        </div>

                        {/* Error message */}
                        {emailError && (
                            <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1.5">
                                <svg
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="break-words">
                                    {emailError}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Board members section */}
                    <div className="space-y-3">
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

                        <div className="space-y-1 max-h-[200px] sm:max-h-[250px] overflow-y-auto -mx-2 px-2 scrollbar-thin">
                            {isMembersLoading
                                ? // Skeleton loading state
                                  Array.from({ length: 3 }).map((_, index) => (
                                      <div
                                          key={index}
                                          className="flex items-center gap-3 py-2.5 px-2"
                                      >
                                          <Skeleton className="h-10 w-10 rounded-full bg-gray-100 flex-shrink-0" />
                                          <div className="flex-1 space-y-2 min-w-0">
                                              <Skeleton className="h-4 w-24 sm:w-32 bg-gray-100" />
                                              <Skeleton className="h-3 w-32 sm:w-44 bg-gray-100" />
                                          </div>
                                          <Skeleton className="h-8 w-16 sm:w-20 bg-gray-100 rounded-lg flex-shrink-0" />
                                      </div>
                                  ))
                                : members.map((member) => (
                                      <div
                                          key={member._id || member.email}
                                          className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                                      >
                                          {/* Avatar */}
                                          <Avatar
                                              className={`h-10 w-10 flex-shrink-0 ${getAvatarColor(getMemberName(member))}`}
                                          >
                                              <AvatarFallback className="text-white font-semibold text-sm bg-transparent">
                                                  {getInitials(member)}
                                              </AvatarFallback>
                                          </Avatar>

                                          {/* Name and email */}
                                          <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                  {getMemberName(member)}
                                              </p>
                                              <p className="text-xs text-gray-500 truncate">
                                                  {member.email}
                                                  <span className="hidden sm:inline">
                                                      {" "}
                                                      •{" "}
                                                      {getRoleDescription(
                                                          member,
                                                      )}
                                                  </span>
                                              </p>
                                          </div>

                                          {/* Role badge */}
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <div
                                                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium cursor-default flex-shrink-0 ${
                                                          member.role ===
                                                          "admin"
                                                              ? "bg-gray-100 text-gray-600"
                                                              : "bg-gray-50 text-gray-600 border border-gray-200"
                                                      }`}
                                                  >
                                                      {getRoleDisplay(
                                                          member.role,
                                                      )}
                                                  </div>
                                              </TooltipTrigger>
                                              <TooltipContent side="left">
                                                  <p>{t("alreadyAMember")}</p>
                                              </TooltipContent>
                                          </Tooltip>
                                      </div>
                                  ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

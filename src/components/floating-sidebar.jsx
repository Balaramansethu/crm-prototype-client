import * as React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import {
    IconArchive,
    IconChevronRight,
    IconDashboard,
    IconDatabase,
    IconFileWord,
    IconLayoutKanban,
    IconListDetails,
    IconPhone,
    IconReport,
} from "@tabler/icons-react"

import LanguageToggle from "@/components/LanguageToggle"
import { useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { NavUser } from "@/components/nav-user"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Create context for sidebar state
const FloatingSidebarContext = createContext(null)

export function useFloatingSidebar() {
    const context = useContext(FloatingSidebarContext)
    if (!context) {
        throw new Error("useFloatingSidebar must be used within FloatingSidebarProvider")
    }
    return context
}

export function FloatingSidebarProvider({ children }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const collapse = useCallback(() => {
        setIsExpanded(false)
    }, [])

    const expand = useCallback(() => {
        setIsExpanded(true)
    }, [])

    const toggle = useCallback(() => {
        setIsExpanded((prev) => !prev)
    }, [])

    // Close sidebar on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isExpanded) {
                collapse()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isExpanded, collapse])

    return (
        <FloatingSidebarContext.Provider value={{ isExpanded, collapse, expand, toggle }}>
            <TooltipProvider delayDuration={0}>
                {children}
            </TooltipProvider>
        </FloatingSidebarContext.Provider>
    )
}

export function FloatingSidebar() {
    const { isExpanded, toggle, collapse } = useFloatingSidebar()
    const user = useUserStore((s) => s.user)
    const navigate = useNavigate()
    const location = useLocation()
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    // Navigation items with icons
    const navItems = [
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
        navItems.push({
            icon: IconArchive,
            label: t("archivedData"),
            path: "/archived",
            isActive: location.pathname.startsWith("/archived"),
        })
    }

    // Secondary nav items (disabled/coming soon)
    const secondaryItems = [
        { icon: IconDashboard, label: t("overview"), disabled: true },
        { icon: IconDatabase, label: t("dataLibrary"), disabled: true },
        { icon: IconReport, label: t("reports"), disabled: true },
        { icon: IconFileWord, label: t("wordAssistant"), disabled: true },
    ]

    const handleNavClick = (path) => {
        navigate(path)
        collapse() // Auto-collapse on navigation
    }

    return (
        <>
            {/* Backdrop when expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
                    onClick={collapse}
                />
            )}

            {/* Floating Sidebar Container - Detached from screen edge */}
            {/* Note: dir="ltr" prevents the parent RTL from reversing flex-row */}
            <div
                dir="ltr"
                className={cn(
                    "fixed z-50 flex flex-row transition-all duration-300 ease-in-out",
                    isRTL ? "right-3" : "left-3"
                )}
                style={{
                    top: "12px",
                    height: "calc(100vh - 24px)",
                }}
            >
                {/* Toggle Button - Rendered BEFORE sidebar in RTL (appears on left) */}
                {isRTL && (
                    <ToggleButton 
                        onClick={toggle} 
                        isExpanded={isExpanded} 
                        isRTL={isRTL} 
                    />
                )}

                {/* Sidebar Panel - Floating Card */}
                <div
                    className={cn(
                        "h-full bg-white shadow-xl flex flex-col transition-all duration-300 overflow-hidden rounded-2xl border border-gray-200",
                        isExpanded ? "w-64" : "w-16"
                    )}
                    style={{
                        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                    }}
                >
                    {/* Header with Logo */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 border-b border-gray-100",
                        isExpanded ? (isRTL ? "justify-end flex-row-reverse" : "justify-start") : "justify-center"
                    )}>
                        <img
                            src="https://bunny-wp-pullzone-dgpgtislbk.b-cdn.net/wp-content/uploads/2023/12/Datasack_tech_logo4_240X240_72dpi.png"
                            alt="Datasack Logo"
                            className="w-8 h-8 rounded object-contain flex-shrink-0"
                        />
                        {isExpanded && (
                            <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
                                {t("datasack")}
                            </span>
                        )}
                    </div>

                    {/* Language Toggle - Only when expanded */}
                    {isExpanded && (
                        <div className="px-4 py-2 border-b border-gray-100">
                            <LanguageToggle />
                        </div>
                    )}

                    {/* Navigation Items */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        <ul className="space-y-1 px-2">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    {isExpanded ? (
                                        <button
                                            onClick={() => handleNavClick(item.path)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                                isRTL ? "text-right flex-row-reverse" : "text-left",
                                                item.isActive
                                                    ? "bg-primary text-white shadow-md"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleNavClick(item.path)}
                                                    className={cn(
                                                        "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                                                        item.isActive
                                                            ? "bg-primary text-white shadow-md"
                                                            : "text-gray-700 hover:bg-gray-100"
                                                    )}
                                                >
                                                    <item.icon className="w-5 h-5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side={isRTL ? "left" : "right"}>
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Separator */}
                        <div className="my-4 mx-2 border-t border-gray-100" />
                    </nav>

                    {/* Footer with User Info */}
                    <div className={cn(
                        "border-t border-gray-100 p-2",
                        !isExpanded && "flex justify-center"
                    )}>
                        {isExpanded ? (
                            <NavUser />
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="p-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center text-primary font-medium text-sm">
                                            {`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side={isRTL ? "left" : "right"}>
                                    {user?.firstName} {user?.lastName}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Toggle Button - Rendered AFTER sidebar in LTR (appears on right) */}
                {!isRTL && (
                    <ToggleButton 
                        onClick={toggle} 
                        isExpanded={isExpanded} 
                        isRTL={isRTL} 
                    />
                )}
            </div>
        </>
    )
}

// Separate Toggle Button component for cleaner code
function ToggleButton({ onClick, isExpanded, isRTL }) {
    return (
        <div
            className="flex items-center relative z-10"
            style={{ marginTop: "40px" }}
        >
            <button
                onClick={onClick}
                className={cn(
                    "flex items-center justify-center w-5 h-14 bg-white cursor-pointer transition-all duration-300 hover:bg-gray-50 border border-gray-200",
                    // RTL: toggle on left of sidebar, so round left edge, remove right border
                    // LTR: toggle on right of sidebar, so round right edge, remove left border
                    isRTL 
                        ? "rounded-l-xl border-r-0 -mr-px" 
                        : "rounded-r-xl border-l-0 -ml-px"
                )}
                style={{
                    boxShadow: isRTL 
                        ? "-2px 0 8px rgba(0,0,0,0.06)" 
                        : "2px 0 8px rgba(0,0,0,0.06)",
                }}
            >
                {/* Arrow direction:
                    LTR collapsed: > (pointing right, to expand toward content)
                    LTR expanded: < (pointing left, to collapse)
                    RTL collapsed: < (pointing left, to expand toward content)
                    RTL expanded: > (pointing right, to collapse)
                */}
                <IconChevronRight
                    className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-300",
                        // In RTL, arrow should point LEFT when collapsed, RIGHT when expanded
                        // In LTR, arrow should point RIGHT when collapsed, LEFT when expanded
                        isRTL 
                            ? (isExpanded ? "" : "rotate-180")
                            : (isExpanded ? "rotate-180" : "")
                    )}
                />
            </button>
        </div>
    )
}

// Wrapper for main content that handles auto-collapse
// Sidebar collapsed width: w-16 (64px) + gap from edge (12px) + toggle (20px) = ~96px
// Using pl-20 (80px) for a tighter fit
export function MainContent({ children, className }) {
    const { collapse, isExpanded } = useFloatingSidebar()
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"

    const handleInteraction = () => {
        if (isExpanded) {
            collapse()
        }
    }

    return (
        <main
            className={cn(
                "w-full min-h-screen transition-all duration-300",
                // Add padding on the side where sidebar is located
                isRTL ? "pr-20" : "pl-20",
                className
            )}
            onClick={handleInteraction}
        >
            {children}
        </main>
    )
}

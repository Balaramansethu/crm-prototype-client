import * as React from "react"
import {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
    useRef,
} from "react"
import {
    IconArchive,
    IconDashboard,
    IconDatabase,
    IconFileWord,
    IconLayoutKanban,
    IconListDetails,
    IconMenu2,
    IconPhone,
    IconReport,
} from "@tabler/icons-react"

import LanguageToggle from "@/components/LanguageToggle"
import { useNavigate, useLocation } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { NavUser } from "@/components/nav-user"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

// Sidebar widths
const SIDEBAR_COLLAPSED_WIDTH = 64 // px - width when collapsed (icons only)
const SIDEBAR_EXPANDED_WIDTH = 256 // px - width when expanded
const MOBILE_BREAKPOINT = 768 // px - mobile breakpoint

// Create context for sidebar state
const FloatingSidebarContext = createContext(null)

export function useFloatingSidebar() {
    const context = useContext(FloatingSidebarContext)
    if (!context) {
        throw new Error(
            "useFloatingSidebar must be used within FloatingSidebarProvider",
        )
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
        <FloatingSidebarContext.Provider
            value={{ isExpanded, collapse, expand, toggle }}
        >
            {children}
        </FloatingSidebarContext.Provider>
    )
}

export function FloatingSidebar() {
    const { isExpanded, expand, collapse } = useFloatingSidebar()
    const user = useUserStore((s) => s.user)
    const navigate = useNavigate()
    const location = useLocation()
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === "ar"
    const sidebarRef = useRef(null)
    const hoverTimeoutRef = useRef(null)
    const [isMobile, setIsMobile] = useState(false)

    // Track screen size for mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Handle mouse enter - expand sidebar
    const handleMouseEnter = useCallback(() => {
        // Clear any pending collapse timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
        }
        expand()
    }, [expand])

    // Handle mouse leave - collapse sidebar with small delay
    const handleMouseLeave = useCallback(() => {
        // Add a small delay before collapsing to prevent flickering
        hoverTimeoutRef.current = setTimeout(() => {
            collapse()
        }, 150)
    }, [collapse])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current)
            }
        }
    }, [])

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

    const handleNavClick = (path) => {
        navigate(path)
        // Automatically close sidebar after navigation
        collapse()
    }

    return (
        <>
            {/* Backdrop overlay for mobile when sidebar is expanded */}
            {isMobile && isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
                    onClick={collapse}
                />
            )}
            
            {/* Docked Sidebar - Fixed to left edge, expands on hover */}
            <div
                ref={sidebarRef}
                dir="ltr"
                onMouseEnter={!isMobile ? handleMouseEnter : undefined}
                onMouseLeave={!isMobile ? handleMouseLeave : undefined}
                className={cn(
                    "fixed z-50 h-screen bg-white border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shadow-lg",
                    // Position based on RTL - docked to edge (no gaps)
                    isRTL ? "right-0 border-l" : "left-0 border-r",
                    // Hide on mobile when collapsed, show when expanded
                    isMobile && !isExpanded && (isRTL ? "-right-16" : "-left-16"),
                )}
                style={{
                    width: isExpanded ? `${SIDEBAR_EXPANDED_WIDTH}px` : `${SIDEBAR_COLLAPSED_WIDTH}px`,
                }}
            >
                {/* Header with Logo or Burger Menu */}
                <div
                    className={cn(
                        "flex items-center gap-3 p-4 border-b border-gray-100 min-h-[64px]",
                        isExpanded
                            ? isRTL
                                ? "justify-end flex-row-reverse"
                                : "justify-start"
                            : "justify-center",
                    )}
                >
                    {/* Show burger icon on mobile collapsed, logo on desktop */}
                    {isMobile && !isExpanded ? (
                        <IconMenu2 className="w-6 h-6 text-gray-700 cursor-pointer" />
                    ) : (
                        <>
                            <img
                                src="https://bunny-wp-pullzone-dgpgtislbk.b-cdn.net/wp-content/uploads/2023/12/Datasack_tech_logo4_240X240_72dpi.png"
                                alt="Datasack Logo"
                                className="-mt-2 ml-2 w-9 h-9 rounded object-contain flex-shrink-0"
                            />
                            <span 
                                className={cn(
                                    "text-base -mt-1 font-semibold text-gray-900 whitespace-nowrap transition-opacity duration-200",
                                    isExpanded ? "opacity-100" : "opacity-0 w-0"
                                )}
                            >
                                {t("datasack")}
                            </span>
                        </>
                    )}
                </div>

                {/* Language Toggle - Compact when collapsed, full when expanded */}
                <div 
                    className={cn(
                        "border-b border-gray-100 transition-all duration-200",
                        isExpanded ? "px-4 py-2" : "px-2 py-2 flex justify-center"
                    )}
                >
                    {isExpanded ? (
                        <LanguageToggle />
                    ) : (
                        <button
                            onClick={() => {
                                const newLang = i18n.language === "ar" ? "en" : "ar"
                                i18n.changeLanguage(newLang)
                                localStorage.setItem("lang", newLang)
                                document.documentElement.lang = newLang
                            }}
                            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 transition-colors"
                        >
                            {i18n.language === "ar" ? "ع" : "EN"}
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                {isExpanded ? (
                                    <button
                                        onClick={() => handleNavClick(item.path)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                            isRTL
                                                ? "text-right flex-row-reverse"
                                                : "text-left",
                                            item.isActive
                                                ? "bg-primary text-white shadow-md"
                                                : "text-gray-700 hover:bg-gray-100",
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavClick(item.path)}
                                        className={cn(
                                            "w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                                            item.isActive
                                                ? "bg-primary text-white shadow-md"
                                                : "text-gray-700 hover:bg-gray-100",
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Separator */}
                    <div className="my-4 mx-2 border-t border-gray-100" />
                </nav>

                {/* Footer with User Info */}
                <div
                    className={cn(
                        "border-t border-gray-100 p-2",
                        !isExpanded && "flex justify-center",
                    )}
                >
                    {isExpanded ? (
                        <NavUser />
                    ) : (
                        <div className="p-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center text-primary font-medium text-sm">
                                {`${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

// Wrapper for main content - provides margin to account for sidebar
export function MainContent({ children, className }) {
    const { i18n } = useTranslation()
    const isRTL = i18n.language === "ar"
    const [isMobile, setIsMobile] = useState(false)

    // Track screen size for mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return (
        <main
            className={cn(
                "min-h-screen transition-all duration-300",
                className,
            )}
            style={{
                marginLeft: isMobile ? 0 : (isRTL ? 0 : SIDEBAR_COLLAPSED_WIDTH),
                marginRight: isMobile ? 0 : (isRTL ? SIDEBAR_COLLAPSED_WIDTH : 0),
                width: isMobile ? "100%" : `calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px)`,
            }}
        >
            {children}
        </main>
    )
}

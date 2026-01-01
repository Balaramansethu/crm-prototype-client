import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { useTranslation } from "react-i18next"
import { useUserStore } from "@/store/userStore"
import { CommonDialog } from "@/components/common"
import AppRoutes from "@/routes/AppRoutes"
import i18n from "@/i18n.js"

const queryClient = new QueryClient()

export default function App() {
    useEffect(() => {
        const applyDir = (lang) => {
            document.documentElement.setAttribute(
                "dir",
                lang === "ar" ? "rtl" : "ltr",
            )
            document.documentElement.setAttribute("lang", lang)
            document.body.className = lang === "ar" ? "rtl" : "ltr"
        }

        const savedLang = localStorage.getItem("lang") || "en"
        i18n.changeLanguage(savedLang)
        applyDir(savedLang)

        i18n.on("languageChanged", applyDir)

        return () => i18n.off("languageChanged", applyDir)
    }, [])

    const currentLang = i18n.language || "en"

    return (
        <QueryClientProvider client={queryClient}>
            <AppRoutes />
            <ExpirationModal />

            <Toaster
                position={currentLang === "ar" ? "top-left" : "top-right"}
                richColors
                closeButton
            />
        </QueryClientProvider>
    )
}

function ExpirationModal() {
    const { t } = useTranslation()
    const isSessionExpired = useUserStore((state) => state.isSessionExpired)
    const clearUser = useUserStore((state) => state.clearUser)

    const handleConfirm = () => {
        clearUser()
        window.location.href = "/login"
    }

    if (!isSessionExpired) return null

    return (
        <CommonDialog
            open={isSessionExpired}
            onOpenChange={() => {}}
            title={t("sessionExpired")}
            description={t("sessionExpiredDescription")}
            confirmText={t("okay")}
            onConfirm={handleConfirm}
            variant="destructive"
            hideCancel={true}
            showIcon={false}
            hideCloseButton={true}
        />
    )
}

import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
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
            <Toaster
                position={currentLang === "ar" ? "top-left" : "top-right"}
                richColors
                closeButton
            />
        </QueryClientProvider>
    )
}

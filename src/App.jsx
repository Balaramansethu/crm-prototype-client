import { useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import AppRoutes from "@/routes/AppRoutes"
import i18n from "@/i18n.js"

const queryClient = new QueryClient()

export default function App() {
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en"

    i18n.changeLanguage(savedLang)

    document.documentElement.lang = savedLang
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

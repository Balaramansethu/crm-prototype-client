import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import NotFoundImage from "@/assets/404.png"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/userStore"

export default function NotFoundPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const user = useUserStore((s) => s.user)

    const goToCorrectDashboard = () => {
        if (!user) return navigate("/login")

        if (user.role === "super_admin") navigate("/dashboard/super-admin")
        else if (user.role === "admin") navigate("/dashboard/admin")
        else navigate("/dashboard")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center relative overflow-hidden">
            <div className="relative w-full max-w-lg mb-8 flex items-center justify-center">
                {/* Large 404 Background Text */}
                <span className="absolute text-[12rem] md:text-[18rem] font-bold text-gray-100 select-none -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    404
                </span>
                
                <img 
                    src={NotFoundImage} 
                    alt="404 Not Found" 
                    className="w-full h-auto object-contain relative z-10"
                />
            </div>
            <h1 className="text-4xl font-bold mb-4 z-10">{t("pageNotFound")}</h1>
             <p className="text-muted-foreground mb-8 max-w-md text-lg z-10">
                {t("pageNotFoundDesc")}
            </p>
            <Button onClick={goToCorrectDashboard} size="lg" className="z-10">
                {t("goHome")}
            </Button>
        </div>
    )
}

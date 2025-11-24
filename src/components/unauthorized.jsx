import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"

export default function Unauthorized() {
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)

    const goToCorrectDashboard = () => {
        if (!user) return navigate("/login")

        if (user.role === "super_admin") navigate("/dashboard/super-admin")
        else if (user.role === "admin") navigate("/dashboard/admin")
        else navigate("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />

            <h1 className="text-3xl font-bold">Unauthorized Access</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
                You do not have permission to view this page.  
                If you believe this is an error, contact your administrator.
            </p>

            <div className="mt-6 flex gap-3">
                <Button onClick={goToCorrectDashboard}>
                    Go to Dashboard
                </Button>
            </div>
        </div>
    )
}

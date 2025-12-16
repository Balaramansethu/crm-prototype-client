import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useLogin } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { DatasackLoader } from "@/components/datasack-loader"

export default function LoginPage() {
    const login = useLogin()
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)

    const handleRedirect = () => {
        if (!user) return
        
        if (user.role === "super_admin") {
            navigate("/dashboard/super-admin", { replace: true })
        } else if (user.role === "admin") {
            navigate("/dashboard/admin", { replace: true })
        } else {
            navigate("/dashboard", { replace: true })
        }
    }

    if (user) {
        return <DatasackLoader onComplete={handleRedirect} />
    }

    const handleLogin = (data) => {
        login.mutate(data, {
            onSuccess: (response) => {
                const role = response?.user?.role || response?.role

                if (role === "super_admin") {
                    navigate("/dashboard/super-admin")
                } else if (role === "admin") {
                    navigate("/dashboard/admin")
                } else {
                    navigate("/dashboard")
                }
            },
        })
    }

    return <LoginForm onSubmit={handleLogin} loading={login.isPending} />
}

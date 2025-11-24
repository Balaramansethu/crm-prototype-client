import { LoginForm } from "@/components/login-form"
import { useLogin } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const login = useLogin()
    const navigate = useNavigate()

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
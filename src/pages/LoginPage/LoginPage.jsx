import { LoginForm } from "@/components/login-form"
import { useLogin } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    const login = useLogin()
    const navigate = useNavigate()

    const handleLogin = (data) => {
        login.mutate(data, {
            onSuccess: () => {
                navigate("/dashboard")
            },
        })
    }

    return <LoginForm onSubmit={handleLogin} loading={login.isPending} />
}

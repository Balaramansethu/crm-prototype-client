import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useLogin } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { DatasackLoader } from "@/components/datasack-loader"

export default function LoginPage() {
    const login = useLogin()
    const navigate = useNavigate()
    const user = useUserStore((s) => s.user)
    const [backendErrors, setBackendErrors] = useState({})

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
        setBackendErrors({}) // Clear previous errors
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
            onError: (error) => {
                const errorData = error?.response?.data
                const errorCode = errorData?.error || errorData?.errorCode

                // Map backend error codes to form fields
                if (errorCode === "invalid_password" || errorCode === "2008") {
                    setBackendErrors({
                        password: errorData?.message || "Invalid Credentials",
                    })
                } else if (
                    errorCode === "user_not_found" ||
                    errorCode === "2007"
                ) {
                    setBackendErrors({
                        email: errorData?.message || "User not found",
                    })
                } else if (errorData?.message) {
                    // Generic error - show under password field
                    setBackendErrors({ password: errorData.message })
                }
            },
        })
    }

    const clearBackendErrors = () => {
        setBackendErrors({})
    }

    return (
        <LoginForm
            onSubmit={handleLogin}
            loading={login.isPending}
            backendErrors={backendErrors}
            clearBackendErrors={clearBackendErrors}
        />
    )
}

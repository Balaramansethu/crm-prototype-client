
import { useEffect } from "react"
import { useSignup } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { SignupForm } from "@/components/signup-form"
import { DatasackLoader } from "@/components/datasack-loader"

export default function SignupPage() {
    const signupMutation = useSignup()
    const navigate = useNavigate()
    const setUser = useUserStore((s) => s.setUser)
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

    const handleSignup = (form) => {
        signupMutation.mutate(form, {
            onSuccess: (data) => {
                setUser({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: data.email,
                    role: "employee",
                    userId: data.userId,
                })

                navigate("/dashboard")
            },
        })
    }

    return (
        <SignupForm
            onSubmit={handleSignup}
            loading={signupMutation.isPending}
        />
    )
}

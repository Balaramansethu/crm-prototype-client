import { useSignup } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
    const signupMutation = useSignup()
    const navigate = useNavigate()
    const setUser = useUserStore((s) => s.setUser)

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

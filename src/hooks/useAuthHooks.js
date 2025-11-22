import { useMutation } from "@tanstack/react-query"
import {
    loginService,
    signupService,
    logoutService,
} from "@/service/authService"
import { useUserStore } from "@/store/userStore"

export function useSignup() {
    const setUser = useUserStore((s) => s.setUser)

    return useMutation({
        mutationFn: signupService,
        onSuccess: (user) => {
            setUser(user)
        },
    })
}

export function useLogin() {
    const setUser = useUserStore((s) => s.setUser)

    return useMutation({
        mutationFn: loginService,
        onSuccess: (user) => {
            setUser(user)
        },
    })
}

export function useLogout() {
    const clearUser = useUserStore((s) => s.clearUser)

    return useMutation({
        mutationFn: logoutService,
        onSuccess: () => {
            clearUser()
        },
    })
}

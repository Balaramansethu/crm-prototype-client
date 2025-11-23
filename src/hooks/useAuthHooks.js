import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
    loginService,
    signupService,
    logoutService,
} from "@/service/authService"
import { useUserStore } from "@/store/userStore"
import { ErrorHandler } from "@/utils/axios/errorHandler"
import {
    AUTH_ERROR_CODES,
    ERROR_CODES,
    ERROR_MESSAGES,
    FIELD_ERROR_CODES,
} from "@/constants/errorConstants.js"

export function useSignup() {
    const navigate = useNavigate()
    const setUser = useUserStore((s) => s.setUser)

    return useMutation({
        mutationFn: signupService,
        onSuccess: (user) => {
            setUser(user)
            toast.success("Account created successfully!", {
                description: "Welcome aboard!",
                duration: 2000,
            })
        },
        onError: (error) => {
            ErrorHandler.handleError(error, navigate, {
                showToast: true,
            })
        },
    })
}

export function useLogin() {
    const navigate = useNavigate()
    const setUser = useUserStore((s) => s.setUser)

    return useMutation({
        mutationFn: loginService,
        onSuccess: (user) => {
            setUser(user)
            toast.success("Welcome back!", {
                description: "Login successful",
                duration: 2000,
            })
        },
        onError: (error) => {
            ErrorHandler.handleError(error, navigate, {
                showToast: true,
            })
        },
    })
}

export function useLogout() {
    const navigate = useNavigate()
    const clearUser = useUserStore((s) => s.clearUser)

    return useMutation({
        mutationFn: logoutService,
        onSuccess: () => {
            clearUser()
            toast.success("Logged out successfully")
            navigate("/login", { replace: true })
        },
        onError: (error) => {
            // Even if logout fails, clear user and redirect
            clearUser()
            ErrorHandler.handleError(error, navigate, {
                showToast: false, // Don't show error toast on logout failure
            })
            navigate("/login", { replace: true })
        },
    })
}

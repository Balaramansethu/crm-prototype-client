import { axiosPublicInstance } from "@/utils/axios/axiosPublicInstance"

export async function signupService(data) {
    try {
        const response = await axiosPublicInstance.post("/auth/signup", data)
        const user = response.data.data || response.data.error
        return user
    } catch (error) {
        throw error
    }
}

export async function loginService(data) {
    try {
        const response = await axiosPublicInstance.post("/auth/login", data)
        const user = response.data.data || response.data.error
        if (!user) throw new Error("Invalid user response")
        return user
    } catch (error) {
        throw error
    }
}

export async function logoutService() {
    try {
        await axiosPublicInstance.post("/auth/logout")
        return true
    } catch (error) {
        throw error
    }
}

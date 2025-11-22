import { axiosPublicInstance } from "@/utils/axios/axiosPublicInstance"

export async function signupService(data) {
    try {
        const res = await axiosPublicInstance.post("/auth/signup", data)
        const user = res.data.data || res.data.error
        return user
    } catch (err) {
        throw err
    }
}

export async function loginService(data) {
    try {
        const res = await axiosPublicInstance.post("/auth/login", data)
        const user = res.data.data || res.data.error
        if (!user) throw new Error("Invalid user response")
        return user
    } catch (err) {
        throw err
    }
}

export async function logoutService() {
    try {
        await axiosPublicInstance.post("/auth/logout")
        return true
    } catch (err) {
        throw err
    }
}

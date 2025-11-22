import axiosInstance from "@/utils/axiosInstance"

export async function signupService(data) {
    try {
        const res = await axiosInstance.post("/auth/signup", data)
        return res.data.data 
    } catch (err) {
        throw err.response?.data || { message: "Signup failed" }
    }
}

export async function loginService(data) {
    try {
        const res = await axiosInstance.post("/auth/login", data)
        return res.data.data
    } catch (err) {
        throw err.response?.data || { message: "Login failed" }
    }
}

export async function logoutService() {
    try {
        await axiosInstance.post("/auth/logout")
        return true
    } catch (err) {
        throw err.response?.data || { message: "Logout failed" }
    }
}

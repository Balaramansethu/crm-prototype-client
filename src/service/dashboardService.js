import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function fetchDashboard() {
    try {
        const response = await axiosPrivateInstance.get("/dashboard")
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchAdminDashboard() {
    try {
        const response = await axiosPrivateInstance.get("/dashboard/admin")
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchSuperAdminDashboard() {
    try {
        const response = await axiosPrivateInstance.get("/dashboard/super-admin")
        return response.data
    } catch (error) {
        throw error
    }
}

import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function fetchDashboard() {
    try {
        const res = await axiosPrivateInstance.get("/dashboard")
        return res.data
    } catch (err) {
        throw err
    }
}

export async function fetchAdminDashboard() {
    try {
        const res = await axiosPrivateInstance.get("/dashboard/admin")
        return res.data
    } catch (err) {
        throw err
    }
}

export async function fetchSuperAdminDashboard() {
    try {
        const res = await axiosPrivateInstance.get("/dashboard/super-admin")
        return res.data
    } catch (err) {
        throw err
    }
}

import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function fetchArchivedLeads(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/leads", { params })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchArchivedCallLogs(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/call-logs", { params })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchArchivedPipelines(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/pipelines", { params })
        return response.data
    } catch (error) {
        throw error
    }
}

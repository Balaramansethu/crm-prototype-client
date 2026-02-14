import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function fetchArchivedLeads(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/leads", {
            params,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchDroppedArchivedLeads(params = {}) {
    try {
        const response = await axiosPrivateInstance.get(
            "/archive/dropped-leads",
            {
                params,
            },
        )
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchArchivedCallLogs(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/call-logs", {
            params,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchArchivedPipelines(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/archive/pipelines", {
            params,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function restoreLead(id) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/leads/${id}/restore`,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

export async function restoreCallLog(id) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/call-logs/${id}/restore`,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

export async function restorePipeline(id) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/pipeline/${id}/restore`,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

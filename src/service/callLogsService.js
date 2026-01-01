import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function fetchCallLogs(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/call-logs", {
            params,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function createCallLog(data) {
    try {
        const response = await axiosPrivateInstance.post("/call-logs", data)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function getCallLogById(id) {
    try {
        const response = await axiosPrivateInstance.get(`/call-logs/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function updateCallLog(id, data) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/call-logs/${id}`,
            data,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

export async function deleteCallLog(id) {
    try {
        const response = await axiosPrivateInstance.delete(`/call-logs/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

// Search companies for call log form
export async function searchCompanies(params = {}) {
    try {
        const response = await axiosPrivateInstance.get(
            "/call-logs/search/company",
            {
                params,
            },
        )
        return response.data
    } catch (error) {
        throw error
    }
}

// Search leads by company ID for call log form
export async function searchLeadsByCompany(companyId, params = {}) {
    try {
        const response = await axiosPrivateInstance.get(
            "/call-logs/search/leads",
            {
                params: { companyId, ...params },
            },
        )
        return response.data
    } catch (error) {
        throw error
    }
}

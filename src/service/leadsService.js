import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function createLead(leadData) {
    try {
        const response = await axiosPrivateInstance.post("/leads", leadData)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchLeads(params = {}) {
    try {
        const response = await axiosPrivateInstance.get("/leads", { params })
        return response.data
    } catch (error) {
        throw error
    }
}

export async function getLeadById(id) {
    try {
        const response = await axiosPrivateInstance.get(`/leads/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function updateLead(id, data) {
    try {
        const response = await axiosPrivateInstance.patch(`/leads/${id}`, data)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function deleteLead(id) {
    try {
        const response = await axiosPrivateInstance.delete(`/leads/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

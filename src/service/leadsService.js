import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

export async function createLead(leadData) {
    try {
        const response = await axiosPrivateInstance.post("/leads", leadData)
        return response.data
    } catch (error) {
        throw error
    }
}

export async function fetchLeads() {
    try {
        const response = await axiosPrivateInstance.get("/leads")
        return response.data
    } catch (error) {
        throw error
    }
}

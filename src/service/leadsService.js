import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

/**
 * Create a new lead
 * @param {Object} leadData - The lead data payload
 * @returns {Promise<Object>} The created lead response
 */
export async function createLead(leadData) {
    try {
        const response = await axiosPrivateInstance.post("/leads", leadData)
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Fetch all leads (placeholder for future use)
 * @returns {Promise<Object>} The leads response
 */
export async function fetchLeads() {
    try {
        const response = await axiosPrivateInstance.get("/leads")
        return response.data
    } catch (error) {
        throw error
    }
}

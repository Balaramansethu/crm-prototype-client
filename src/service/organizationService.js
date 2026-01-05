import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

/**
 * Check if an email has already been invited to the organization
 * @param {string} email - Email address to check
 * @returns {Promise} - Response with invite status
 */
export async function checkInviteStatus(email) {
    try {
        const response = await axiosPrivateInstance.get(
            "/organization/invite/status",
            { params: { email } }
        )
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Invite members to the organization
 * @param {Array} members - Array of { email, role } objects
 * @returns {Promise} - Response with invite result
 */
export async function inviteMembers(members) {
    try {
        const response = await axiosPrivateInstance.post(
            "/organization/invite",
            { members }
        )
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Get all members of the organization (including invited)
 * @returns {Promise} - Response with members list
 */
export async function getOrganizationMembers() {
    try {
        const response = await axiosPrivateInstance.get("/organization/members")
        return response.data
    } catch (error) {
        throw error
    }
}

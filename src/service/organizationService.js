import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"
import { axiosPublicInstance } from "@/utils/axios/axiosPublicInstance"

/**
 * Check if an email can be invited to the organization
 * @param {string} email - Email address to check
 * @returns {Promise} - Response with { canInvite, reason, status, user }
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

/**
 * Validate invite token from magic link
 * @param {string} token - JWT token from invite link
 * @returns {Promise} - Response with { email, tenantId, role, method }
 */
export async function validateInviteToken(token) {
    try {
        const response = await axiosPublicInstance.get(
            "/organization/invite/validate",
            { params: { token } }
        )
        return response.data
    } catch (error) {
        throw error
    }
}

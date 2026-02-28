import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

/**
 * Fetch paginated/filtered list of prospectuses (grouped by company).
 */
export async function fetchProspectuses(params = {}) {
    try {
        // Strip empty/falsy values – the Prospectus API validates all
        // params strictly, so sending status="" triggers a validation error.
        const queryParams = {}
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return
            if (Array.isArray(value) && value.length === 0) return
            queryParams[key] = value
        })

        const response = await axiosPrivateInstance.get("/prospectus", {
            params: queryParams,
        })
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Fetch a single prospectus by ID.
 */
export async function getProspectusById(id) {
    try {
        const response = await axiosPrivateInstance.get(`/prospectus/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Create a new prospectus (company + optional contacts).
 */
export async function createProspectus(data) {
    try {
        const response = await axiosPrivateInstance.post("/prospectus", data)
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Bulk create prospectuses.
 */
export async function bulkCreateProspectuses(data) {
    try {
        const response = await axiosPrivateInstance.post(
            "/prospectus/bulk",
            data,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Update a prospectus by ID (partial update).
 */
export async function updateProspectus(id, data) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/prospectus/${id}`,
            data,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Delete (soft-delete) a prospectus by ID.
 */
export async function deleteProspectus(id) {
    try {
        const response = await axiosPrivateInstance.delete(`/prospectus/${id}`)
        return response.data
    } catch (error) {
        throw error
    }
}

/**
 * Restore a soft-deleted prospectus.
 */
export async function restoreProspectus(id) {
    try {
        const response = await axiosPrivateInstance.patch(
            `/prospectus/${id}/restore`,
        )
        return response.data
    } catch (error) {
        throw error
    }
}

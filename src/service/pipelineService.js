import { axiosPrivateInstance } from "@/utils/axios/axiosPrivateInstance"

const API_BASE = "/pipeline"

export const getAllPipelines = async (params = {}) => {
    const response = await axiosPrivateInstance.get(API_BASE, { params })
    return response.data
}

export const getPipelineById = async (id) => {
    const response = await axiosPrivateInstance.get(`${API_BASE}/${id}`)
    return response.data
}

export const createPipeline = async (data) => {
    const response = await axiosPrivateInstance.post(API_BASE, data)
    return response.data
}

export const updatePipeline = async (id, data) => {
    const response = await axiosPrivateInstance.patch(`${API_BASE}/${id}`, data)
    return response.data
}

export const updatePipelineStage = async (id, opportunityStage) => {
    const response = await axiosPrivateInstance.patch(`${API_BASE}/${id}`, {
        opportunityStage,
    })
    return response.data
}

export const deletePipeline = async (id) => {
    const response = await axiosPrivateInstance.delete(`${API_BASE}/${id}`)
    return response.data
}

/**
 * Search companies for pipeline/opportunity forms
 * Uses the dedicated pipeline company search endpoint
 */
export const searchPipelineCompanies = async (params = {}) => {
    const response = await axiosPrivateInstance.get(
        `${API_BASE}/search/company`,
        { params },
    )
    return response.data
}

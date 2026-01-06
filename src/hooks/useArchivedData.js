import { useQuery } from "@tanstack/react-query"
import {
    fetchArchivedLeads,
    fetchArchivedCallLogs,
    fetchArchivedPipelines,
} from "@/service/archiveService"

export const useArchivedLeads = (params = {}) => {
    return useQuery({
        queryKey: ["archivedLeads", params],
        queryFn: async () => {
            const response = await fetchArchivedLeads(params)
            return response.data
        },
        keepPreviousData: true,
    })
}

export const useArchivedCallLogs = (params = {}) => {
    return useQuery({
        queryKey: ["archivedCallLogs", params],
        queryFn: async () => {
            const response = await fetchArchivedCallLogs(params)
            return response.data
        },
        keepPreviousData: true,
    })
}

export const useArchivedPipelines = (params = {}) => {
    return useQuery({
        queryKey: ["archivedPipelines", params],
        queryFn: async () => {
            const response = await fetchArchivedPipelines(params)
            return response.data
        },
        keepPreviousData: true,
    })
}

import { useQuery } from "@tanstack/react-query"
import {
    fetchArchivedLeads,
    fetchDroppedArchivedLeads,
    fetchArchivedCallLogs,
    fetchArchivedPipelines,
    fetchArchivedProspectuses,
} from "@/service/archiveService"

export const useArchivedLeads = (params = {}) => {
    return useQuery({
        queryKey: ["archivedLeads", params],
        queryFn: async () => {
            const response = await fetchArchivedLeads(params)
            /* The mock data shows fetch returns response.data, 
               and inside fetch function it is response.data.
               However, usually useQuery needs to return the actual data 
               structure used by component (usually 'response.data').
               If 'fetchArchivedLeads' returns {success:true, data:{...}},
               then queryFn here should return fetchArchivedLeads(params) directly if it's already unwrapped?
               Let's look at `archiveService.js` diff:
               `return response.data`
               So fetchArchivedLeads returns `response.data`.
               In `useArchivedLeads` (original):
               `const response = await fetchArchivedLeads(params)`
               `return response.data`? 
               Wait, fetchArchivedLeads already returns response.data (the body).
               If the body has a `data` property inside it (standard wrapper), then `response.data` extracts it.
               If so, `useDroppedArchivedLeads` should do the same.
               Yes, maintain pattern.
            */
            return response.data
        },
        keepPreviousData: true,
    })
}

export const useDroppedArchivedLeads = (params = {}) => {
    return useQuery({
        queryKey: ["droppedArchivedLeads", params],
        queryFn: async () => {
            const response = await fetchDroppedArchivedLeads(params)
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

export const useArchivedProspectuses = (params = {}) => {
    return useQuery({
        queryKey: ["archivedProspectuses", params],
        queryFn: async () => {
            const response = await fetchArchivedProspectuses(params)
            return response.data
        },
        keepPreviousData: true,
    })
}

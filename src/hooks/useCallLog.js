import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getCallLogById,
    createCallLog,
    updateCallLog,
    deleteCallLog,
} from "@/service/callLogsService"

/**
 * Fetch a single call log by ID
 */
export const useCallLog = (id) => {
    return useQuery({
        queryKey: ["call-log", id],
        queryFn: async () => {
            const response = await getCallLogById(id)
            return response.data
        },
        enabled: !!id,
    })
}

/**
 * Mutation hook for creating a call log
 */
export const useCreateCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createCallLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["call-logs"] })
        },
    })
}

/**
 * Mutation hook for updating a call log
 */
export const useUpdateCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => updateCallLog(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["call-logs"] })
            queryClient.invalidateQueries({ queryKey: ["call-log", variables.id] })
        },
    })
}

/**
 * Mutation hook for deleting a call log
 */
export const useDeleteCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteCallLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["call-logs"] })
        },
    })
}

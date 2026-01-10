import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    restoreLead,
    restoreCallLog,
    restorePipeline,
} from "@/service/archiveService"

/**
 * Hook for restoring archived leads
 */
export const useRestoreLead = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: restoreLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["archivedLeads"] })
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
    })
}

/**
 * Hook for restoring archived call logs
 */
export const useRestoreCallLog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: restoreCallLog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["archivedCallLogs"] })
            queryClient.invalidateQueries({ queryKey: ["call-logs"] })
        },
    })
}

/**
 * Hook for restoring archived pipelines
 */
export const useRestorePipeline = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: restorePipeline,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["archivedPipelines"] })
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        },
    })
}

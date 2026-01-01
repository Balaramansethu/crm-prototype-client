import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getAllPipelines,
    getPipelineById,
    createPipeline,
    updatePipeline,
    updatePipelineStage,
    deletePipeline,
} from "@/service/pipelineService"

export const usePipelines = (params = {}) => {
    return useQuery({
        queryKey: ["pipelines"],
        queryFn: () => getAllPipelines(params),
        staleTime: 30000,
        retry: false,
        placeholderData: { pipelines: [], data: [] },
    })
}

export const usePipeline = (id) => {
    return useQuery({
        queryKey: ["pipeline", id],
        queryFn: () => getPipelineById(id),
        enabled: !!id,
    })
}

export const useCreatePipeline = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createPipeline,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        },
    })
}

export const useUpdatePipeline = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => updatePipeline(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        },
    })
}

export const useUpdatePipelineStage = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, opportunityStage }) =>
            updatePipelineStage(id, opportunityStage),
        onMutate: async ({ id, opportunityStage }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["pipelines"] })

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(["pipelines"])

            // Optimistically update the cache immediately
            queryClient.setQueryData(["pipelines"], (old) => {
                if (!old) return old

                // Handle nested response structure: { data: { pipelines: [...] } }
                const pipelinesArray = old.data?.pipelines || old.pipelines || old.data || []
                const updatedPipelines = Array.isArray(pipelinesArray) 
                    ? pipelinesArray.map((p) => p._id === id ? { ...p, opportunityStage } : p)
                    : []

                // Return in the same structure
                if (old.data?.pipelines) {
                    return { ...old, data: { ...old.data, pipelines: updatedPipelines } }
                }
                if (old.pipelines) {
                    return { ...old, pipelines: updatedPipelines }
                }
                if (old.data) {
                    return { ...old, data: updatedPipelines }
                }
                return updatedPipelines
            })

            // Return context with previous data for rollback
            return { previousData }
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(["pipelines"], context.previousData)
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server state
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        },
    })
}

export const useDeletePipeline = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deletePipeline,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pipelines"] })
        },
    })
}

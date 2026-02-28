import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getProspectusById,
    createProspectus,
    updateProspectus,
    deleteProspectus,
    restoreProspectus,
} from "@/service/prospectusService"

/**
 * Fetch a single prospectus by ID.
 */
export const useProspectus = (id) => {
    return useQuery({
        queryKey: ["prospectus", id],
        queryFn: async () => {
            const response = await getProspectusById(id)
            return response.data
        },
        enabled: !!id,
    })
}

/**
 * Mutation hook for creating a prospectus.
 */
export const useCreateProspectus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProspectus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prospectuses"] })
        },
    })
}

/**
 * Mutation hook for updating a prospectus.
 */
export const useUpdateProspectus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }) => updateProspectus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["prospectuses"] })
            queryClient.invalidateQueries({
                queryKey: ["prospectus", variables.id],
            })
        },
    })
}

/**
 * Mutation hook for deleting (archiving) a prospectus.
 */
export const useDeleteProspectus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProspectus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prospectuses"] })
        },
    })
}

/**
 * Mutation hook for restoring an archived prospectus.
 */
export const useRestoreProspectus = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: restoreProspectus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["prospectuses"] })
        },
    })
}

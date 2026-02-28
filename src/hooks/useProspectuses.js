import { useQuery } from "@tanstack/react-query"
import { fetchProspectuses } from "@/service/prospectusService"

/**
 * Fetch paginated list of prospectuses (grouped by company) with filters.
 */
export const useProspectuses = (params = {}) => {
    return useQuery({
        queryKey: ["prospectuses", params],
        queryFn: async () => {
            const response = await fetchProspectuses(params)
            const responseData = response.data || response

            const prospectuses = responseData.prospectuses || []
            const info = responseData.info || {}

            return {
                prospectuses,
                info: {
                    page: info.page || params.page || 1,
                    limit: info.limit || params.limit || 10,
                    total: info.total || 0,
                    totalPages: info.totalPages || 1,
                    hasMoreRecords: info.hasMoreRecords || false,
                },
            }
        },
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    })
}

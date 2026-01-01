import { useQuery } from "@tanstack/react-query"
import { fetchCallLogs } from "@/service/callLogsService"

/**
 * Fetch paginated call logs with filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (1-indexed)
 * @param {number} params.limit - Items per page
 * @param {string} params.lead - Filter by lead ID
 * @param {string} params.outcome - Filter by outcome
 * @param {string} params.followUp - Filter by follow-up date
 * @param {string} params.sort - Sort field
 * @param {string} params.order - Sort order (asc/desc)
 */
export const useCallLogs = (params = {}) => {
    return useQuery({
        queryKey: ["call-logs", params],
        queryFn: async () => {
            const response = await fetchCallLogs(params)
            // API response: { data: { callLogs: [], info: { total, totalPages } } }
            // or: { callLogs: [], info: { total, totalPages } }
            const responseData = response.data || response
            
            // Extract call logs array
            const callLogs = responseData.callLogs || responseData.data || responseData || []
            
            // Extract pagination info (could be 'info' or 'pagination')
            const info = responseData.info || responseData.pagination || {}
            
            return {
                callLogs: Array.isArray(callLogs) ? callLogs : [],
                pagination: {
                    page: info.page || params.page || 1,
                    limit: info.limit || params.limit || 10,
                    total: info.total || (Array.isArray(callLogs) ? callLogs.length : 0),
                    totalPages: info.totalPages || Math.ceil((info.total || callLogs.length) / (params.limit || 10)) || 1,
                },
            }
        },
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    })
}

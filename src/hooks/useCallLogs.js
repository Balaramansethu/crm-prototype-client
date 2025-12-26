import { useQuery } from "@tanstack/react-query"
import { fetchCallLogs } from "@/service/callLogsService"

export const useCallLogs = (params = {}) => {
    return useQuery({
        queryKey: ["call-logs", params],
        queryFn: async () => {
            const response = await fetchCallLogs(params)
            return response.data || [] // Ensure it returns an array if response.data is null/undefined
        },
        keepPreviousData: true,
    })
}

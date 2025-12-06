import { useQuery } from "@tanstack/react-query"
import { fetchLeads } from "@/service/leadsService"

export const useLeads = (params = {}) => {
    return useQuery({
        queryKey: ["leads", params],
        queryFn: async () => {
            const response = await fetchLeads(params)
            return response.data
        },
        keepPreviousData: true,
    })
}

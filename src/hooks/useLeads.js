import { useQuery } from "@tanstack/react-query"
import { fetchLeads } from "@/service/leadsService"

export const useLeads = () => {
    return useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const response = await fetchLeads()
            return response.data || []
        },
    })
}

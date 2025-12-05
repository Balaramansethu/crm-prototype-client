import { useQuery } from "@tanstack/react-query"
import { fetchLeads } from "@/service/leadsService"

export const useLeads = () => {
    return useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const response = await fetchLeads()
            // The API response has the format: { data: [...] }
            // We return the inner array directly
            return response.data || []
        },
    })
}

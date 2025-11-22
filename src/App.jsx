import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import AppRoutes from "@/routes/AppRoutes"

const queryClient = new QueryClient()

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
    )
}

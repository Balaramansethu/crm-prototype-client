import { useUserStore } from "@/store/userStore"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute() {
    const user = useUserStore((s) => s.user)

    if (!user) return <Navigate to="/login" replace />

    return <Outlet />
}

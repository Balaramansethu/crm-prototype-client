import { useUserStore } from "@/store/userStore"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute({ roles }) {
    const user = useUserStore((s) => s.user)

    if (!user) return <Navigate to="/login" replace />

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}

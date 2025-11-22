import { Navigate, Outlet } from "react-router-dom"
import { useUserStore } from "@/store/userStore"

export default function PrivateLayout() {
    const user = useUserStore((s) => s.user)

    if (!user) return <Navigate to="/" replace />

    return (
        <div className="min-h-screen">
            <Outlet />
        </div>
    )
}

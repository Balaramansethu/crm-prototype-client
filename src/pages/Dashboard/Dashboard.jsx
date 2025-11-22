import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import {
    fetchDashboard,
    fetchAdminDashboard,
    fetchSuperAdminDashboard,
} from "@/service/dashboardService"

export default function Dashboard() {
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const navigate = useNavigate()

    // For showing API responses
    const [dashData, setDashData] = useState(null)
    const [adminData, setAdminData] = useState(null)
    const [superData, setSuperData] = useState(null)

    const [error, setError] = useState(null)

    const handleDashboard = async () => {
        try {
            setError(null)
            const res = await fetchDashboard()
            setDashData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    const handleAdminDashboard = async () => {
        try {
            setError(null)
            const res = await fetchAdminDashboard()
            setAdminData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    const handleSuperAdminDashboard = async () => {
        try {
            setError(null)
            const res = await fetchSuperAdminDashboard()
            setSuperData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <p>
                {user?.firstName} {user?.lastName}
            </p>
            <p>{user?.email}</p>
            <p>Role: {user?.role}</p>

            <button
                onClick={() =>
                    logout.mutate(null, {
                        onSuccess: () => navigate("/login"),
                    })
                }
            >
                Logout
            </button>

            <hr />

            <h2 className="mt-4">Fetch Dashboard Data</h2>

            <button onClick={handleDashboard}>User Dashboard</button>
            {dashData && <pre>{JSON.stringify(dashData, null, 2)}</pre>}

            <button onClick={handleAdminDashboard}>Admin Dashboard</button>
            {adminData && <pre>{JSON.stringify(adminData, null, 2)}</pre>}

            <button onClick={handleSuperAdminDashboard}>
                Super Admin Dashboard
            </button>
            {superData && <pre>{JSON.stringify(superData, null, 2)}</pre>}

            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}

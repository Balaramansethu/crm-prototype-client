import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const navigate = useNavigate()

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
        </div>
    )
}

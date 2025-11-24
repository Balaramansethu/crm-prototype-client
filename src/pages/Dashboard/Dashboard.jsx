import { useEffect, useState } from "react"
import { useUserStore } from "@/store/userStore"
import { useLogout } from "@/hooks/useAuthHooks"
import { useNavigate } from "react-router-dom"

import {
    fetchDashboard,
    fetchAdminDashboard,
    fetchSuperAdminDashboard,
} from "@/service/dashboardService"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { toast } from "sonner"
import { LogOut, User, Mail, Shield, Loader2 } from "lucide-react"

export default function Dashboard() {
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)

    const fetchByRole = async (role = user.role) => {
        setLoading(true)

        try {
            let response

            if (role === "super_admin") {
                response = await fetchSuperAdminDashboard()
            } else if (role === "admin") {
                response = await fetchAdminDashboard()
            } else {
                response = await fetchDashboard()
            }

            setDashboardData(response)
        } catch (err) {
            const message =
                err?.response?.data?.message || "Something went wrong"
            const status = err?.response?.status

            toast.error(message, {
                description: "Failed to load dashboard data",
            })

            if (status === 401) navigate("/login")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchByRole()
    }, [])

    const renderCards = (data) => {
        const cards = data?.data?.cards || data?.error?.cards
        if (!cards) return null

        const borderColor =
            user.role === "admin"
                ? "border-green-200"
                : user.role === "super_admin"
                ? "border-purple-200"
                : ""

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {cards.map((card, index) => (
                    <Card key={index} className={borderColor}>
                        <CardHeader>
                            <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base">
                                {card.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8 flex gap-6">

            <div className="w-64 border-r pr-4 hidden md:block">
                <h2 className="text-xl font-semibold text-center mb-4">Navigation</h2>

                <div className="flex flex-col gap-3">

                    {user.role === "super_admin" && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => fetchByRole("admin")}
                            >
                                Admin Dashboard
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => fetchByRole("employee")}
                            >
                                Employee Dashboard
                            </Button>
                        </>
                    )}

                    {user.role === "admin" && (
                        <Button
                            variant="outline"
                            onClick={() => fetchByRole("employee")}
                        >
                            Employee Dashboard
                        </Button>
                    )}

                </div>
            </div>

            <div className="flex-1 mx-auto max-w-7xl space-y-8">

                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user.role === "super_admin"
                                ? "Super Admin Dashboard"
                                : user.role === "admin"
                                ? "Admin Dashboard"
                                : "User Dashboard"}
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user.firstName}!
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() =>
                            logout.mutate(null, {
                                onSuccess: () => navigate("/login"),
                            })
                        }
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Name</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.firstName} {user.lastName}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center space-x-4">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center space-x-4">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Role</p>
                                <Badge variant="secondary">{user.role}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {loading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!loading && dashboardData && (
                    <div className="space-y-4">
                        {dashboardData.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {dashboardData.message}
                            </p>
                        )}
                        {renderCards(dashboardData)}
                    </div>
                )}
            </div>
        </div>
    )
}

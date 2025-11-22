import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LogOut, User, Mail, Shield, Loader2 } from "lucide-react"

export default function Dashboard() {
    const user = useUserStore((s) => s.user)
    const logout = useLogout()
    const navigate = useNavigate()

    const [dashData, setDashData] = useState(null)
    const [adminData, setAdminData] = useState(null)
    const [superData, setSuperData] = useState(null)
    const [error, setError] = useState(null)
      const [loadingUser, setLoadingUser] = useState(false)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [loadingSuper, setLoadingSuper] = useState(false)

    const handleDashboard = async () => {
        try {
            setLoadingUser(true)
            setError(null)
            const res = await fetchDashboard()
            setDashData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoadingUser(false)
        }
    }

    const handleAdminDashboard = async () => {
        try {
            setLoadingAdmin(true)
            setError(null)
            const res = await fetchAdminDashboard()
            setAdminData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoadingAdmin(false)
        }
    }

    const handleSuperAdminDashboard = async () => {
        try {
            setLoadingSuper(true)
            setError(null)
            const res = await fetchSuperAdminDashboard()
            setSuperData(res)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoadingSuper(false)
        }
    }

    const renderCards = (data, variant = "default") => {
        const cards = data?.data?.cards || data?.error?.cards
        if (!cards) return null

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        className={
                            variant === "admin"
                                ? "border-green-200"
                                : variant === "super"
                                  ? "border-purple-200"
                                  : ""
                        }
                    >
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
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user?.firstName}!
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

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Your account details and role
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Name</p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-4">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center space-x-4">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">Role</p>
                                <Badge variant="secondary">{user?.role}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Fetch Dashboard Data</CardTitle>
                        <CardDescription>
                            Load different dashboard views based on your
                            permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleDashboard}
                                disabled={loadingUser}
                                variant="default"
                            >
                                {loadingUser ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                User Dashboard
                            </Button>
                            <Button
                                onClick={handleAdminDashboard}
                                disabled={loadingAdmin}
                                variant="default"
                            >
                                {loadingAdmin ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Admin Dashboard
                            </Button>
                            <Button
                                onClick={handleSuperAdminDashboard}
                                disabled={loadingSuper}
                                variant="default"
                            >
                                {loadingSuper ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Super Admin Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* User Dashboard Data */}
                {dashData && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                User Dashboard
                            </h2>
                            {dashData.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {dashData.message}
                                </p>
                            )}
                        </div>
                        {renderCards(dashData, "default")}
                    </div>
                )}

                {/* Admin Dashboard Data */}
                {adminData && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Admin Dashboard
                            </h2>
                            {adminData.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {adminData.message}
                                </p>
                            )}
                        </div>
                        {renderCards(adminData, "admin")}
                    </div>
                )}

                {/* Super Admin Dashboard Data */}
                {superData && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Super Admin Dashboard
                            </h2>
                            {superData.message && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {superData.message}
                                </p>
                            )}
                        </div>
                        {renderCards(superData, "super")}
                    </div>
                )}
            </div>
        </div>
    )
}

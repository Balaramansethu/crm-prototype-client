import { Routes, Route } from "react-router-dom"

import PublicLayout from "@/layouts/PublicLayout"
import PrivateLayout from "@/layouts/PrivateLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

import SignupPage from "@/pages/SignupPage/SignupPage"
import LoginPage from "@/pages/LoginPage/LoginPage"

import DashboardPage from "@/pages/Dashboard/Dashboard"
import LeadsPage from "@/pages/LeadsPage/LeadsPage"
import CreateLeadPage from "@/pages/LeadsPage/CreateLeadPage"
import Unauthorized from "@/components/unauthorized"

export default function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<SignupPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* PRIVATE ROUTES */}
            <Route element={<ProtectedRoute />}>
                <Route element={<PrivateLayout />}>

                {/* LEADS PAGE (Employee + Admin + Super Admin) */}
                    <Route
                        path="/leads"
                        element={
                            <ProtectedRoute
                                roles={["employee", "admin", "super_admin"]}
                            />
                        }
                    >
                        <Route index element={<LeadsPage />} />
                        <Route path="new" element={<CreateLeadPage />} />
                    </Route>
                    {/* EMPLOYEE */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute
                                roles={["employee", "admin", "super_admin"]}
                            />
                        }
                    >
                        <Route index element={<DashboardPage />} />
                    </Route>

                    {/* ADMIN */}
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute roles={["admin", "super_admin"]} />
                        }
                    >
                        <Route index element={<DashboardPage />} />
                    </Route>

                    {/* SUPER ADMIN */}
                    <Route
                        path="/dashboard/super-admin"
                        element={<ProtectedRoute roles={["super_admin"]} />}
                    >
                        <Route index element={<DashboardPage />} />
                    </Route>
                </Route>
            </Route>

            {/* UNAUTHORIZED PAGE */}
            <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
    )
}

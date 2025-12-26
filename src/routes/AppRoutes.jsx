import { Routes, Route } from "react-router-dom"

import PublicLayout from "@/layouts/PublicLayout"
import PrivateLayout from "@/layouts/PrivateLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

import SignupPage from "@/pages/SignupPage/SignupPage"
import LoginPage from "@/pages/LoginPage/LoginPage"
import OrganizationRegisterPage from "@/pages/OrganizationRegisterPage/OrganizationRegisterPage"

import DashboardPage from "@/pages/Dashboard/Dashboard"
import LeadsPage from "@/pages/LeadsPage/LeadsPage"
import CreateLeadPage from "@/pages/LeadsPage/CreateLeadPage"
import EditLeadPage from "@/pages/LeadsPage/EditLeadPage"
import CallLogsPage from "@/pages/CallLogsPage/CallLogsPage"
import CreateCallLogPage from "@/pages/CallLogsPage/CreateCallLogPage"
import EditCallLogPage from "@/pages/CallLogsPage/EditCallLogPage"
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage"
import Unauthorized from "@/components/unauthorized"

export default function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<SignupPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/register-organization"
                    element={<OrganizationRegisterPage />}
                />
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
                        <Route path="edit/:id" element={<EditLeadPage />} />
                    </Route>

                    {/* CALL LOGS */}
                    <Route
                        path="/call-logs"
                        element={
                            <ProtectedRoute
                                roles={["employee", "admin", "super_admin"]}
                            />
                        }
                    >
                        <Route index element={<CallLogsPage />} />
                        <Route path="new" element={<CreateCallLogPage />} />
                        <Route path="edit/:id" element={<EditCallLogPage />} />
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
            {/* 404 PAGE */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

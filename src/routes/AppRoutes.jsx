import { Routes, Route } from "react-router-dom"

import PublicLayout from "@/layouts/PublicLayout"
import PrivateLayout from "@/layouts/PrivateLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

import SignupPage from "@/pages/SignupPage/SignupPage"
import LoginPage from "@/pages/LoginPage/LoginPage"
import Dashboard from "@/pages/Dashboard/Dashboard"
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
                {/* Employee */}
                <Route element={<ProtectedRoute roles={["employee"]} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                {/* Admin */}
                <Route element={<ProtectedRoute roles={["admin"]} />}>
                    <Route path="/dashboard/admin" element={<Dashboard />} />
                </Route>

                {/* Super Admin */}
                <Route element={<ProtectedRoute roles={["super_admin"]} />}>
                    <Route
                        path="/dashboard/super-admin"
                        element={<Dashboard />}
                    />
                </Route>
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
    )
}

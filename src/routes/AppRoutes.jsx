import { Routes, Route } from "react-router-dom"

import PublicLayout from "@/layouts/PublicLayout"
import PrivateLayout from "@/layouts/PrivateLayout"
import ProtectedRoute from "@/components/ProtectedRoute"

import SignupPage from "@/pages/SignupPage/SignupPage"
import LoginPage from "@/pages/LoginPage/LoginPage"
import Dashboard from "@/pages/Dashboard/Dashboard"

export default function AppRoutes() {
    return (
        <Routes>
            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* PRIVATE ROUTES */}
            <Route element={<ProtectedRoute />}>
                <Route element={<PrivateLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Route>
        </Routes>
    )
}

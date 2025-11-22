import { Outlet } from "react-router-dom"

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
            <div className="w-full max-w-md px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}

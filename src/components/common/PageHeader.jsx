import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

/**
 * Reusable page header component with breadcrumb navigation.
 * Provides consistent header layout across all pages.
 * 
 * @param {Object} props
 * @param {Array} props.breadcrumbs - Array of { label, path? } objects
 * @param {string} props.title - Page title
 * @param {React.ReactNode} [props.actions] - Optional action buttons
 */
export default function PageHeader({ breadcrumbs = [], title, actions }) {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            {/* Breadcrumb */}
            {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index} className="flex items-center gap-2">
                            {index > 0 && <ChevronRight className="h-4 w-4" />}
                            {crumb.path ? (
                                <span
                                    className="hover:text-foreground cursor-pointer"
                                    onClick={() => navigate(crumb.path)}
                                >
                                    {crumb.label}
                                </span>
                            ) : (
                                <span className="text-foreground font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {/* Title & Actions */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{title}</h1>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}

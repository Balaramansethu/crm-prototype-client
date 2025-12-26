import { cn } from "@/lib/utils"

/**
 * Reusable form container component for consistent form layouts.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form content
 * @param {string} [props.maxWidth="max-w-2xl"] - Maximum width class
 * @param {string} [props.className] - Additional CSS classes
 */
export default function FormContainer({
    children,
    maxWidth = "max-w-2xl",
    className,
}) {
    return (
        <div className="flex flex-1 flex-col">
            <div className="px-4 py-6 lg:px-6">
                <div
                    className={cn(
                        "rounded-md border bg-white p-6 shadow-sm",
                        maxWidth,
                        className,
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

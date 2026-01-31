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
            {/* No horizontal padding - form aligns with page header */}
            <div className="w-full py-2 sm:py-4 md:py-6">
                <div
                    className={cn(
                        // Card styling
                        "rounded-md border bg-white shadow-sm",
                        // Responsive padding inside the card
                        "p-4 sm:p-5 md:p-6",
                        // Width handling - left aligned, no mx-auto
                        "w-full",
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

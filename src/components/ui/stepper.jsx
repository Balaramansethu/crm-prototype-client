import { Fragment } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Horizontal Stepper Component
 * Based on Material Design horizontal stepper pattern
 *
 * @param {Object} props
 * @param {number} props.currentStep - Current active step (1-indexed)
 * @param {Array} props.steps - Array of step objects: [{ label: string, description?: string }]
 * @param {string} [props.className] - Additional CSS classes
 */
export function Stepper({ currentStep, steps = [], className }) {
    return (
        <div className={cn("flex items-center w-full", className)}>
            {steps.map((step, index) => {
                const stepNumber = index + 1
                const isActive = currentStep === stepNumber
                const isCompleted = currentStep > stepNumber

                return (
                    <Fragment key={stepNumber}>
                        <div className="flex flex-col items-center gap-2 flex-1">
                            <div
                                className={cn(
                                    "flex shrink-0 size-8 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300",
                                    isActive &&
                                        "bg-primary text-primary-foreground border-primary scale-110 shadow-sm",
                                    isCompleted &&
                                        "bg-primary/20 text-primary border-primary/20",
                                    !isActive &&
                                        !isCompleted &&
                                        "bg-muted text-muted-foreground border-muted-foreground/30",
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="size-4" />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            {step.label && (
                                <div className="text-center">
                                    <p
                                        className={cn(
                                            "text-xs font-medium transition-colors",
                                            isActive && "text-foreground",
                                            !isActive &&
                                                "text-muted-foreground",
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        {stepNumber < steps.length && (
                            <div
                                className={cn(
                                    "h-[2px] flex-1 mx-2 rounded-full transition-all duration-500 min-w-[20px]",
                                    currentStep > stepNumber
                                        ? "bg-primary/20"
                                        : "bg-muted",
                                )}
                            />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}

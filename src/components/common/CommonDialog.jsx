import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

/**
 * A reusable dialog component that supports different variants (default, destructive, success, warning).
 *
 * @param {Object} props
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {function} props.onOpenChange - Callback when open status changes.
 * @param {string} props.title - Dialog title.
 * @param {string} props.description - Dialog description text.
 * @param {string} [props.variant="default"] - "default" | "destructive" | "success" | "warning" | "info"
 * @param {string} [props.confirmText="Confirm"] - Text for the confirmation button.
 * @param {string} [props.cancelText="Cancel"] - Text for the cancel button.
 * @param {function} props.onConfirm - Callback when confirm button is clicked.
 * @param {boolean} [props.isLoading=false] - Shows loading state on confirm button.
 * @param {boolean} [props.hideCancel=false] - Whether to hide the cancel button.
 * @param {boolean} [props.showIcon=true] - Whether to show the variant icon.
 */
export default function CommonDialog({
    open,
    onOpenChange,
    title,
    description,
    variant = "default",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    isLoading = false,
    hideCancel = false,
    showIcon = true,
    hideCloseButton = false,
}) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    const getVariantStyles = () => {
        switch (variant) {
            case "destructive":
                return {
                    icon: <Archive className="h-6 w-6 text-primary" />,
                    buttonVariant: "default",
                    headerColor: "text-black",
                    isCentered: true,
                    iconBgColor: "bg-primary/10",
                }
            case "success":
                return {
                    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                    buttonVariant: "default",
                    headerColor: "text-green-600",
                    iconBgColor: "bg-green-100",
                }
            case "warning":
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
                    buttonVariant: "secondary",
                    headerColor: "text-yellow-600",
                    iconBgColor: "bg-yellow-100",
                }
            case "info":
                return {
                    icon: <Info className="h-6 w-6 text-primary" />,
                    buttonVariant: "default",
                    headerColor: "text-primary",
                    isCentered: true,
                    iconBgColor: "bg-primary/10",
                }
            case "default":
            default:
                return {
                    icon: null,
                    buttonVariant: "default",
                    headerColor: "",
                    isCentered: false,
                    iconBgColor: "bg-muted",
                }
        }
    }

    const { icon, buttonVariant, headerColor, isCentered, iconBgColor } =
        getVariantStyles()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "sm:max-w-[425px]",
                    isCentered && "sm:max-w-[400px]",
                )}
                dir={isRTL ? "rtl" : "ltr"}
                hideCloseButton={hideCloseButton}
            >
                <DialogHeader>
                    {isCentered ? (
                        <div className="flex flex-col items-center text-center gap-2">
                            {showIcon && icon && (
                                <div
                                    className={cn(
                                        "mb-1 sm:mb-2 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full",
                                        iconBgColor,
                                    )}
                                >
                                    {icon}
                                </div>
                            )}
                            <DialogTitle
                                className={cn(
                                    "text-lg sm:text-xl font-bold",
                                    headerColor,
                                )}
                            >
                                {title}
                            </DialogTitle>
                            {description && (
                                <DialogDescription className="text-center text-muted-foreground text-sm">
                                    {description}
                                </DialogDescription>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 sm:gap-4 text-start">
                            {showIcon && icon && (
                                <div className="flex-shrink-0">{icon}</div>
                            )}
                            <div className="flex flex-col gap-1">
                                <DialogTitle
                                    className={cn(
                                        "text-start text-base sm:text-lg",
                                        headerColor,
                                    )}
                                >
                                    {title}
                                </DialogTitle>
                                {description && (
                                    <DialogDescription className="text-start text-sm">
                                        {description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>
                    )}
                </DialogHeader>

                <DialogFooter
                    className={cn(
                        "mt-4 sm:mt-6",
                        isCentered && !hideCancel
                            ? "grid grid-cols-2 gap-2 sm:gap-3 sm:space-x-0"
                            : "gap-2",
                    )}
                >
                    {!hideCancel && (
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="w-full touch-target"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant={buttonVariant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full touch-target"
                    >
                        {isLoading ? (
                            <>
                                <Loader2
                                    className={cn(
                                        "h-4 w-4 animate-spin",
                                        isRTL ? "ml-2" : "mr-2",
                                    )}
                                />
                                {confirmText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

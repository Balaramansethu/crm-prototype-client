import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export default function FieldRow({ label, value, dir, className, children }) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    const displayContent = children || value || "-"

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2.5 sm:py-2 min-h-[40px]",
                className,
            )}
        >
            <span className="text-sm font-medium text-muted-foreground sm:flex-shrink-0 sm:pt-0.5">
                {label}
            </span>
            <div
                className={cn(
                    "text-sm font-medium break-words overflow-wrap-anywhere sm:max-w-[60%] sm:flex-1 text-foreground",
                    "sm:text-right",
                    isRTL && "sm:text-left",
                )}
                dir={dir || (isRTL ? "rtl" : "ltr")}
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
                {displayContent}
            </div>
        </div>
    )
}

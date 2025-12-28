import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

export default function FieldRow({ label, value, dir, className, children }) {
    const { i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"

    const displayContent = children || value || "-"

    return (
        <div
            className={cn(
                "flex items-start justify-between gap-4 py-2 min-h-[40px]",
                className,
            )}
        >
            <span className="text-sm text-muted-foreground flex-shrink-0 pt-0.5">
                {label}
            </span>
            <div
                className={cn(
                    "text-sm font-medium text-right break-words overflow-wrap-anywhere max-w-[60%] flex-1",
                    isRTL && "text-left",
                )}
                dir={dir || (isRTL ? "rtl" : "ltr")}
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
                {displayContent}
            </div>
        </div>
    )
}

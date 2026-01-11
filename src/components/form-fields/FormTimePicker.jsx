import { useState, useEffect, useRef } from "react"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * Custom Time Picker with Now and OK buttons - 12-hour format with AM/PM
 */
export function FormTimePicker({
    control,
    name,
    label,
    disabled = false,
    required = false,
}) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const [open, setOpen] = useState(false)
    const [tempHours, setTempHours] = useState("12")
    const [tempMinutes, setTempMinutes] = useState("00")
    const [tempPeriod, setTempPeriod] = useState("AM")
    const hoursInputRef = useRef(null)

    // Focus hours input when popover opens
    useEffect(() => {
        if (open && hoursInputRef.current) {
            setTimeout(() => {
                hoursInputRef.current?.focus()
                hoursInputRef.current?.select()
            }, 100)
        }
    }, [open])

    // Convert 24-hour to 12-hour format
    const to12Hour = (hours24) => {
        const h = parseInt(hours24, 10)
        if (h === 0) return { hours: "12", period: "AM" }
        if (h === 12) return { hours: "12", period: "PM" }
        if (h > 12)
            return { hours: String(h - 12).padStart(2, "0"), period: "PM" }
        return { hours: String(h).padStart(2, "0"), period: "AM" }
    }

    // Convert 12-hour to 24-hour format
    const to24Hour = (hours12, period) => {
        let h = parseInt(hours12, 10)
        if (period === "AM") {
            if (h === 12) h = 0
        } else {
            if (h !== 12) h = h + 12
        }
        return String(h).padStart(2, "0")
    }

    // Parse time value (HH:mm in 24-hour) to 12-hour format
    const parseTime = (value) => {
        if (!value) return { hours: "12", minutes: "00", period: "AM" }
        const parts = value.split(":")
        const hours24 = parts[0]?.padStart(2, "0") || "00"
        const minutes = parts[1]?.padStart(2, "0") || "00"
        const { hours, period } = to12Hour(hours24)
        return { hours, minutes, period }
    }

    // Handle setting current time
    const handleNow = () => {
        const now = new Date()
        const { hours, period } = to12Hour(String(now.getHours()))
        setTempHours(hours)
        setTempMinutes(String(now.getMinutes()).padStart(2, "0"))
        setTempPeriod(period)
    }

    // Handle hours input change (1-12)
    const handleHoursChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2)
        const numVal = parseInt(val, 10)
        if (val === "") {
            setTempHours("")
        } else if (numVal >= 1 && numVal <= 12) {
            setTempHours(val)
        } else if (numVal > 12) {
            setTempHours("12")
        } else if (numVal === 0) {
            setTempHours("12")
        }
    }

    // Handle minutes input change
    const handleMinutesChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2)
        const numVal = parseInt(val, 10)
        if (val === "") {
            setTempMinutes("")
        } else if (numVal >= 0 && numVal <= 59) {
            setTempMinutes(val)
        } else if (numVal > 59) {
            setTempMinutes("59")
        }
    }

    // Format display value for the button (12-hour format)
    const formatDisplayTime = (value) => {
        if (!value) return ""
        const { hours, minutes, period } = parseTime(value)
        return `${hours}:${minutes} ${period}`
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                // Sync temp values when opening popover
                const handleOpenChange = (isOpen) => {
                    if (isOpen) {
                        const { hours, minutes, period } = parseTime(
                            field.value,
                        )
                        setTempHours(hours)
                        setTempMinutes(minutes)
                        setTempPeriod(period)
                    }
                    setOpen(isOpen)
                }

                // Apply the selected time (convert back to 24-hour for storage)
                const handleOk = () => {
                    const hours12 = tempHours.padStart(2, "0") || "12"
                    const minutes = tempMinutes.padStart(2, "0") || "00"
                    const hours24 = to24Hour(hours12, tempPeriod)
                    field.onChange(`${hours24}:${minutes}`)
                    setOpen(false)
                }

                return (
                    <FormItem className="flex flex-col">
                        {label && (
                            <FormLabel>
                                {label}
                                {required && (
                                    <span className="text-destructive ml-1">
                                        *
                                    </span>
                                )}
                            </FormLabel>
                        )}
                        <Popover open={open} onOpenChange={handleOpenChange}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        disabled={disabled}
                                        className={cn(
                                            "w-full justify-between font-normal",
                                            !field.value &&
                                                "text-muted-foreground",
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {field.value
                                                ? formatDisplayTime(field.value)
                                                : t("selectTime") ||
                                                  "Select time"}
                                        </span>
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[280px] p-4"
                                align={isRTL ? "end" : "start"}
                            >
                                {/* Time Input */}
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="flex flex-col items-center">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            {t("hr") || "Hr"}
                                        </label>
                                        <Input
                                            ref={hoursInputRef}
                                            value={tempHours}
                                            onChange={handleHoursChange}
                                            onBlur={() =>
                                                setTempHours(
                                                    tempHours.padStart(
                                                        2,
                                                        "0",
                                                    ) || "12",
                                                )
                                            }
                                            className="w-14 text-center text-lg font-medium tabular-nums"
                                            maxLength={2}
                                            placeholder="12"
                                        />
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground mt-5">
                                        :
                                    </span>
                                    <div className="flex flex-col items-center">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            {t("min") || "Min"}
                                        </label>
                                        <Input
                                            value={tempMinutes}
                                            onChange={handleMinutesChange}
                                            onBlur={() =>
                                                setTempMinutes(
                                                    tempMinutes.padStart(
                                                        2,
                                                        "0",
                                                    ) || "00",
                                                )
                                            }
                                            className="w-14 text-center text-lg font-medium tabular-nums"
                                            maxLength={2}
                                            placeholder="00"
                                        />
                                    </div>
                                    {/* AM/PM Toggle */}
                                    <div className="flex flex-col items-center">
                                        <label className="text-xs text-muted-foreground mb-1">
                                            &nbsp;
                                        </label>
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                type="button"
                                                variant={
                                                    tempPeriod === "AM"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className={cn(
                                                    "h-7 px-3 text-xs font-medium",
                                                    tempPeriod === "AM"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-muted",
                                                )}
                                                onClick={() =>
                                                    setTempPeriod("AM")
                                                }
                                            >
                                                AM
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={
                                                    tempPeriod === "PM"
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                className={cn(
                                                    "h-7 px-3 text-xs font-medium",
                                                    tempPeriod === "PM"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-muted",
                                                )}
                                                onClick={() =>
                                                    setTempPeriod("PM")
                                                }
                                            >
                                                PM
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleNow}
                                    >
                                        {t("now") || "Now"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleOk}
                                    >
                                        {t("okay") || "OK"}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}

export default FormTimePicker

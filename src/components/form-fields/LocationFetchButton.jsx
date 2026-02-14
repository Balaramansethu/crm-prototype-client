import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Locate, Loader2, Check } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function LocationFetchButton({
    namePrefix = "companyDetails.address",
    disabled = false,
}) {
    const { t } = useTranslation()
    const { setValue, register, formState: { errors } } = useFormContext()
    const [status, setStatus] = useState("idle") // idle, loading, success, error

    const fetchLocation = () => {
        setStatus("loading")

        if (!navigator.geolocation) {
            setStatus("error")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                // Store silently in form state
                // Using existing schema path to match AddressFields and backend
                setValue(`${namePrefix}.latitude`, latitude, {
                    shouldDirty: true,
                })
                setValue(`${namePrefix}.longitude`, longitude, {
                    shouldDirty: true,
                })
                setStatus("success")
            },
            (error) => {
                console.error("Geolocation error:", error)
                setStatus("error")
            },
            {
                enableHighAccuracy: true,
            },
        )
    }

    // Access nested errors for latitude/longitude if they exist
    // namePrefix e.g. "companyDetails.address"
    const addressErrors = namePrefix.split('.').reduce((obj, key) => obj && obj[key], errors)
    const latError = addressErrors?.latitude
    const lngError = addressErrors?.longitude
    const anyLocationError = latError || lngError

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {t("location") || "Location"}
            </Label>
            <div className="relative">
                <Button
                    type="button"
                    variant={status === "success" ? "default" : "outline"}
                    className={cn(
                        "w-full justify-start transition-all duration-200",
                        status === "success" &&
                            "bg-green-600 hover:bg-green-700 text-white border-green-600",
                        (anyLocationError || status === "error") && "border-destructive text-destructive hover:bg-destructive/10"
                    )}
                    onClick={fetchLocation}
                    disabled={
                        disabled ||
                        status === "loading" ||
                        status === "success"
                    }
                >
                    {status === "idle" && (
                        <>
                            <Locate className="mr-2 h-4 w-4" />
                            {t("fetchLocation") || "Fetch Location"}
                        </>
                    )}
                    {status === "loading" && (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("fetching") || "Fetching..."}
                        </>
                    )}
                    {status === "success" && (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            {t("locationFetchedSuccessfully") ||
                                "Location Fetched Successfully"}
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <Locate className="mr-2 h-4 w-4" />
                            {t("retryFetchLocation") || "Fetch Location"}
                        </>
                    )}
                </Button>
                
                {/* Geolocation API Error */}
                {status === "error" && (
                    <p className="text-destructive text-[0.8rem] font-medium mt-1.5 animate-in fade-in slide-in-from-top-1">
                        {t("locationFetchError") ||
                            "Unable to fetch location. Please allow location access."}
                    </p>
                )}
                
                {/* Form Validation Error (if any) */}
                {anyLocationError && (
                     <p className="text-destructive text-[0.8rem] font-medium mt-1.5 animate-in fade-in slide-in-from-top-1">
                        {anyLocationError.message || t("invalidFormat")}
                     </p>
                )}
            </div>
            
            <input type="hidden" {...register(`${namePrefix}.latitude`)} />
            <input type="hidden" {...register(`${namePrefix}.longitude`)} />
        </div>
    )
}

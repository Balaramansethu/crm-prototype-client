import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Locate, Loader2, Check, Copy } from "lucide-react"
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
    const [fetchedCoords, setFetchedCoords] = useState(null)
    const [copied, setCopied] = useState(false)

    const handleCopy = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (fetchedCoords) {
            navigator.clipboard.writeText(`${fetchedCoords.latitude}, ${fetchedCoords.longitude}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

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
                setFetchedCoords({ latitude, longitude })
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
                {status === "success" ? (
                    <div
                        className={cn(
                            "w-full h-10 px-4 py-2 rounded-md flex items-center justify-between transition-all duration-200",
                            "bg-green-600 text-white border border-green-600"
                        )}
                    >
                        <div className="flex items-center gap-2 font-mono text-xs truncate mr-2">
                             <span>Lat: {fetchedCoords?.latitude}, Long: {fetchedCoords?.longitude}</span>
                        </div>
                        <div className="relative shrink-0">
                             <button
                                type="button"
                                onClick={handleCopy}
                                className="p-1 hover:bg-green-700 rounded transition-colors text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                                title="Copy coordinates"
                             >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                             </button>
                             {copied && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded shadow-sm whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 z-10">
                                    Copied!
                                </div>
                             )}
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            "w-full justify-start transition-all duration-200",
                            (anyLocationError || status === "error") && "border-destructive text-destructive hover:bg-destructive/10"
                        )}
                        onClick={fetchLocation}
                        disabled={
                            disabled ||
                            status === "loading"
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
                        {status === "error" && (
                            <>
                                <Locate className="mr-2 h-4 w-4" />
                                {t("retryFetchLocation") || "Fetch Location"}
                            </>
                        )}
                    </Button>
                )}
                
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

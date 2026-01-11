import { useState, useMemo, useRef, useEffect } from "react"
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
import { ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { useCountries } from "@/hooks/useCountries"
import { useTranslation } from "react-i18next"

/**
 * Country Code Select Component with Flag
 * Displays a searchable dropdown with country flags and calling codes
 */
export function CountryCodeSelect({
    control,
    name,
    label,
    disabled = false,
    placeholder = "+966",
}) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.dir() === "rtl"
    const { countries, loading } = useCountries()
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const searchInputRef = useRef(null)

    // Focus search input when popover opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
    }, [open])

    // Filter countries based on search query
    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return countries
        const query = searchQuery.toLowerCase()
        return countries.filter(
            (country) =>
                country.name.toLowerCase().includes(query) ||
                country.callingCode.includes(query) ||
                country.code.toLowerCase().includes(query)
        )
    }, [countries, searchQuery])

    // Find country by calling code
    const findCountryByCode = (callingCode) => {
        if (!callingCode) return null
        return countries.find(
            (c) =>
                c.callingCode === callingCode ||
                c.callingCode === `+${callingCode.replace("+", "")}`
        )
    }

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const selectedCountry = findCountryByCode(field.value)

                return (
                    <FormItem className="flex flex-col">
                        {label && <FormLabel>{label}</FormLabel>}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        disabled={disabled || loading}
                                        className={cn(
                                            "w-full justify-between font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-xs">
                                                    {t("loading")}
                                                </span>
                                            </span>
                                        ) : selectedCountry ? (
                                            <span className="flex items-center gap-2">
                                                <img
                                                    src={selectedCountry.flag}
                                                    alt={selectedCountry.name}
                                                    className="h-4 w-6 object-cover rounded-sm border"
                                                    loading="lazy"
                                                />
                                                <span className="font-medium">
                                                    {selectedCountry.callingCode}
                                                </span>
                                            </span>
                                        ) : (
                                            <span>{placeholder}</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[280px] p-0"
                                align={isRTL ? "end" : "start"}
                            >
                                {/* Search Input */}
                                <div className="p-2 border-b">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder={t("searchCountry") || "Search country..."}
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>

                                {/* Country List */}
                                <div className="max-h-[280px] overflow-y-auto">
                                    {filteredCountries.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            {t("noCountryFound") || "No country found"}
                                        </div>
                                    ) : (
                                        filteredCountries.map((country) => (
                                            <button
                                                key={country.code}
                                                type="button"
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent transition-colors",
                                                    field.value ===
                                                        country.callingCode &&
                                                        "bg-accent/50"
                                                )}
                                                onClick={() => {
                                                    field.onChange(
                                                        country.callingCode
                                                    )
                                                    setOpen(false)
                                                    setSearchQuery("")
                                                }}
                                            >
                                                <img
                                                    src={country.flag}
                                                    alt={country.name}
                                                    className="h-4 w-6 object-cover rounded-sm border flex-shrink-0"
                                                    loading="lazy"
                                                />
                                                <span className="flex-1 text-left truncate">
                                                    {country.name}
                                                </span>
                                                <span className="font-medium text-muted-foreground">
                                                    {country.callingCode}
                                                </span>
                                            </button>
                                        ))
                                    )}
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

export default CountryCodeSelect

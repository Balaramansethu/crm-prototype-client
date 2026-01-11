import { useState, useEffect } from "react"

/**
 * Custom hook to fetch country data from REST Countries API
 * Returns countries with their name, flag, and phone calling code
 */
export function useCountries() {
    const [countries, setCountries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoading(true)
                const response = await fetch(
                    "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2",
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch countries")
                }

                const data = await response.json()

                // Transform and sort the data
                const transformedCountries = data
                    .filter(
                        (country) =>
                            country.idd?.root && country.idd?.suffixes?.length,
                    )
                    .map((country) => {
                        // Get the primary calling code (root + first suffix)
                        const callingCode = `${country.idd.root}${country.idd.suffixes[0] || ""}`
                        return {
                            code: country.cca2,
                            name: country.name.common,
                            callingCode: callingCode,
                            flag: country.flags.svg || country.flags.png,
                            flagEmoji: country.flags.alt ? "🏳️" : "🏳️",
                        }
                    })
                    .sort((a, b) => a.name.localeCompare(b.name))

                setCountries(transformedCountries)
                setError(null)
            } catch (err) {
                console.error("Error fetching countries:", err)
                setError(err.message)
                // Fallback to common countries if API fails
                setCountries(getFallbackCountries())
            } finally {
                setLoading(false)
            }
        }

        fetchCountries()
    }, [])

    return { countries, loading, error }
}

/**
 * Fallback countries in case API fails
 */
function getFallbackCountries() {
    return [
        {
            code: "SA",
            name: "Saudi Arabia",
            callingCode: "+966",
            flag: "https://flagcdn.com/sa.svg",
        },
        {
            code: "AE",
            name: "United Arab Emirates",
            callingCode: "+971",
            flag: "https://flagcdn.com/ae.svg",
        },
        {
            code: "IN",
            name: "India",
            callingCode: "+91",
            flag: "https://flagcdn.com/in.svg",
        },
        {
            code: "US",
            name: "United States",
            callingCode: "+1",
            flag: "https://flagcdn.com/us.svg",
        },
        {
            code: "GB",
            name: "United Kingdom",
            callingCode: "+44",
            flag: "https://flagcdn.com/gb.svg",
        },
        {
            code: "PK",
            name: "Pakistan",
            callingCode: "+92",
            flag: "https://flagcdn.com/pk.svg",
        },
        {
            code: "EG",
            name: "Egypt",
            callingCode: "+20",
            flag: "https://flagcdn.com/eg.svg",
        },
        {
            code: "JO",
            name: "Jordan",
            callingCode: "+962",
            flag: "https://flagcdn.com/jo.svg",
        },
        {
            code: "KW",
            name: "Kuwait",
            callingCode: "+965",
            flag: "https://flagcdn.com/kw.svg",
        },
        {
            code: "QA",
            name: "Qatar",
            callingCode: "+974",
            flag: "https://flagcdn.com/qa.svg",
        },
        {
            code: "BH",
            name: "Bahrain",
            callingCode: "+973",
            flag: "https://flagcdn.com/bh.svg",
        },
        {
            code: "OM",
            name: "Oman",
            callingCode: "+968",
            flag: "https://flagcdn.com/om.svg",
        },
    ]
}

export default useCountries

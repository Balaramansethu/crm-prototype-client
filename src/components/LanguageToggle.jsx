import { useEffect, useState } from "react"
import i18n from "@/i18n"

export default function LanguageToggle() {
    const [lang, setLang] = useState(i18n.language || "en")

    useEffect(() => {
        const savedLang = localStorage.getItem("lang") || "en"
        setLang(savedLang)
    }, [])

    const switchLanguage = (newLang) => {
        i18n.changeLanguage(newLang)
        setLang(newLang)
        localStorage.setItem("lang", newLang)

        document.documentElement.lang = newLang
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => switchLanguage("en")}
                className={`px-3 py-1 rounded ${
                    lang === "en" ? "bg-black text-white" : "bg-gray-200"
                }`}
            >
                EN
            </button>

            <button
                onClick={() => switchLanguage("ar")}
                className={`px-3 py-1 rounded ${
                    lang === "ar" ? "bg-black text-white" : "bg-gray-200"
                }`}
            >
                العربية
            </button>
        </div>
    )
}

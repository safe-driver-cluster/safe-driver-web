"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { translations, Language } from "@/lib/translations"

type LanguageContextType = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, replacements?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en-US")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const savedLang = localStorage.getItem("safedriver-language") as Language
        if (savedLang && ["en-US", "si-LK", "ta-LK"].includes(savedLang)) {
            setLanguageState(savedLang)
        }
        setMounted(true)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("safedriver-language", lang)
        document.documentElement.lang = lang
    }

    const t = (key: string, replacements?: Record<string, string | number>) => {
        // Basic lookup
        // If not mounted, use default English to avoid hydration mismatch if possible
        const currentLang = mounted ? language : "en-US"
        const langData = translations[currentLang] || translations["en-US"]
        let translation = (langData as any)[key] || key

        // Handle replacements if provided
        if (replacements && typeof translation === "string") {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translation = translation.replace(new RegExp(`{{${placeholder}}}`, "g"), String(value))
            })
        }

        return translation
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}

"use client"

import { useEffect } from "react"

export function ColorSchemeInitializer() {
    useEffect(() => {
        const savedColorScheme = localStorage.getItem("safedriver-color-scheme")
        if (savedColorScheme) {
            const root = document.documentElement
            root.classList.remove("theme-green", "theme-purple")
            if (savedColorScheme === "green") {
                root.classList.add("theme-green")
            } else if (savedColorScheme === "purple") {
                root.classList.add("theme-purple")
            }
        }
    }, [])
    return null
}

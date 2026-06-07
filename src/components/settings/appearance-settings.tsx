"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Palette, Moon, Sun, Laptop } from "lucide-react"

import { useTheme } from "next-themes"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [colorScheme, setColorScheme] = useState("blue")

  useEffect(() => {
    setMounted(true)
    // Apply saved color scheme on mount
    const savedColorScheme = localStorage.getItem("safedriver-color-scheme")
    if (savedColorScheme) {
      setColorScheme(savedColorScheme)
    }
  }, [])

  // Apply color scheme whenever it changes
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove("theme-green", "theme-purple")

    if (colorScheme === "green") {
      root.classList.add("theme-green")
    } else if (colorScheme === "purple") {
      root.classList.add("theme-purple")
    }

    // Save to localStorage
    localStorage.setItem("safedriver-color-scheme", colorScheme)
  }, [colorScheme, mounted])

  // Avoid hydration mismatch by rendering a skeleton or null until mounted
  if (!mounted) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your SafeDriver interface.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Theme</h3>

          <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="light" id="theme-light" className="sr-only" />
              <Label
                htmlFor="theme-light"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${theme === "light" ? "border-primary" : ""
                  }`}
              >
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
            </div>

            <div>
              <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
              <Label
                htmlFor="theme-dark"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${theme === "dark" ? "border-primary" : ""
                  }`}
              >
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
            </div>

            <div>
              <RadioGroupItem value="system" id="theme-system" className="sr-only" />
              <Label
                htmlFor="theme-system"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${theme === "system" ? "border-primary" : ""
                  }`}
              >
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Color Scheme</h3>

          <RadioGroup value={colorScheme} onValueChange={setColorScheme} className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="blue" id="color-blue" className="sr-only" />
              <Label
                htmlFor="color-blue"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${colorScheme === "blue" ? "border-primary" : ""
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 mb-3"></div>
                Blue
              </Label>
            </div>

            <div>
              <RadioGroupItem value="green" id="color-green" className="sr-only" />
              <Label
                htmlFor="color-green"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${colorScheme === "green" ? "border-primary" : ""
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-green-600 mb-3"></div>
                Green
              </Label>
            </div>

            <div>
              <RadioGroupItem value="purple" id="color-purple" className="sr-only" />
              <Label
                htmlFor="color-purple"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${colorScheme === "purple" ? "border-primary" : ""
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-purple-600 mb-3"></div>
                Purple
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full">
            <Palette className="mr-2 h-4 w-4" />
            Reset to Default Appearance
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

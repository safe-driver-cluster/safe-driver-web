"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Palette, Moon, Sun, Laptop } from "lucide-react"

import { useTheme } from "next-themes"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [colorScheme, setColorScheme] = useState("blue")
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [dashboardLayout, setDashboardLayout] = useState("grid")

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

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Accessibility</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
            </div>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
            </div>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium (Default)</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="x-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Layout Preferences</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-compact">Compact Sidebar</Label>
              <p className="text-sm text-muted-foreground">Use a more compact sidebar layout</p>
            </div>
            <Switch id="sidebar-compact" checked={sidebarCompact} onCheckedChange={setSidebarCompact} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
            <Select value={dashboardLayout} onValueChange={setDashboardLayout}>
              <SelectTrigger id="dashboard-layout">
                <SelectValue placeholder="Select dashboard layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid (Default)</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

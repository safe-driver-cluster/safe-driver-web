"use client"

import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: t("settings_saved") || "Settings saved",
      description: t("settings_saved_desc") || "Your settings have been saved successfully.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("theme") || "Theme"}</Label>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System Default</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave}>{t("save") || "Save Changes"}</Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { firestoreService } from "@/lib/firebase/firestore"
import { Language } from "@/lib/translations"

export function GeneralSettings() {
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleLanguageChange = (val: Language) => {
    setLanguage(val)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Store in firebase as requested
      await firestoreService.setDocument("settings", "general", {
        language,
        updatedAt: new Date().toISOString()
      })
      toast({
        title: t("settings_saved") || "Settings saved",
        description: t("settings_saved_desc") || "Your settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings to Firebase.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("language") || "Language"}</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">ENGLISH</SelectItem>
            <SelectItem value="si-LK">SINHALA</SelectItem>
            <SelectItem value="ta-LK">TAMIL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : (t("save") || "Save Changes")}
      </Button>
    </div>
  )
}

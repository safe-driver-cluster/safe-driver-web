"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { firestoreService } from "@/lib/firebase/firestore"
import { Language } from "@/lib/translations"
import { Globe2, Languages } from "lucide-react"

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

  const languages = [
    { id: "en-US" as Language, label: "English", nativeLabel: "English", icon: Globe2 },
    { id: "si-LK" as Language, label: "Sinhala", nativeLabel: "සිංහල", icon: Languages },
    { id: "ta-LK" as Language, label: "Tamil", nativeLabel: "தமிழ்", icon: Languages },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {languages.map((lItem) => {
          const Icon = lItem.icon
          const isActive = language === lItem.id
          
          return (
            <div
              key={lItem.id}
              onClick={() => handleLanguageChange(lItem.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                isActive 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className={`p-3 rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{lItem.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{lItem.nativeLabel}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
          {isSaving ? "Saving..." : (t("save") || "Save Changes")}
        </Button>
      </div>
    </div>
  )
}

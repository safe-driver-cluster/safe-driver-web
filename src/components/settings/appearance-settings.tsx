"use client"

import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Sun, Moon, Monitor } from "lucide-react"

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

  const themes = [
    { id: "light", label: "Light", icon: Sun, desc: "Clean and bright" },
    { id: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    { id: "system", label: "System", icon: Monitor, desc: "Follows system setting" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((tItem) => {
          const Icon = tItem.icon
          const isActive = theme === tItem.id
          
          return (
            <div
              key={tItem.id}
              onClick={() => setTheme(tItem.id)}
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
                  <div className="font-semibold">{tItem.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tItem.desc}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="min-w-[120px]">{t("save") || "Save Changes"}</Button>
      </div>
    </div>
  )
}

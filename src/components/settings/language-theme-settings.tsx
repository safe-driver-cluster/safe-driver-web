"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"
import { GeneralSettings } from "./general-settings"
import { AppearanceSettings } from "./appearance-settings"

export function LanguageThemeSettings() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("system_settings") || "System Settings"}</h1>
        <p className="text-muted-foreground mt-2">{t("system_settings_desc") || "Manage your language and theme preferences."}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("general") || "General"}</CardTitle>
            <CardDescription>{t("manage_language") || "Manage language preferences"}</CardDescription>
          </CardHeader>
          <CardContent>
            <GeneralSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearance") || "Appearance"}</CardTitle>
            <CardDescription>{t("manage_theme") || "Manage theme preferences"}</CardDescription>
          </CardHeader>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

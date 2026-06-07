"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Terminal, AlertTriangle, RefreshCw, Trash2, Download, FileJson, UploadCloud } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdvancedSettings() {
  const [debugMode, setDebugMode] = useState(false)
  const [apiLogging, setApiLogging] = useState(false)
  const [experimentalFeatures, setExperimentalFeatures] = useState(false)
  const [cacheStrategy, setCacheStrategy] = useState("balanced")
  const [customCss, setCustomCss] = useState("")
  const [customJs, setCustomJs] = useState("")
  const [apiRateLimit, setApiRateLimit] = useState("100")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>
          Configure advanced system settings. These settings are intended for advanced users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            These settings are for advanced users only. Incorrect configuration may affect system performance or
            stability.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Development Options</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="debug-mode" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" /> Debug Mode
              </Label>
              <p className="text-sm text-muted-foreground">Enable detailed logging and debugging tools</p>
            </div>
            <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="api-logging">API Request Logging</Label>
              <p className="text-sm text-muted-foreground">Log all API requests and responses</p>
            </div>
            <Switch id="api-logging" checked={apiLogging} onCheckedChange={setApiLogging} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="experimental-features">Experimental Features</Label>
              <p className="text-sm text-muted-foreground">Enable experimental features and functionality</p>
            </div>
            <Switch
              id="experimental-features"
              checked={experimentalFeatures}
              onCheckedChange={setExperimentalFeatures}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Performance Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="cache-strategy">Cache Strategy</Label>
            <Select value={cacheStrategy} onValueChange={setCacheStrategy}>
              <SelectTrigger id="cache-strategy">
                <SelectValue placeholder="Select cache strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aggressive">Aggressive (Better Performance)</SelectItem>
                <SelectItem value="balanced">Balanced (Default)</SelectItem>
                <SelectItem value="conservative">Conservative (Less Memory)</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Controls how aggressively the system caches data.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
            <Input
              id="api-rate-limit"
              type="number"
              value={apiRateLimit}
              onChange={(e) => setApiRateLimit(e.target.value)}
              min="1"
              max="1000"
            />
            <p className="text-sm text-muted-foreground">Maximum number of API requests per minute per user.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Custom Code</h3>

          <div className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder="/* Add your custom CSS here */"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">Custom CSS will be applied to all pages. Use with caution.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-js">Custom JavaScript</Label>
            <Textarea
              id="custom-js"
              value={customJs}
              onChange={(e) => setCustomJs(e.target.value)}
              placeholder="// Add your custom JavaScript here"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Custom JavaScript will be executed on all pages. Use with extreme caution.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">System Maintenance</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear System Cache
            </Button>

            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Configuration
            </Button>

            <Button variant="outline" className="w-full">
              <UploadCloud className="mr-2 h-4 w-4" />
              Import Configuration
            </Button>

            <Button variant="outline" className="w-full">
              <FileJson className="mr-2 h-4 w-4" />
              View System Logs
            </Button>
          </div>

          <div className="pt-4">
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Reset All Settings to Default
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

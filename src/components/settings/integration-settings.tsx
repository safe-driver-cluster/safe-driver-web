"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, MessageSquare, Map, Truck, BarChart, RefreshCw, Check, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function IntegrationSettings() {
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(true)
  const [twilioEnabled, setTwilioEnabled] = useState(false)
  const [weatherApiEnabled, setWeatherApiEnabled] = useState(true)
  const [fleetIoEnabled, setFleetIoEnabled] = useState(true)
  const [powerBiEnabled, setPowerBiEnabled] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Settings</CardTitle>
        <CardDescription>Configure third-party integrations and API connections.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="maps" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <Map className="h-4 w-4" /> Maps
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Messaging
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Weather
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Fleet
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Webhooks
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="maps">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Map className="h-5 w-5" /> Google Maps API
                    </h3>
                    <p className="text-sm text-muted-foreground">Integration for maps, geocoding, and routing</p>
                  </div>
                  <Badge variant={googleMapsEnabled ? "success" : "outline"}>
                    {googleMapsEnabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="google-maps-enabled">Enable Google Maps</Label>
                    <p className="text-sm text-muted-foreground">Use Google Maps for mapping and routing</p>
                  </div>
                  <Switch id="google-maps-enabled" checked={googleMapsEnabled} onCheckedChange={setGoogleMapsEnabled} />
                </div>

                {googleMapsEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="google-maps-api-key">API Key</Label>
                      <Input id="google-maps-api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Update API Key
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Test Connection
                      </Button>
                    </div>

                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Connection successful</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Google Maps API is properly configured and working.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messaging">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> Twilio API
                    </h3>
                    <p className="text-sm text-muted-foreground">Integration for SMS and voice communications</p>
                  </div>
                  <Badge variant={twilioEnabled ? "success" : "outline"}>
                    {twilioEnabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="twilio-enabled">Enable Twilio</Label>
                    <p className="text-sm text-muted-foreground">Use Twilio for SMS notifications and alerts</p>
                  </div>
                  <Switch id="twilio-enabled" checked={twilioEnabled} onCheckedChange={setTwilioEnabled} />
                </div>

                {twilioEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="twilio-account-sid">Account SID</Label>
                      <Input id="twilio-account-sid" placeholder="Enter your Twilio Account SID" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twilio-auth-token">Auth Token</Label>
                      <Input id="twilio-auth-token" type="password" placeholder="Enter your Twilio Auth Token" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twilio-phone-number">Twilio Phone Number</Label>
                      <Input id="twilio-phone-number" placeholder="+1234567890" />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Save Credentials
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Test Connection
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weather">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Globe className="h-5 w-5" /> Weather API
                    </h3>
                    <p className="text-sm text-muted-foreground">Integration for weather data and forecasts</p>
                  </div>
                  <Badge variant={weatherApiEnabled ? "success" : "outline"}>
                    {weatherApiEnabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="weather-api-enabled">Enable Weather API</Label>
                    <p className="text-sm text-muted-foreground">Use weather data for route planning and alerts</p>
                  </div>
                  <Switch id="weather-api-enabled" checked={weatherApiEnabled} onCheckedChange={setWeatherApiEnabled} />
                </div>

                {weatherApiEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="weather-api-key">API Key</Label>
                      <Input id="weather-api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Update API Key
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Test Connection
                      </Button>
                    </div>

                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Connection successful</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Weather API is properly configured and working.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="fleet">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Truck className="h-5 w-5" /> FleetIO API
                    </h3>
                    <p className="text-sm text-muted-foreground">Integration for fleet management and maintenance</p>
                  </div>
                  <Badge variant={fleetIoEnabled ? "success" : "outline"}>
                    {fleetIoEnabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="fleetio-enabled">Enable FleetIO</Label>
                    <p className="text-sm text-muted-foreground">Use FleetIO for vehicle maintenance tracking</p>
                  </div>
                  <Switch id="fleetio-enabled" checked={fleetIoEnabled} onCheckedChange={setFleetIoEnabled} />
                </div>

                {fleetIoEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fleetio-api-key">API Key</Label>
                      <Input id="fleetio-api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Update API Key
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Test Connection
                      </Button>
                    </div>

                    <div className="rounded-md bg-green-50 p-4 border border-green-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Connection successful</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>FleetIO API is properly configured and working.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <BarChart className="h-5 w-5" /> Power BI Integration
                    </h3>
                    <p className="text-sm text-muted-foreground">Integration for advanced analytics and reporting</p>
                  </div>
                  <Badge variant={powerBiEnabled ? "success" : "outline"}>
                    {powerBiEnabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="powerbi-enabled">Enable Power BI</Label>
                    <p className="text-sm text-muted-foreground">Use Power BI for advanced analytics and dashboards</p>
                  </div>
                  <Switch id="powerbi-enabled" checked={powerBiEnabled} onCheckedChange={setPowerBiEnabled} />
                </div>

                {powerBiEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="powerbi-workspace-id">Workspace ID</Label>
                      <Input id="powerbi-workspace-id" placeholder="Enter your Power BI Workspace ID" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="powerbi-client-id">Client ID</Label>
                      <Input id="powerbi-client-id" placeholder="Enter your Power BI Client ID" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="powerbi-client-secret">Client Secret</Label>
                      <Input
                        id="powerbi-client-secret"
                        type="password"
                        placeholder="Enter your Power BI Client Secret"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        Save Credentials
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Test Connection
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="webhooks">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" /> Webhook Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">Configure webhooks for real-time event notifications</p>
                </div>

                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Webhook Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Use the following URL to receive webhook notifications:</p>
                        <code className="mt-1 block bg-blue-100 p-2 rounded">
                          https://safedriver.app/api/webhooks/incoming
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-secret"
                      type="password"
                      value="••••••••••••••••••••••••••••••"
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">This secret is used to verify webhook requests.</p>
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Manage Webhook Events
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Brain,
  TrendingUp,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Target,
  Cpu,
  Database,
  Activity,
} from "lucide-react"
import { regulatoryMonitoringService } from "@/lib/regulatory-monitoring-service"

export function MLModelDashboard() {
  const [modelPerformance, setModelPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)

  useEffect(() => {
    loadModelPerformance()
  }, [])

  const loadModelPerformance = async () => {
    setLoading(true)
    try {
      const performance = await regulatoryMonitoringService.getMLModelPerformance()
      setModelPerformance(performance)
    } catch (error) {
      console.error("Error loading model performance:", error)
    } finally {
      setLoading(false)
    }
  }

  const retrainModels = async (category?: string) => {
    setRetraining(true)
    try {
      const result = await regulatoryMonitoringService.retrainMLModels(category)
      console.log("Retraining result:", result)
      await loadModelPerformance() // Reload performance data
    } catch (error) {
      console.error("Error retraining models:", error)
    } finally {
      setRetraining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading ML model performance data...</span>
        </div>
      </div>
    )
  }

  if (!modelPerformance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ML Models Not Available</h3>
          <p className="text-muted-foreground">Unable to load ML model performance data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            ML Model Dashboard
          </h2>
          <p className="text-muted-foreground">Advanced machine learning models for regulatory intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadModelPerformance()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => retrainModels()} disabled={retraining}>
            <Zap className={`h-4 w-4 mr-2 ${retraining ? "animate-pulse" : ""}`} />
            {retraining ? "Retraining..." : "Retrain Models"}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(modelPerformance.overall.accuracy * 100)}%</div>
            <Progress value={modelPerformance.overall.accuracy * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Ensemble model performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              Active Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelPerformance.classification.length}</div>
            <p className="text-xs text-muted-foreground">Classification models</p>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">All models operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-orange-600" />
              Training Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelPerformance.classification.reduce((sum: number, model: any) => sum + model.trainingData.samples, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total training samples</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Model Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(modelPerformance.overall.confidence * 100)}%</div>
            <Progress value={modelPerformance.overall.confidence * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Prediction confidence</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="classification" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classification">Classification Models</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting Models</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="features">Feature Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="classification" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelPerformance.classification.map((model: any) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge variant={model.status === "ready" ? "default" : "secondary"}>
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Version {model.version} • {model.type} • Accuracy: {Math.round(model.accuracy * 100)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Training Samples</p>
                      <p className="text-2xl font-bold">{model.trainingData.samples.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Features</p>
                      <p className="text-2xl font-bold">{model.trainingData.features}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{Math.round(model.accuracy * 100)}%</span>
                    </div>
                    <Progress value={model.accuracy * 100} className="h-2" />
                  </div>

                  {model.metrics.precision && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Precision</span>
                        <span>{Math.round(model.metrics.precision * 100)}%</span>
                      </div>
                      <Progress value={model.metrics.precision * 100} className="h-2" />
                    </div>
                  )}

                  {model.metrics.recall && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Recall</span>
                        <span>{Math.round(model.metrics.recall * 100)}%</span>
                      </div>
                      <Progress value={model.metrics.recall * 100} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{model.name}</DialogTitle>
                          <DialogDescription>Detailed model information and metrics</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Model Configuration</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Type:</span> {model.type}</p>
                                <p><span className="font-medium">Version:</span> {model.version}</p>
                                <p><span className="font-medium">Status:</span> {model.status}</p>
                                <p><span className="font-medium">Labels:</span> {model.trainingData.labels}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Hyperparameters</h4>
                              <div className="space-y-1 text-sm">
                                {Object.entries(model.hyperparameters).map(([key, value]) => (
                                  <p key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>

                          {model.metrics.featureImportance && (
                            <div>
                              <h4 className="font-semibold mb-2">Feature Importance</h4>
                              <div className="space-y-2">
                                {model.metrics.featureImportance.map((feature: any, index: number) => (
                                  <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">{feature.feature}</span>
                                      <span>{Math.round(feature.importance * 100)}%</span>
                                    </div>
                                    <Progress value={feature.importance * 100} className="h-1" />
                                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => retrainModels()}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retrain Model
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Trend Forecasting Models
              </CardTitle>
              <CardDescription>
                Time series models for predicting regulatory trends and change patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modelPerformance.forecasting.models?.map((model: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{model.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span>{Math.round(model.accuracy * 100)}%</span>
                        </div>
                        <Progress value={model.accuracy * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-3 text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Forecasting models are being initialized...</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="font-semibold mb-2">Data Quality Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Categories</span>
                      <span>{modelPerformance.forecasting.dataQuality?.totalCategories || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Data Points</span>
                      <span>{Math.round(modelPerformance.forecasting.dataQuality?.avgDataPoints || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data Completeness</span>
                      <span>{Math.round((modelPerformance.forecasting.dataQuality?.dataCompleteness || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Model Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ensemble Accuracy</span>
                      <span>84%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prediction Horizon</span>
                      <span>12 months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Update Frequency</span>
                      <span>Weekly</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Model Accuracy Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelPerformance.classification.map((model: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{model.name}</span>
                        <span>{Math.round(model.accuracy * 100)}%</span>
                      </div>
                      <Progress value={model.accuracy * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Prediction Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round(modelPerformance.overall.confidence * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Average Confidence</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Confidence (&gt;90%)</span>
                      <span>67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium Confidence (70-90%)</span>
                      <span>28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low Confidence (&lt;70%)</span>
                      <span>5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription>
                Key features that drive model predictions across all classification models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modelPerformance.classification.map((model: any, modelIndex: number) => (
                  <div key={modelIndex}>
                    <h4 className="font-semibold mb-3">{model.name}</h4>
                    <div className="space-y-3">
                      {model.metrics.featureImportance?.map((feature: any, index: number) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{feature.feature}</span>
                            <span>{Math.round(feature.importance * 100)}%</span>
                          </div>
                          <Progress value={feature.importance * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      )) || (
                        <p className="text-sm text-muted-foreground">Feature importance data not available</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

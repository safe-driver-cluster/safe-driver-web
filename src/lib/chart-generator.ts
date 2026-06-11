import { Chart, type ChartConfiguration, type ChartTypeRegistry } from "chart.js/auto"

interface ChartOptions {
  type: keyof ChartTypeRegistry
  data: any
  options?: any
  width?: number
  height?: number
}

/**
 * Generates a chart image as a base64 data URL
 */
export const generateChartImage = async (config: ChartOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas")
      canvas.width = config.width || 600
      canvas.height = config.height || 400

      // Temporarily add to DOM for rendering
      canvas.style.position = "absolute"
      canvas.style.left = "-9999px"
      document.body.appendChild(canvas)

      // Create chart configuration
      const chartConfig: ChartConfiguration = {
        type: config.type,
        data: config.data,
        options: {
          responsive: false,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                font: {
                  size: 12,
                },
                padding: 15,
              },
            },
            ...config.options?.plugins,
          },
          ...config.options,
        },
      }

      // Create the chart
      const chart = new Chart(canvas, chartConfig)

      // Convert to image after a short delay to ensure rendering
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL("image/png", 1.0)
          chart.destroy()
          document.body.removeChild(canvas)
          resolve(dataUrl)
        } catch (error) {
          chart.destroy()
          document.body.removeChild(canvas)
          reject(error)
        }
      }, 500)
    } catch (error) {
      console.error("Error generating chart:", error)
      reject("Failed to generate chart")
    }
  })
}

/**
 * Generates an alert distribution pie chart
 */
export const generateAlertDistributionChart = async (alerts: any[]): Promise<string> => {
  const alertTypes = alerts.map((alert) => alert.type)
  const alertCounts = alerts.map((alert) => alert.count)

  return generateChartImage({
    type: "pie",
    width: 500,
    height: 300,
    data: {
      labels: alertTypes,
      datasets: [
        {
          data: alertCounts,
          backgroundColor: [
            "rgba(220, 38, 38, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(234, 179, 8, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Alert Distribution by Type",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
  })
}


/**
 * Generates a line chart for alert trends over time
 */
export const generateAlertTrendChart = async (data: any): Promise<string> => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const drowsinessData = [65, 59, 80, 81, 56, 55]
  const phoneUsageData = [28, 48, 40, 19, 36, 27]
  const distractionData = [18, 12, 20, 15, 17, 10]

  return generateChartImage({
    type: "line",
    width: 600,
    height: 350,
    data: {
      labels: months,
      datasets: [
        {
          label: "Drowsiness",
          data: drowsinessData,
          borderColor: "rgba(220, 38, 38, 1)",
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Phone Usage",
          data: phoneUsageData,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Distraction",
          data: distractionData,
          borderColor: "rgba(234, 179, 8, 1)",
          backgroundColor: "rgba(234, 179, 8, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Alerts",
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Alert Trends Over Time",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
  })
}

/**
 * Generates a radar chart for route safety analysis
 */
export const generateRouteSafetyRadarChart = async (routes: any[]): Promise<string> => {
  const topRoutes = routes.slice(0, 5)
  const routeNames = topRoutes.map((route) => route.name.split(" - ")[0])

  return generateChartImage({
    type: "radar",
    width: 500,
    height: 400,
    data: {
      labels: ["Efficiency Score", "Driver Rating", "Road Condition", "Incident Rate", "Compliance"],
      datasets: topRoutes.map((route, index) => ({
        label: routeNames[index],
        data: [
          route.efficiency || 85,
          Math.floor(Math.random() * 20) + 80,
          Math.floor(Math.random() * 30) + 70,
          100 - Math.floor(Math.random() * 20) - index * 5,
          Math.floor(Math.random() * 15) + 85,
        ],
        backgroundColor: `rgba(${59 + index * 40}, ${130 - index * 20}, ${246 - index * 30}, 0.2)`,
        borderColor: `rgba(${59 + index * 40}, ${130 - index * 20}, ${246 - index * 30}, 1)`,
        pointBackgroundColor: `rgba(${59 + index * 40}, ${130 - index * 20}, ${246 - index * 30}, 1)`,
      })),
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Route Safety Analysis",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
  })
}

/**
 * Generates a compliance gauge chart
 */
export const generateComplianceChart = async (compliance: any): Promise<string> => {
  const scores = [
    compliance.driverLicenseValidity || 0,
    compliance.vehicleInspections || 0,
    compliance.safetyTraining || 0,
    compliance.emergencyProtocols || 0,
    compliance.dataReporting || 0,
  ]

  return generateChartImage({
    type: "doughnut",
    width: 400,
    height: 400,
    data: {
      labels: [
        "Driver License Validity",
        "Vehicle Inspections",
        "Safety Training",
        "Emergency Protocols",
        "Data Reporting",
      ],
      datasets: [
        {
          data: scores,
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(249, 115, 22, 0.8)",
            "rgba(234, 179, 8, 0.8)",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      cutout: "60%",
      plugins: {
        title: {
          display: true,
          text: "Compliance Metrics",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
  })
}

/**
 * Generates a bar chart for Safety Incidents Summary (Drowsiness, Distraction, Object Detection)
 */
export const generateIncidentBarChart = async (counts: {
  drowsiness: number
  distraction: number
  phone: number
  smoking: number
  drinking: number
}): Promise<string> => {
  const totalObjectDetection = counts.phone + counts.smoking + counts.drinking

  return generateChartImage({
    type: "bar",
    width: 600,
    height: 300,
    data: {
      labels: [
        "Drowsiness",
        "Distraction",
        `Object Detection (Total: ${totalObjectDetection})`,
        "  • Mobile Phone",
        "  • Smoking",
        "  • Drinking"
      ],
      datasets: [
        {
          data: [
            counts.drowsiness,
            counts.distraction,
            totalObjectDetection,
            counts.phone,
            counts.smoking,
            counts.drinking
          ],
          backgroundColor: [
            "rgba(239, 68, 68, 0.8)",   // Drowsiness: Red
            "rgba(245, 158, 11, 0.8)",  // Distraction: Amber
            "rgba(37, 99, 235, 0.85)",  // Object Detection: Blue
            "rgba(59, 130, 246, 0.6)",  // Phone: Light Blue
            "rgba(71, 85, 105, 0.6)",   // Smoking: Slate
            "rgba(99, 102, 241, 0.6)"   // Drinking: Indigo
          ],
          borderColor: [
            "rgb(239, 68, 68)",
            "rgb(245, 158, 11)",
            "rgb(37, 99, 235)",
            "rgb(59, 130, 246)",
            "rgb(71, 85, 105)",
            "rgb(99, 102, 241)"
          ],
          borderWidth: 1,
          barPercentage: 0.65,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal bar chart
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            font: {
              size: 10,
            },
          },
          title: {
            display: true,
            text: "Incident Count",
            font: {
              size: 11,
              weight: "bold",
            },
          },
        },
        y: {
          ticks: {
            font: {
              size: 10,
              weight: "bold",
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false, // Dataset labels are redundant here
        },
        title: {
          display: true,
          text: "Incident Summary Chart",
          font: {
            size: 13,
            weight: "bold",
          },
          padding: { bottom: 10 },
        },
      },
    },
  })
}

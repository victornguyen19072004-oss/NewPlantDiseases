"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ImageDimensionsHistogramProps {
  data: {
    image_dimensions: {
      widths: number[]
      heights: number[]
    }
  }
}

export default function ImageDimensionsHistogram({ data }: ImageDimensionsHistogramProps) {
  const widthChartRef = useRef<HTMLCanvasElement>(null)
  const heightChartRef = useRef<HTMLCanvasElement>(null)
  const widthChartInstance = useRef<Chart | null>(null)
  const heightChartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!widthChartRef.current || !heightChartRef.current) return

    // Width histogram
    const widthCtx = widthChartRef.current.getContext("2d")
    if (widthCtx) {
      if (widthChartInstance.current) {
        widthChartInstance.current.destroy()
      }

      const widthBins = Array.from({ length: 10 }, (_, i) => {
        const min = Math.min(...data.image_dimensions.widths)
        const max = Math.max(...data.image_dimensions.widths)
        const binSize = (max - min) / 10
        return Math.floor(min + binSize * i)
      })

      const widthCounts = widthBins.map((bin, i) => {
        const nextBin = i < widthBins.length - 1 ? widthBins[i + 1] : Math.max(...data.image_dimensions.widths)
        return data.image_dimensions.widths.filter((w) => w >= bin && w < nextBin).length
      })

      widthChartInstance.current = new Chart(widthCtx, {
        type: "bar",
        data: {
          labels: widthBins.map((b) => `${b}px`),
          datasets: [
            {
              label: "Chiều rộng (Width)",
              data: widthCounts,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "rgba(100, 116, 139, 1)",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "rgba(100, 116, 139, 1)",
              },
              grid: {
                color: "rgba(226, 232, 240, 0.1)",
              },
            },
            x: {
              ticks: {
                color: "rgba(100, 116, 139, 1)",
              },
              grid: {
                color: "rgba(226, 232, 240, 0.1)",
              },
            },
          },
        },
      })
    }

    // Height histogram
    const heightCtx = heightChartRef.current.getContext("2d")
    if (heightCtx) {
      if (heightChartInstance.current) {
        heightChartInstance.current.destroy()
      }

      const heightBins = Array.from({ length: 10 }, (_, i) => {
        const min = Math.min(...data.image_dimensions.heights)
        const max = Math.max(...data.image_dimensions.heights)
        const binSize = (max - min) / 10
        return Math.floor(min + binSize * i)
      })

      const heightCounts = heightBins.map((bin, i) => {
        const nextBin = i < heightBins.length - 1 ? heightBins[i + 1] : Math.max(...data.image_dimensions.heights)
        return data.image_dimensions.heights.filter((h) => h >= bin && h < nextBin).length
      })

      heightChartInstance.current = new Chart(heightCtx, {
        type: "bar",
        data: {
          labels: heightBins.map((b) => `${b}px`),
          datasets: [
            {
              label: "Chiều cao (Height)",
              data: heightCounts,
              backgroundColor: "rgba(34, 197, 94, 0.8)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: "rgba(100, 116, 139, 1)",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "rgba(100, 116, 139, 1)",
              },
              grid: {
                color: "rgba(226, 232, 240, 0.1)",
              },
            },
            x: {
              ticks: {
                color: "rgba(100, 116, 139, 1)",
              },
              grid: {
                color: "rgba(226, 232, 240, 0.1)",
              },
            },
          },
        },
      })
    }

    return () => {
      if (widthChartInstance.current) {
        widthChartInstance.current.destroy()
      }
      if (heightChartInstance.current) {
        heightChartInstance.current.destroy()
      }
    }
  }, [data.image_dimensions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố kích thước ảnh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: "300px" }}>
            <canvas ref={widthChartRef}></canvas>
          </div>
          <div style={{ height: "300px" }}>
            <canvas ref={heightChartRef}></canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClassDistributionChartProps {
  data: {
    classes: Array<{
      name: string
      train_count: number
      valid_count: number
    }>
  }
}

export default function ClassDistributionChart({ data }: ClassDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.classes) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.classes.map((c) => c.name),
        datasets: [
          {
            label: "Train",
            data: data.classes.map((c) => c.train_count),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
          {
            label: "Valid",
            data: data.classes.map((c) => c.valid_count),
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: "x",
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 15,
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
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {
              color: "rgba(226, 232, 240, 0.1)",
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data.classes])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố ảnh theo lớp (Train vs Valid)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: "800px", height: "400px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

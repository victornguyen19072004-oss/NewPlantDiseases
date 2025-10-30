"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrainValidRatioChartProps {
  data: {
    total_train: number
    total_valid: number
  }
}

export default function TrainValidRatioChart({ data }: TrainValidRatioChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Train", "Valid"],
        datasets: [
          {
            data: [data.total_train, data.total_valid],
            backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(34, 197, 94, 0.8)"],
            borderColor: ["rgba(59, 130, 246, 1)", "rgba(34, 197, 94, 1)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 15,
              color: "rgba(100, 116, 139, 1)",
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
  }, [data.total_train, data.total_valid])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tỷ lệ Train/Valid</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "300px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

export default function TopClassesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Mock data for top 10 classes
    const labels = [
      "Tomato Healthy",
      "Potato Healthy",
      "Corn Healthy",
      "Tomato Early Blight",
      "Potato Late Blight",
      "Corn Leaf Spot",
      "Tomato Septoria",
      "Potato Scab",
      "Corn Rust",
      "Tomato Powdery Mildew",
    ]

    const easyClasses = [0.96, 0.94, 0.92, 0.88, 0.85, 0.82, 0.8, 0.78, 0.75, 0.72]
    const hardClasses = [0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.92, 0.94, 0.96]

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Easy Classes",
            data: easyClasses,
            backgroundColor: "hsl(142, 70%, 50%)",
            borderRadius: 4,
          },
          {
            label: "Hard Classes",
            data: hardClasses,
            backgroundColor: "hsl(30, 80%, 50%)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: "y",
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "hsl(var(--color-foreground))",
              font: { size: 12 },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 1,
            ticks: {
              color: "hsl(var(--color-muted-foreground))",
              callback: (value) => `${((value as number) * 100).toFixed(0)}%`,
            },
            grid: {
              color: "hsl(var(--color-border))",
            },
          },
          y: {
            ticks: {
              color: "hsl(var(--color-muted-foreground))",
              font: { size: 11 },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  return <canvas ref={canvasRef} />
}

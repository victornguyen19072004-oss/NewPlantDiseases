"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

export default function AccuracyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Mock training data
    const epochs = Array.from({ length: 150 }, (_, i) => i + 1)
    const trainAccuracy = epochs.map((e) => {
      const base = 0.5 + (e / 150) * 0.45
      return base + Math.random() * 0.02
    })
    const validAccuracy = epochs.map((e) => {
      const base = 0.48 + (e / 150) * 0.46
      return Math.max(0, base + (Math.random() - 0.5) * 0.03)
    })

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: epochs,
        datasets: [
          {
            label: "Train Accuracy",
            data: trainAccuracy,
            borderColor: "hsl(142, 70%, 50%)",
            backgroundColor: "hsl(142, 70%, 50%, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
          {
            label: "Validation Accuracy",
            data: validAccuracy,
            borderColor: "hsl(200, 70%, 50%)",
            backgroundColor: "hsl(200, 70%, 50%, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "hsl(var(--color-foreground))",
              font: { size: 12 },
              usePointStyle: true,
            },
          },
        },
        scales: {
          y: {
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
          x: {
            ticks: {
              color: "hsl(var(--color-muted-foreground))",
              maxTicksLimit: 10,
            },
            grid: {
              color: "hsl(var(--color-border))",
              drawBorder: false,
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

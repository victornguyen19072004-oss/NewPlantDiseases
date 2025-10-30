"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlantDiseaseChartProps {
  data: {
    plants: Array<{
      name: string
      num_diseases: number
      percentage: number
    }>
  }
}

export default function PlantDiseaseChart({ data }: PlantDiseaseChartProps) {
  const chartData = useMemo(() => {
    return data.plants.map((plant) => ({
      name: plant.name,
      diseases: plant.num_diseases,
      percentage: plant.percentage,
    }))
  }, [data])

  const colors = chartData.map((item) => (item.name === "Tomato" ? "#ef4444" : "hsl(var(--color-primary))"))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Số lượng class mỗi cây</CardTitle>
        <CardDescription>Số bệnh trên mỗi loại cây (Tomato có 10 bệnh – chiếm 26.3%)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300} minWidth={600}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: "hsl(var(--color-foreground))", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "hsl(var(--color-foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--color-card))",
                  border: "1px solid hsl(var(--color-border))",
                  borderRadius: "8px",
                  color: "hsl(var(--color-foreground))",
                }}
                formatter={(value, name) => {
                  if (name === "diseases") return [`${value} bệnh`, "Số bệnh"]
                  return [value, name]
                }}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="diseases" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

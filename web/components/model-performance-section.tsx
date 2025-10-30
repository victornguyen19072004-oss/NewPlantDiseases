"use client"

import { useEffect, useState } from "react"
import ModelCard from "./model-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Model {
  name: string
  accuracy: number
  f1: number
  time: number
  size: number
}

interface ModelData {
  models: Model[]
  best_model: string
}

export default function ModelPerformanceSection() {
  const [data, setData] = useState<ModelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/data/model_data.json")
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(err => {
        console.error("Lỗi fetch model_data.json:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Model Performance</h2>
          <p className="text-sm text-muted-foreground">Comparison of trained models</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.models || data.models.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không có dữ liệu mô hình. Chạy <code className="bg-muted px-2 py-1 rounded">evaluation.py</code> và <code className="bg-muted px-2 py-1 rounded">update_web_data.py</code>
      </div>
    )
  }

  const bestModelName = data.best_model

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Model Performance</h2>
          {bestModelName && (
            <Badge variant="default" className="bg-green-600 text-white">
              Best: {bestModelName}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">So sánh các mô hình đã huấn luyện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.models.map((model) => (
          <ModelCard
            key={model.name}
            model={{
              name: model.name,
              bestValidAcc: `${model.accuracy.toFixed(2)}%`,
              f1Score: `${model.f1.toFixed(2)}%`,
              inferenceTime: `${model.time} ms/batch`,
              modelSize: `${model.size} MB`,
              isBest: model.name === bestModelName
            }}
          />
        ))}
      </div>
    </div>
  )
}
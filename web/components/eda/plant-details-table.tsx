import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EDASummary {
  total_samples: number
  num_classes: number
  train_samples: number
  valid_samples: number
  imbalance_ratio: number
  max_class: string
  max_count: number
  min_class: string
  min_count: number
}

export function EDASection() {
  const [eda, setEda] = useState<EDASummary | null>(null)

  useEffect(() => {
    fetch("/eda_summary.json")
      .then((r) => r.json())
      .then(setEda)
      .catch(() => console.error("Không tải được EDA summary"))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-green-700">
        Phân Tích Dữ Liệu Khám Phá (EDA)
      </h2>

      {eda && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tổng ảnh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eda.total_samples.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Số lớp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eda.num_classes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ mất cân bằng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eda.imbalance_ratio}:1</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="font-medium mb-2">Phân bố lớp</p>
          <img src="/plots/eda_class_distribution.png" alt="Class Dist" className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="text-center">
          <p className="font-medium mb-2">Train vs Valid</p>
          <img src="/plots/eda_train_valid_split.png" alt="Split" className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="text-center">
          <p className="font-medium mb-2 text-green-700">Top 10 nhiều ảnh</p>
          <img src="/plots/eda_top10_classes.png" alt="Top 10" className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="text-center">
          <p className="font-medium mb-2 text-red-700">Top 10 ít ảnh</p>
          <img src="/plots/eda_bottom10_classes.png" alt="Bottom 10" className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="text-center md:col-span-2 lg:col-span-1">
          <p className="font-medium mb-2">Số bệnh mỗi cây</p>
          <img src="/plots/eda_plant_distribution.png" alt="Plant Dist" className="w-full rounded-lg shadow-lg" />
        </div>
      </div>

      {eda && (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Nhiều nhất: <Badge variant="secondary">{eda.max_class}</Badge> ({eda.max_count} ảnh)</p>
          <p>Ít nhất: <Badge variant="secondary">{eda.min_class}</Badge> ({eda.min_count} ảnh)</p>
        </div>
      )}
    </div>
  )
}